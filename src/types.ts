export interface UserProfile {
  name: string;
  age: number; // For example: 24
  regionSiDo: string; // "경기도", "서울특별시" etc.
  regionSiGunGu: string; // "안산시 상록구", "강남구" etc.
  incomePercent: number; // 0 to 200 (percent of median income, default e.g., 100)
  studentStatus: '재학' | '휴학' | '졸업예정' | '졸업' | '미취업' | '재직중';
  interestSectors: string[]; // ["취업", "창업", "주거", "금융/소득", "생활/복지"]
}

export interface PolicyCriteria {
  minAge?: number;
  maxAge?: number;
  regions?: string[]; // ["경기도", "안산시"]
  incomeMaxPercent?: number | 'ALL';
  studentStatus?: ('재학' | '휴학' | '졸업예정' | '졸업' | '미취업' | '재직중')[];
}

export interface Policy {
  id: string;
  title: string;
  category: '취업' | '창업' | '주거' | '금융/소득' | '생활/복지';
  host: string;
  summary: string;
  benefits: string;
  targetDescription: string;
  criteria: PolicyCriteria;
  documents: {
    name: string;
    description: string;
    issueAgency: string;
    issueUrl: string;
  }[];
  applyUrl: string;
}

export interface MatchResultItem {
  id: string; // "age" | "region" | "income" | "status"
  name: string; // "나이 요건", "거주지 요건" 등
  isMatch: boolean;
  userValue: string;
  policyValue: string;
  desc: string;
}

export interface MatchReport {
  policyId: string;
  totalCriteriaCount: number;
  checkedCriteriaCount: number;
  metCriteriaCount: number;
  isEligible: boolean;
  matchPercentage: number;
  items: MatchResultItem[];
}

export interface CustomAnalysisResult {
  title: string;
  category: string;
  host: string;
  summary: string;
  benefits: string;
  isEligible: boolean;
  matchPercentage: number;
  reason: string;
  criteriaChecks: {
    name: string;
    isMatch: boolean;
    userValue: string;
    policyValue: string;
    desc: string;
  }[];
  requiredDocuments: {
    name: string;
    description: string;
    issueAgency: string;
    issueUrl: string;
  }[];
}
