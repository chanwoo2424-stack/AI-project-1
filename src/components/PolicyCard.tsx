import React from 'react';
import { Policy, MatchReport } from '../types';
import { CheckCircle2, AlertTriangle, Building, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface PolicyCardProps {
  key?: string;
  policy: Policy;
  match: MatchReport;
  onClick: () => void;
}

export default function PolicyCard({ policy, match, onClick }: PolicyCardProps) {
  // Category style map
  const categoryStyles: Record<Policy['category'], { bg: string; text: string; border: string }> = {
    '취업': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    '창업': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    '주거': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100' },
    '금융/소득': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
    '생활/복지': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  };

  const currentTheme = categoryStyles[policy.category] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' };

  // Calculate D-day simulation (static for prototyping but feels live)
  const dDaySim = policy.id === 'policy-001' ? 'D-3' : policy.id === 'policy-002' ? 'D-5' : policy.id === 'policy-003' ? '마감임박' : '상시모집';
  const isEmergency = dDaySim === 'D-3' || dDaySim === 'D-5' || dDaySim === '마감임박';

  // Extract unmet conditions labels
  const unmetItems = match.items.filter(i => !i.isMatch);

  return (
    <div 
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer group flex flex-col justify-between"
      onClick={onClick}
      id={`policy_card_${policy.id}`}
    >
      <div>
        {/* Card Header: Category & D-day */}
        <div className="flex justify-between items-center mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}>
            {policy.category}
          </span>
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
            isEmergency ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
          }`}>
            {dDaySim}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-all leading-snug line-clamp-1">
          {policy.title}
        </h3>

        {/* Host Agency */}
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 mt-1.5 mb-3">
          <Building size={12} className="text-slate-400" />
          <span>{policy.host}</span>
        </div>

        {/* Summary Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {policy.summary}
        </p>

        {/* Benefits Display Box */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">예상 지원 혜택</p>
          <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
            {policy.benefits}
          </p>
        </div>
      </div>

      <div>
        {/* Match Percentage Progress Metric */}
        <div className="border-t border-slate-100 pt-4 mt-1 flex justify-between items-center">
          <div>
            {match.isEligible ? (
              <div className="flex items-center gap-1 text-indigo-700">
                <Sparkles size={14} className="text-amber-500 animate-spin" />
                <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                  지원 자격 100% 충족
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="text-xs font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {match.matchPercentage}% 매칭
                  </span>
                </div>
                {unmetItems.length > 0 && (
                  <p className="text-[10px] font-semibold text-rose-500 leading-none">
                    ⚠️ {unmetItems[0].name} 부적합
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-all">
            <span>자격 분석</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
