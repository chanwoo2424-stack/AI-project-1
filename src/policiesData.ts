import { Policy } from './types';

export const POLICIES: Policy[] = [
  {
    id: 'policy-001',
    title: '경기도 청년기본소득',
    category: '금융/소득',
    host: '경기도 (안산시 상록구 등)',
    summary: '경기도에 주민등록을 둔 만 24세 청년에게 분기별로 25만원씩 연간 총 100만원의 지역화폐를 무조건 지급하여 기본 생활권을 지원합니다.',
    benefits: '분기별 25만원 (연 최대 100만원) 안산시 지역화폐(다온) 지급',
    targetDescription: '신청일 기준 경기도에 3년 이상 주민등록을 두고 계속 거주 중이거나, 총 합산 10년 이상 거주한 만 24세 청년 (소득/취업 무관)',
    criteria: {
      minAge: 24,
      maxAge: 24,
      regions: ['경기도', '안산시 상록구', '안산시 단원구', '안산시', '시흥시', '수원시', '성남시', '용인시', '화성시', '부천시'],
      incomeMaxPercent: 'ALL',
      studentStatus: ['재학', '휴학', '졸업예정', '졸업', '미취업', '재직중']
    },
    documents: [
      {
        name: '주민등록초본',
        description: '최근 3년 이상 (또는 합산 10년 이상) 경기도 거주 이력을 확인하기 위해 필요합니다. (신청일 현재 발급본만 유효)',
        issueAgency: '정부24',
        issueUrl: 'https://www.gov.kr/portal/main'
      },
      {
        name: '지역화폐 등록 신청서',
        description: '지급 대상 지역화폐(다온 등) 카드 신규 발급 및 계정 연동을 위해 작성합니다.',
        issueAgency: '경기지역화폐 공식앱',
        issueUrl: 'https://gmoney.or.kr/'
      }
    ],
    applyUrl: 'https://apply.jobaba.net/'
  },
  {
    id: 'policy-002',
    title: '안산시 청년 취업지원금 (상생 안산)',
    category: '취업',
    host: '안산시 일자리센터',
    summary: '안산시에 거주하는 미취업 청년들의 취업 준비 비용을 경감하기 위해 월 50만원씩 최대 6개월간 취업지원금을 지급합니다.',
    benefits: '월 50만원 × 최대 6개월 (총 300만원) 체크카드 포인트 지급',
    targetDescription: '안산시에 거주 중인 만 18세 이상 ~ 34세 이하 청년 중 중위소득 150% 이하이면서, 고등학교 및 대학교 졸업(예정) 후 2년 이내인 미취업자',
    criteria: {
      minAge: 18,
      maxAge: 34,
      regions: ['안산시', '안산시 상록구', '안산시 단원구'],
      incomeMaxPercent: 150,
      studentStatus: ['졸업예정', '졸업', '미취업']
    },
    documents: [
      {
        name: '주민등록등본',
        description: '안산시 주소지 거주 확인 및 동거 가족 인원 조사를 위해 제출합니다.',
        issueAgency: '정부24',
        issueUrl: 'https://www.gov.kr/portal/main'
      },
      {
        name: '최종학력 졸업(예정) 증명서',
        description: '최종 학력 졸업 후 2년 이내 경과 여부를 증빙하기 위해 사용합니다.',
        issueAgency: '정부24 및 소속 대학 민원실',
        issueUrl: 'https://www.gov.kr/portal/main'
      },
      {
        name: '건강보험료 납부확인서',
        description: '가구 합산 중위 소득 150% 이하 요건 검증을 위해 소득 가구원의 최근 3개월 분 내역을 확인합니다.',
        issueAgency: '국민건강보험공단',
        issueUrl: 'https://www.nhis.or.kr/'
      }
    ],
    applyUrl: 'https://www.ansan.go.kr/'
  },
  {
    id: 'policy-003',
    title: '정부 국토교통부 청년월세 특별지원',
    category: '주거',
    host: '국토교통부 / LH한국토지주택공사',
    summary: '부모와 별도로 거주하는 무주택 청년들의 주거비 안정을 위해 실질 납부 임차료를 월 최대 20만원 지원합니다.',
    benefits: '실제 납부 월 소요 월세 최대 20만원 한도 내 지급 (최대 12개월)',
    targetDescription: '만 19세 ~ 34세 무주택 독립 청년 중 청년가구 중위소득 60% 이하 (원가구 중위소득 100% 이하)',
    criteria: {
      minAge: 19,
      maxAge: 34,
      regions: ['경기도', '서울특별시', '인천광역시', '안산시', '안산시 상록구', '안산시 단원구', '시흥시', '부산광역시', '대구광역시', '대전광역시', '광주광역시', '울산광역시', '세종특별자치시'],
      incomeMaxPercent: 100, // 원가구 기준 포함 간소화
      studentStatus: ['재학', '휴학', '졸업예정', '졸업', '미취업']
    },
    documents: [
      {
        name: '임대차계약서 사본',
        description: '임대 계약 사실 및 월 임차보증금/월 임대료 정량 명세를 위해 필요합니다.',
        issueAgency: '공인중개사사무소 계약서 복사본',
        issueUrl: 'https://www.bokjiro.go.kr/'
      },
      {
        name: '최근 3개월 월세 이체 증빙서류',
        description: '최근 3달 동안 임대인에게 월세를 직접 지급한 송금확인증 혹은 계좌내역서가 첨부되어야 합니다.',
        issueAgency: '이용하시는 은행 인터넷뱅킹',
        issueUrl: 'https://www.gov.kr'
      },
      {
        name: '본인 통장 사본',
        description: '지원금 수령용 본인명의 예금 통장 사본입니다.',
        issueAgency: '이용하시는 은행 공식 앱',
        issueUrl: 'https://www.gov.kr'
      },
      {
        name: '가족관계증명서(상세)',
        description: '본인가구 및 부모가구 구성원의 확인을 보장하기 위해 구체 상세본을 요구합니다.',
        issueAgency: '대법원 전자가족관계등록시스템',
        issueUrl: 'https://efamily.scourt.go.kr/'
      }
    ],
    applyUrl: 'https://www.bokjiro.go.kr/'
  },
  {
    id: 'policy-004',
    title: '금융위원회 청년도약계좌',
    category: '금융/소득',
    host: '서민금융진흥원 및 주요 시중은행',
    summary: '청년들의 중장기 자산형성을 지원하기 위해 매달 일정액을 저축하면 국가가 기여금을 매칭하여 비과세 혜택과 높은 이자를 부여합니다.',
    benefits: '5년 만기 시 최대 약 5,000만원 자산형성 (정부 기여금 최대 6% 매칭 및 비과세 혜택)',
    targetDescription: '만 19세 ~ 34세 정기 수입이 있는 청년 중 총급여 7,500만원 이하 (중위소득 180% 이하)인 근로 소득자 혹은 사업자',
    criteria: {
      minAge: 19,
      maxAge: 34,
      regions: ['경기도', '서울특별시', '인천광역시', '안산시', '안산시 상록구', '안산시 단원구', '시흥시', '부산광역시', '대구광역시', '대전광역시', '광주광역시', '울산광역시', '세종특별자치시'],
      incomeMaxPercent: 180,
      studentStatus: ['재직중']
    },
    documents: [
      {
        name: '소득금액증명원',
        description: '국세청 홈택스에서 발급 가능한 개인 근로소득 또는 종합소득 최종 신고 결과 증명 서류입니다.',
        issueAgency: '국세청 홈택스',
        issueUrl: 'https://www.hometax.go.kr/'
      }
    ],
    applyUrl: 'https://www.kinfa.or.kr/'
  },
  {
    id: 'policy-005',
    title: '안산시 청년창업 펀딩 지원사업',
    category: '창업',
    host: '안산시 창업지원센터',
    summary: '안산시 내 우수 아이디어를 보유한 청년 예비 창업자가 초기 시드 자본 부족으로 사장되는 것을 막고자 창업 바우처를 무상 매칭합니다.',
    benefits: '아이템 시드머니 및 시제품 제작비 최대 1,500만원 무상 지원',
    targetDescription: '안산시 내 사업장 입주 예정이거나 거주 중인 만 19세 이상 ~ 39세 이하 청년 중 예비 창업자 또는 창업 3년 이내 기업 대표',
    criteria: {
      minAge: 19,
      maxAge: 39,
      regions: ['안산시', '안산시 상록구', '안산시 단원구', '경기도'],
      incomeMaxPercent: 'ALL',
      studentStatus: ['재학', '휴학', '졸업예정', '졸업', '미취업', '재직중']
    },
    documents: [
      {
        name: '창업 사업계획서',
        description: '아이템 설명, 시장성 분석, 사업비 예산 명세서 계획 등의 정적 서식 원고입니다.',
        issueAgency: '안산시 창업지원센터 다운로드',
        issueUrl: 'https://www.ansan.go.kr'
      },
      {
        name: '주민등록초본',
        description: '안산시 관내 연령/전형 필터링 자격을 정당화하기 위한 주소 이력 초본입니다.',
        issueAgency: '정부24',
        issueUrl: 'https://www.gov.kr/portal/main'
      },
      {
        name: '사업자등록사실여부증명원',
        description: '예비 창업자 선별을 위해 본인 명이 기 보유 사업 여부를 교차 체크하기 위해 필요합니다.',
        issueAgency: '국세청 홈택스',
        issueUrl: 'https://www.hometax.go.kr/'
      }
    ],
    applyUrl: 'https://www.ansan.go.kr/'
  },
  {
    id: 'policy-006',
    title: '고용노동부 국민취업지원제도 Ⅰ유형',
    category: '취업',
    host: '고용노동부 고용복지플러스센터',
    summary: '구직자에게 구직촉진수당을 정액 지급하며 1:1 진로 상담 및 직업 훈련 과정을 긴밀하게 연계하여 장기 실업을 완화합니다.',
    benefits: '구직촉진수당 월 50만원 × 6개월 (정부 현금 300만원 무조건 지원)',
    targetDescription: '만 15세 ~ 34세 구직청년 가구 중 중위소득 60% 이하이며 최근 2년 내에 일한 경력이 적거나 미취업 상태인 청년',
    criteria: {
      minAge: 15,
      maxAge: 34,
      regions: ['경기도', '서울특별시', '인천광역시', '안산시', '안산시 상록구', '안산시 단원구', '시흥시', '부산광역시', '대구광역시', '대전광역시', '광주광역시', '울산광역시', '세종특별자치시'],
      incomeMaxPercent: 60,
      studentStatus: ['미취업']
    },
    documents: [
      {
        name: '취업지원 신청서',
        description: '가구 인적 정보, 구직 직무 선택, 자격 확인 체크박스 등이 명시된 고용부 기본 포맷 서식입니다.',
        issueAgency: '국민취업지원제도 공식 웹사이트',
        issueUrl: 'https://www.kua.go.kr/'
      },
      {
        name: '가족관계증명서',
        description: '적정 가구 인적 조성을 통합해 가구 전체 재산세 과세 산정 목적으로 요구됩니다.',
        issueAgency: '대법원 전자가족관계등록시스템',
        issueUrl: 'https://efamily.scourt.go.kr/'
      }
    ],
    applyUrl: 'https://www.kua.go.kr/'
  },
  {
    id: 'policy-007',
    title: '한양대 ERICA 산학협력 인턴쉽 프로그램',
    category: '취업',
    host: '한양대학교 ERICA 커리어개발센터',
    summary: '안산 강소기업 및 유망 벤처 벨리와 에리카 캠퍼스가 계약을 맺고, 재학생들에게 6달간 실무 기회를 보장하며 직무 경력을 채워줍니다.',
    benefits: '매달 실습생 교통비 및 급수 수당 200만원 보장 및 학기당 12학점 대체 인정',
    targetDescription: '한양대학교 ERICA 재학/휴학/졸업예정 청년 중 3, 4학년 대상 (학점 평점 3.0 이상 권장, 거주지 제한 없음)',
    criteria: {
      minAge: 19,
      maxAge: 29,
      regions: ['경기도', '서울특별시', '인천광역시', '안산시', '안산시 상록구', '안산시 단원구', '시흥시'],
      incomeMaxPercent: 'ALL',
      studentStatus: ['재학', '휴학', '졸업예정']
    },
    documents: [
      {
        name: '재학/휴학 및 성적 증명서',
        description: '한양대 에리카 내부 구성원 신분 및 성적 자격 검증용 원고입니다.',
        issueAgency: '한양대학교 포털(HY-in)',
        issueUrl: 'https://portal.hanyang.ac.kr/'
      },
      {
        name: '직무 매칭 이력서 & 자기소개서',
        description: '산학 연계 강소 기업 면접을 위한 에리카 커리어개발 통합 서식입니다.',
        issueAgency: 'ERICA 커리어개발센터 다운로드',
        issueUrl: 'https://work.hanyang.ac.kr/'
      }
    ],
    applyUrl: 'https://work.hanyang.ac.kr/'
  },
  {
    id: 'policy-008',
    title: '경기청년 사다리 프로그램',
    category: '생활/복지',
    host: '경기도 청년비전센터 / 경기도일자리재단',
    summary: '사회·경제적 취약층 청년 및 다양한 청년들에게 해외 우수 대학 어학 연수 경험을 연계하여 균등한 배움의 사다리를 선사합니다.',
    benefits: '해외 대학(미국 미시간대 등) 훈련비, 항공료, 숙식 숙소 자금 일체 전액 무료 지원',
    targetDescription: '공고일 기준 경기도에 주민등록을 둔 만 19세 이상 ~ 39세 이하 청년 중 해외 연수 결격 사유가 없는 대상 (중위소득 120% 이하 가점)',
    criteria: {
      minAge: 19,
      maxAge: 39,
      regions: ['경기도', '안산시', '안산시 상록구', '안산시 단원구', '시흥시', '수원시', '성남시', '용인시', '부천시'],
      incomeMaxPercent: 120,
      studentStatus: ['재학', '휴학', '졸업예정', '졸업', '미취업']
    },
    documents: [
      {
        name: '주민등록초본',
        description: '신청일 기준 경기도 내 전입 실 거주 요건 확인을 위해 의무적으로 제출합니다.',
        issueAgency: '정부24',
        issueUrl: 'https://www.gov.kr/portal/main'
      },
      {
        name: '성실 서약서 및 자기소개서',
        description: '해외 연수를 충실히 참여하겠다는 의지와 참가 포부를 양식에 맞게 서명 제출합니다.',
        issueAgency: '경기도 일자리재단 공고 사이트',
        issueUrl: 'https://apply.jobaba.net/'
      }
    ],
    applyUrl: 'https://apply.jobaba.net/'
  },
  {
    id: 'policy-009',
    title: '안산시 청년 주택전세보증금 이자 지원',
    category: '주거',
    host: '안산시 청년정책관',
    summary: '안산시에 전세 또는 반전세 임차 거주 중인 무주택 청년들에게 보증금 대출금의 이자 납입액 부담을 하향 경감해 줍니다.',
    benefits: '대출 전세 잔액 최대 1억원 이내 실 이자 2% ~ 2.5% 상쇄 현금 정산 (최대 연 200만원 보상)',
    targetDescription: '안산시 관내 임차계약을 체결하고 거주하는 만 19세 ~ 34세 무주택 청년독립가구 중 중위소득 120% 이하 거주자',
    criteria: {
      minAge: 19,
      maxAge: 34,
      regions: ['안산시', '안산시 상록구', '안산시 단원구'],
      incomeMaxPercent: 120,
      studentStatus: ['재학', '휴학', '졸업예정', '졸업', '미취업', '재직중']
    },
    documents: [
      {
        name: '확정일자부 임대차계약서',
        description: '동주민센터 등에서 확정일자를 날인받은 임대차 원본 계약서 이체 대조 증빙 복사본입니다.',
        issueAgency: '해당 거주지 동 주민센터',
        issueUrl: 'https://www.gov.kr'
      },
      {
        name: '지방세 세목별 과세증명서',
        description: '전국 단위 무주택 해당 여부를 정합적으로 검출하기 위해 본인 과세 증명을 활용합니다.',
        issueAgency: '정부24 및 위택스',
        issueUrl: 'https://www.gov.kr/portal/main'
      }
    ],
    applyUrl: 'https://www.ansan.go.kr/'
  },
  {
    id: 'policy-010',
    title: '한국장학재단 대학생 국가장학금 Ⅰ유형',
    category: '금융/소득',
    host: '한국장학재단',
    summary: '대학생의 등록금 부담 완화를 위해 가구의 소득 수준과 학업 정합성을 대조하여 소득 구간별로 등록금 차등 무상 감면을 실시합니다.',
    benefits: '학기당 최대 등록금 100% 감면 (소득 분위에 따라 차등 면제)',
    targetDescription: '국내 대학 소속 대학생 재학생/휴학생 중 소득 분위 8구간 이하 (중위소득 200% 이하 수준)이면서 평점 백분위 80점 이상인 학생',
    criteria: {
      minAge: 18,
      maxAge: 34,
      regions: ['경기도', '서울특별시', '인천광역시', '안산시', '안산시 상록구', '안산시 단원구', '시흥시', '부산광역시', '대구광역시', '대전광역시', '광주광역시', '울산광역시', '세종특별자치시'],
      incomeMaxPercent: 200,
      studentStatus: ['재학', '휴학']
    },
    documents: [
      {
        name: '가구원 동의 공인 서명',
        description: '사회보장 정보원 소득재산 조사를 위해 세대 가구원의 일체 온라인 동의 사전 서명이 반드시 선행되어야 합니다.',
        issueAgency: '한국장학재단 공식포털',
        issueUrl: 'https://www.kosaf.go.kr/'
      }
    ],
    applyUrl: 'https://www.kosaf.go.kr/'
  }
];

