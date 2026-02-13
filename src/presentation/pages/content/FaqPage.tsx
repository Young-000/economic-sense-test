import { useState } from 'react';
import { ContentLayout } from '@presentation/components';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: '돈 감각 테스트는 무료인가요?',
    answer: '네, 완전 무료입니다! 회원가입도 필요 없고, 별도의 결제 없이 모든 기능을 이용할 수 있습니다. 게임 내 자산은 100% 가상 자금이므로 실제 돈이 사용되지 않습니다.',
  },
  {
    question: '실제 투자 조언인가요?',
    answer: '아닙니다. 돈 감각 테스트는 오락 목적의 게임이며, 실제 투자 조언이나 금융 자문이 아닙니다. 투자자 유형 분석과 티어 등급은 간단한 알고리즘에 기반한 재미 요소입니다.',
  },
  {
    question: '게임 결과는 어떻게 결정되나요?',
    answer: '각 선택지에 표시된 확률에 따라 결과가 결정됩니다. 예를 들어 "70% 확률로 +100만원"이면 70% 확률로 +100만원을 얻습니다. 실제 난수 생성을 사용하므로 매번 결과가 다릅니다.',
  },
  {
    question: '기대값은 무엇인가요?',
    answer: '기대값(Expected Value)은 각 결과의 금액에 확률을 곱해 합산한 값입니다. 예: "60% +100만원, 40% -50만원"이면 기대값은 (0.6×100)+(0.4×-50)=+40만원입니다. 기대값이 높은 선택이 평균적으로 유리합니다.',
  },
  {
    question: '투자자 유형은 어떻게 결정되나요?',
    answer: '공격성(리스크 선호도), 합리성(기대값 기반 선택 비율), 운 점수(실제 결과 vs 기대값)를 종합 분석하여 8가지 유형 중 하나가 결정됩니다. 같은 수익률이라도 선택 패턴에 따라 다른 유형이 나올 수 있습니다.',
  },
  {
    question: '티어 등급은 어떻게 결정되나요?',
    answer: 'SS(+80% 이상)부터 F(-60% 미만)까지 최종 수익률에 따라 7단계 등급이 부여됩니다. SS 등급은 전체의 약 2%만 달성하는 전설적인 등급입니다.',
  },
  {
    question: '랭킹은 어떻게 등록하나요?',
    answer: '게임 결과 화면에서 닉네임을 입력하고 "등록하기" 버튼을 누르면 됩니다. 닉네임은 한글, 영문, 숫자만 사용 가능하며, 20자 이하로 입력해주세요.',
  },
  {
    question: '업적은 어떻게 달성하나요?',
    answer: '특정 조건을 충족하면 자동으로 업적이 해금됩니다. 예: "첫 게임 완료", "수익률 50% 달성", "5연속 수익" 등 50가지 이상의 업적이 있습니다. 결과 화면에서 업적 목록을 확인할 수 있습니다.',
  },
  {
    question: '친구 대결은 어떻게 하나요?',
    answer: '결과 화면의 "도전장 링크 복사하기" 버튼을 누르면 도전 URL이 복사됩니다. 이 링크를 친구에게 보내면, 친구가 게임을 플레이한 후 서로의 수익률을 비교할 수 있습니다.',
  },
  {
    question: '게임 데이터는 어디에 저장되나요?',
    answer: '게임 진행 데이터는 브라우저의 sessionStorage(현재 세션)에, 업적과 최고 기록은 localStorage(영구)에 저장됩니다. 랭킹은 서버(Supabase)에 저장됩니다. 브라우저 캐시를 삭제하면 로컬 데이터는 초기화될 수 있습니다.',
  },
  {
    question: '시즌 이벤트는 언제 열리나요?',
    answer: '봄(3-5월), 여름(6-8월), 가을(9-11월), 겨울(12-2월) 시즌과 함께 설날, 추석, 크리스마스, 할로윈 등 특별 이벤트가 진행됩니다. 시즌별로 다른 배너와 테마가 적용됩니다.',
  },
  {
    question: '극한 모드와 일반 모드의 차이점은?',
    answer: '일반 모드는 1,000만원으로 시작하여 현실적인 경제 선택을 하고, 극한 모드는 5,000만원으로 시작하여 하이리스크 하이리턴 선택지가 등장합니다. 두 모드 모두 10라운드로 구성됩니다.',
  },
];

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ContentLayout title="자주 묻는 질문">
      <section>
        <p>
          돈 감각 테스트에 대해 궁금한 점을 모았습니다.
          찾는 답변이 없다면 이메일(economic.sense.test@gmail.com)로 문의해주세요.
        </p>
      </section>

      <div className="faq-list" role="list">
        {FAQ_DATA.map((item, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            role="listitem"
          >
            <button
              className="faq-question"
              onClick={() => handleToggle(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              id={`faq-question-${index}`}
            >
              <span className="faq-q-mark" aria-hidden="true">Q.</span>
              <span className="faq-q-text">{item.question}</span>
              <span className="faq-arrow" aria-hidden="true">{openIndex === index ? '▲' : '▼'}</span>
            </button>
            <div
              id={`faq-answer-${index}`}
              className="faq-answer"
              role="region"
              aria-labelledby={`faq-question-${index}`}
              hidden={openIndex !== index}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </ContentLayout>
  );
}
