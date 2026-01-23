/**
 * 공유 이미지 생성 유틸리티
 * html2canvas를 사용하여 결과 화면을 이미지로 캡처하고 공유합니다.
 */
import html2canvas from 'html2canvas';

export interface ShareImageOptions {
  scale?: number;
  backgroundColor?: string;
  quality?: number;
}

const DEFAULT_OPTIONS: Required<ShareImageOptions> = {
  scale: 2,
  backgroundColor: '#0a0a0a',
  quality: 0.92,
};

/**
 * HTML 요소를 Canvas로 변환
 */
export async function elementToCanvas(
  element: HTMLElement,
  options: ShareImageOptions = {}
): Promise<HTMLCanvasElement> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const canvas = await html2canvas(element, {
    scale: mergedOptions.scale,
    backgroundColor: mergedOptions.backgroundColor,
    useCORS: true,
    logging: false,
    // 애니메이션 및 스크롤 무시
    scrollY: 0,
    scrollX: 0,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  return canvas;
}

/**
 * Canvas를 Blob으로 변환
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number = DEFAULT_OPTIONS.quality
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob 변환 실패'));
        }
      },
      'image/png',
      quality
    );
  });
}

/**
 * Canvas를 Data URL로 변환
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  quality: number = DEFAULT_OPTIONS.quality
): string {
  return canvas.toDataURL('image/png', quality);
}

/**
 * HTML 요소를 이미지 Blob으로 변환
 */
export async function elementToBlob(
  element: HTMLElement,
  options: ShareImageOptions = {}
): Promise<Blob> {
  const canvas = await elementToCanvas(element, options);
  return canvasToBlob(canvas, options.quality ?? DEFAULT_OPTIONS.quality);
}

/**
 * Blob을 다운로드
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * HTML 요소를 이미지로 다운로드
 */
export async function downloadElementAsImage(
  element: HTMLElement,
  filename: string = 'share-result.png',
  options: ShareImageOptions = {}
): Promise<void> {
  const blob = await elementToBlob(element, options);
  downloadBlob(blob, filename);
}

/**
 * Web Share API를 사용하여 이미지 공유
 * @returns 공유 성공 여부
 */
export async function shareImage(
  blob: Blob,
  shareData: {
    title?: string;
    text?: string;
  }
): Promise<boolean> {
  // Web Share API 파일 공유 지원 확인
  if (!navigator.canShare) {
    return false;
  }

  const file = new File([blob], 'result.png', { type: 'image/png' });
  const data = {
    ...shareData,
    files: [file],
  };

  if (!navigator.canShare(data)) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    // 사용자가 공유를 취소한 경우
    if (error instanceof Error && error.name === 'AbortError') {
      return false;
    }
    throw error;
  }
}

/**
 * HTML 요소를 이미지로 캡처하여 Web Share API로 공유
 * 공유 불가능한 경우 이미지 다운로드로 폴백
 */
export async function shareOrDownloadElement(
  element: HTMLElement,
  shareData: {
    title?: string;
    text?: string;
    filename?: string;
  },
  options: ShareImageOptions = {}
): Promise<{ shared: boolean; downloaded: boolean }> {
  const blob = await elementToBlob(element, options);

  // Web Share API로 이미지 공유 시도
  const shared = await shareImage(blob, {
    title: shareData.title,
    text: shareData.text,
  });

  if (shared) {
    return { shared: true, downloaded: false };
  }

  // 공유 불가능한 경우 다운로드로 폴백
  downloadBlob(blob, shareData.filename ?? 'result.png');
  return { shared: false, downloaded: true };
}

/**
 * Web Share API 파일 공유 지원 여부 확인
 */
export function canShareFiles(): boolean {
  if (!navigator.canShare) {
    return false;
  }

  // 테스트용 빈 파일로 지원 여부 확인
  const testFile = new File([''], 'test.png', { type: 'image/png' });
  return navigator.canShare({ files: [testFile] });
}
