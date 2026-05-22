import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Check, AlertCircle } from 'lucide-react';

interface ProfileFormProps {
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  inline?: boolean;
}

export default function ProfileForm({ initialProfile, onSave, inline = false }: ProfileFormProps) {
  const [name, setName] = useState(initialProfile.name || '김한양');
  const [ageStr, setAgeStr] = useState(initialProfile.age?.toString() || '24');
  const [regionSiDo, setRegionSiDo] = useState(initialProfile.regionSiDo || '경기도');
  const [regionSiGunGu, setRegionSiGunGu] = useState(initialProfile.regionSiGunGu || '안산시 상록구');
  const [incomePercent, setIncomePercent] = useState(initialProfile.incomePercent || 110);
  const [studentStatus, setStudentStatus] = useState<UserProfile['studentStatus']>(initialProfile.studentStatus || '졸업예정');
  const [interestSectors, setInterestSectors] = useState<string[]>(initialProfile.interestSectors || ['취업', '금융/소득']);
  const [errorMsg, setErrorMsg] = useState('');
  const [passSynced, setPassSynced] = useState(false);

  const statusOptions: UserProfile['studentStatus'][] = ['재학', '휴학', '졸업예정', '졸업', '미취업', '재직중'];
  const sectorOptions = ['취업', '창업', '주거', '금융/소득', '생활/복지'];

  const handleSectorToggle = (sector: string) => {
    if (interestSectors.includes(sector)) {
      setInterestSectors(interestSectors.filter(s => s !== sector));
    } else {
      setInterestSectors([...interestSectors, sector]);
    }
  };

  const handleDummyPassSync = () => {
    // Fill representative student persona: 김한양, 만 24세, 경기도 안산시 상록구, 졸업예정, 소득 110%
    setName('김한양');
    setAgeStr('24');
    setRegionSiDo('경기도');
    setRegionSiGunGu('안산시 상록구');
    setIncomePercent(110);
    setStudentStatus('졸업예정');
    setInterestSectors(['취업', '금융/소득']);
    setPassSynced(true);
    setTimeout(() => setPassSynced(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(ageStr, 10);
    if (isNaN(age) || age < 15 || age > 39) {
      setErrorMsg('나이는 만 15세 ~ 39세 사이로 올바르게 입력해주세요.');
      return;
    }
    if (!regionSiDo || !regionSiGunGu) {
      setErrorMsg('거주 지역을 정확히 입력해 주세요.');
      return;
    }
    if (interestSectors.length === 0) {
      setErrorMsg('최소 하나 이상의 관심 분야를 선택해 주세요.');
      return;
    }

    setErrorMsg('');
    onSave({
      name,
      age,
      regionSiDo,
      regionSiGunGu,
      incomePercent,
      studentStatus,
      interestSectors
    });
  };

  return (
    <div className={`bg-white rounded-2xl ${inline ? 'p-6 shadow-sm border border-fuchsia-100' : 'p-8 shadow-xl border border-indigo-50'} max-w-xl mx-auto`}>
      {!inline && (
        <div className="mb-6 text-center">
          <span className="bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full text-xs">
            MatchUp 개인 설정
          </span>
          <h2 className="text-2xl font-bold text-indigo-950 mt-2">간편 프로필 설정</h2>
          <p className="text-sm text-slate-500 mt-1">
            개격 조건을 단 한번 설정하면, 자격 미달 공고는 알아서 거르고 지원 가능한 최적의 정책들만 선별해 드립니다.
          </p>
        </div>
      )}

      {/* PASS One-Click Sync Banner */}
      <div className="mb-6 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-xl p-4 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-2 opacity-10">
          <Sparkles size={100} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-1">
              <span className="bg-amber-400 text-indigo-950 text-[10px] font-bold px-1.5 py-0.5 rounded">HOT</span>
              <p className="text-xs font-medium text-indigo-100">민원24 & 공공데이터 연동</p>
            </div>
            <h4 className="text-sm font-bold mt-1 text-white">동주민센터 서류 없이 PASS인증 자동 조회</h4>
          </div>
          <button
            type="button"
            onClick={handleDummyPassSync}
            className="bg-white hover:bg-slate-50 text-indigo-950 px-3.5 py-1.5 rounded-lg text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
            id="btn_pass_sync"
          >
            {passSynced ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span>데이터 수신 완료</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-indigo-600 animate-spin" />
                <span>간편 연동하기 (김한양)</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Name input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="profile_name">성명 / 별명</label>
            <input
              id="profile_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김한양"
              className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
              required
            />
          </div>

          {/* Age input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="profile_age">나이 (만 연령)</label>
            <div className="relative">
              <input
                id="profile_age"
                type="number"
                value={ageStr}
                onChange={(e) => {
                  setAgeStr(e.target.value);
                  setErrorMsg('');
                }}
                min="15"
                max="39"
                placeholder="예: 24"
                className={`w-full h-11 px-3 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${
                  (parseInt(ageStr, 10) < 15 || parseInt(ageStr, 10) > 39) ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200'
                }`}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">세</span>
            </div>
            {(parseInt(ageStr, 10) < 15 || parseInt(ageStr, 10) > 39) && (
              <span className="text-[11px] text-rose-500 mt-1 block">올바른 값을 입력해주세요 (나이는 만 15세~39세)</span>
            )}
          </div>
        </div>

        {/* Region inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="profile_sido">거주지 (시/도)</label>
            <select
              id="profile_sido"
              value={regionSiDo}
              onChange={(e) => setRegionSiDo(e.target.value)}
              className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all bg-white"
            >
              <option value="경기도">경기도</option>
              <option value="서울특별시">서울특별시</option>
              <option value="인천광역시">인천광역시</option>
              <option value="부산광역시">부산광역시</option>
              <option value="대구광역시">대구광역시</option>
              <option value="대전광역시">대전광역시</option>
              <option value="광주광역시">광주광역시</option>
              <option value="울산광역시">울산광역시</option>
              <option value="세종특별자치시">세종특별자치시</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="profile_sigungu">상세 거주지 (시/군/구)</label>
            <input
              id="profile_sigungu"
              type="text"
              value={regionSiGunGu}
              onChange={(e) => setRegionSiGunGu(e.target.value)}
              placeholder="예: 안산시 상록구, 강남구 등"
              className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
              required
            />
          </div>
        </div>

        {/* Income level slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-600" htmlFor="profile_income">기준 중위소득 구간 비율</label>
            <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              {incomePercent}% 이하
            </span>
          </div>
          <input
            id="profile_income"
            type="range"
            min="30"
            max="200"
            step="5"
            value={incomePercent}
            onChange={(e) => setIncomePercent(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5 mt-1">
            <span>초저소득 (30%)</span>
            <span>중위서민 (100%)</span>
            <span>보통소득 (150%)</span>
            <span>고소득 (200%)</span>
          </div>

          {/* Quick Info text block about selection */}
          <div className="mt-2 bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-[11px] text-slate-500 flex flex-wrap gap-1 items-center justify-between">
            <span>💡 <strong>{incomePercent}% 매칭 기준:</strong> </span>
            <span>
              {incomePercent <= 60 && '월세 특별지원, 취업패키지 등 기초 혜택 매칭 보장'}
              {incomePercent > 60 && incomePercent <= 120 && '경기사다리, 안산보증금 등 중산 청년 혜택 매칭 보장'}
              {incomePercent > 120 && incomePercent <= 150 && '안산취업지원금 등 취업 역량 자금 매칭 성공 보장'}
              {incomePercent > 150 && incomePercent <= 180 && '청년도약계좌 등 금융 맞춤 혜택 매칭 지원'}
              {incomePercent > 180 && '고소득자용 복지 혜택 매칭 검토 (소득 무관 혜택 중심)'}
            </span>
          </div>
        </div>

        {/* Student Status select */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="profile_status">현 학적 및 근로 형태</label>
          <div className="grid grid-cols-3 gap-2">
            {statusOptions.map((opt) => (
              <button
                id={`btn_status_${opt}`}
                key={opt}
                type="button"
                onClick={() => setStudentStatus(opt)}
                className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all text-center ${
                  studentStatus === opt
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Interest categories selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">관심 청년정책 분야 (다중 선택)</label>
          <div className="flex flex-wrap gap-1.5">
            {sectorOptions.map((sector) => {
              const active = interestSectors.includes(sector);
              return (
                <button
                  id={`btn_interest_${sector}`}
                  key={sector}
                  type="button"
                  onClick={() => handleSectorToggle(sector)}
                  className={`py-2 px-3 text-xs font-semibold rounded-full border transition-all ${
                    active
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sector}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all md:text-sm text-xs mt-4 hover:shadow-indigo-200 active:scale-[0.98]"
          id="btn_save_profile"
        >
          {inline ? '조건 업데이트 완료' : '개인 맞춤 정책 찾기 시작'}
        </button>
      </form>
    </div>
  );
}