export function calculateDeterministicMatch(user: { age: number; regionSiDo: string; regionSiGunGu: string; incomePercent: number; studentStatus: string }, policy: Policy) {
  const items = [];
  const criteria = policy.criteria;

  // 1. AGE CHECK
  let ageMatch = true;
  let ageDesc = '연령 자격 충족';
  if (criteria.minAge !== undefined && criteria.maxAge !== undefined) {
    ageMatch = user.age >= criteria.minAge && user.age <= criteria.maxAge;
    ageDesc = `만 ${criteria.minAge}세 ~ 만 ${criteria.maxAge}세 지원 (회원님 만 ${user.age}세)`;
  }
  items.push({
    id: 'age',
    name: '나이 요건',
    isMatch: ageMatch,
    userValue: `만 ${user.age}세`,
    policyValue: criteria.minAge === criteria.maxAge ? `만 ${criteria.minAge}세` : `만 ${criteria.minAge}세 ~ 만 ${criteria.maxAge}세`,
    desc: ageMatch ? '조건을 통과했습니다.' : `만 ${criteria.minAge}~${criteria.maxAge}세 조건에 수혜대상이 아닙니다.`
  });

  // 2. REGION CHECK
  let regionMatch = false;
  let regionPolicyDesc = '전국 지원';
  if (criteria.regions && criteria.regions.length > 0) {
    regionPolicyDesc = criteria.regions.join(', ');
    // Match logic: check if user's regionSiDo or regionSiGunGu contains any of policy's regions
    regionMatch = criteria.regions.some(r => 
      user.regionSiDo.includes(r) || 
      user.regionSiGunGu.includes(r) ||
      r.includes(user.regionSiDo) || 
      (user.regionSiGunGu && r.includes(user.regionSiGunGu))
    );
  } else {
    regionMatch = true;
  }
  items.push({
    id: 'region',
    name: '거주지 요건',
    isMatch: regionMatch,
    userValue: `${user.regionSiDo} ${user.regionSiGunGu}`,
    policyValue: regionPolicyDesc,
    desc: regionMatch ? '거주 조건에 적합합니다.' : '해당 지자체 거주 조건에 해당하지 않습니다.'
  });

  // 3. INCOME CHECK
  let incomeMatch = true;
  let incomePolicyDesc = '제한 없음 (누구나 참여)';
  if (criteria.incomeMaxPercent !== undefined && criteria.incomeMaxPercent !== 'ALL') {
    incomePolicyDesc = `중위소득 ${criteria.incomeMaxPercent}% 이하`;
    incomeMatch = user.incomePercent <= criteria.incomeMaxPercent;
  }
  items.push({
    id: 'income',
    name: '소득 요건',
    isMatch: incomeMatch,
    userValue: `중위소득 ${user.incomePercent}% 수준`,
    policyValue: incomePolicyDesc,
    desc: incomeMatch ? '소득 요건이 정밀 충족되었습니다.' : `소득 기준 요권인 중위 ${criteria.incomeMaxPercent}% 이하를 초과했습니다.`
  });

  // 4. STATUS CHECK
  let statusMatch = true;
  let statusPolicyDesc = '전체 학적 상태 구제';
  if (criteria.studentStatus && criteria.studentStatus.length > 0) {
    statusPolicyDesc = criteria.studentStatus.join(', ');
    statusMatch = criteria.studentStatus.includes(user.studentStatus as any);
  }
  items.push({
    id: 'status',
    name: '학적 및 구직 학적 요건',
    isMatch: statusMatch,
    userValue: user.studentStatus,
    policyValue: statusPolicyDesc,
    desc: statusMatch ? '현 상태에 적용 가능합니다.' : `대상 학적 상태(${statusPolicyDesc})가 아닌 현재 ${user.studentStatus} 상태입니다.`
  });

  const totalCriteriaCount = items.length;
  const metCriteriaCount = items.filter(i => i.isMatch).length;
  const matchPercentage = Math.round((metCriteriaCount / totalCriteriaCount) * 100);
  const isEligible = matchPercentage === 100;

  return {
    policyId: policy.id,
    totalCriteriaCount,
    checkedCriteriaCount: totalCriteriaCount,
    metCriteriaCount,
    isEligible,
    matchPercentage,
    items
  };
}
