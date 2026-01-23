/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 공유 이미지 유틸리티 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  canvasToDataUrl,
  downloadBlob,
  canShareFiles,
} from '../shareUtils';

// html2canvas와 DOM API를 모킹
describe('shareUtils', () => {
  describe('canvasToDataUrl', () => {
    it('should call canvas.toDataURL with correct parameters', () => {
      const mockDataUrl = 'data:image/png;base64,mockdata';
      const mockCanvas = {
        toDataURL: vi.fn().mockReturnValue(mockDataUrl),
      } as unknown as HTMLCanvasElement;

      const result = canvasToDataUrl(mockCanvas);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.92);
      expect(result).toBe(mockDataUrl);
    });

    it('should respect quality parameter', () => {
      const mockDataUrl = 'data:image/png;base64,mockdata';
      const mockCanvas = {
        toDataURL: vi.fn().mockReturnValue(mockDataUrl),
      } as unknown as HTMLCanvasElement;

      canvasToDataUrl(mockCanvas, 0.5);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.5);
    });
  });

  describe('downloadBlob', () => {
    let clickSpy: ReturnType<typeof vi.fn>;
    let originalCreateObjectURL: typeof URL.createObjectURL;
    let originalRevokeObjectURL: typeof URL.revokeObjectURL;

    beforeEach(() => {
      clickSpy = vi.fn();

      // Store original URL methods
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;

      // Mock URL methods
      URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
      URL.revokeObjectURL = vi.fn();

      // Mock createElement for anchor element
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const element = originalCreateElement(tag as any);
        if (tag === 'a') {
          element.click = clickSpy;
        }
        return element;
      });

      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    });

    afterEach(() => {
      // Restore original URL methods
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      vi.restoreAllMocks();
    });

    it('should create blob URL and trigger download', () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const filename = 'test.png';

      downloadBlob(blob, filename);

      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(clickSpy).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should set correct download filename', () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const filename = 'my-image.png';

      let capturedLink: HTMLAnchorElement | null = null;
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        capturedLink = node as HTMLAnchorElement;
        return node;
      });

      downloadBlob(blob, filename);

      expect(capturedLink).not.toBeNull();
      expect(capturedLink!.download).toBe(filename);
      expect(capturedLink!.href).toBe('blob:test-url');
    });
  });

  describe('canShareFiles', () => {
    const originalNavigator = global.navigator;

    afterEach(() => {
      // Restore original navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });

    it('should return false if canShare is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      expect(canShareFiles()).toBe(false);
    });

    it('should return true if file sharing is supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          canShare: vi.fn().mockReturnValue(true),
        },
        writable: true,
      });

      expect(canShareFiles()).toBe(true);
    });

    it('should return false if file sharing is not supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          canShare: vi.fn().mockReturnValue(false),
        },
        writable: true,
      });

      expect(canShareFiles()).toBe(false);
    });
  });
});
