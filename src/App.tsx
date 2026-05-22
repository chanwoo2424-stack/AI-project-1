import React, { useState, useEffect } from 'react';
import { UserProfile, Policy, MatchReport, CustomAnalysisResult } from './types';
import ProfileForm from './components/ProfileForm';
import PolicyCard from './components/PolicyCard';
import { 
  Sparkles, 
  Search, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Send, 
  ExternalLink, 
  Info, 
  RefreshCw, 
  User, 
  ArrowLeft, 
  Compass, 
  Bell, 
  AlertCircle,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // 1. Initial State for Active User Profile (represented by representative persona Han-Yang Kim)
  const [profile, setProfile] = useState<UserProfile>({
    name: '김한양',
    age: 24,
    regionSiDo: '경기도',
    regionSiGunGu: '안산시 상록구',
    incomePercent: 110,
    studentStatus: '졸업예정',
    interestSectors: ['취업', '금융/소득']
  });

  // 2. Main data states
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [matchReports, setMatchReports] = useState<Record<string, MatchReport>>({});
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState('');

  // 3. UI control states
  const [activeTab, setActiveTab] = useState<'all' | 'eligible' | 'review'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // 4. Custom Unstructured Analyzer state
  const [customText, setCustomText] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState('');
  const [customResult, setCustomResult] = useState<CustomAnalysisResult | null>(null);

  // 5. Chat states for selected policy
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [userInputMessage, setUserInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // 6. Local interactive tick states for documents checklist
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // 7. Error reporting state
  const [showErrorReported, setShowErrorReported] = useState(false);

  // 8. Loaded notification system to show alert simulations
  const [notifications, setNotifications] = useState<{ id: string; message: string; date: string; read: boolean }[]>([
    {
      id: 'noti-1',
      message: '🚨 [경기도 청년기본소득] 신청 마감이 3일 전입니다! 대상자 여부를 확인해 보세요.',
      date: '오후 1:45',
      read: false
    },
    {
      id: 'noti-2',
      message: '🎉 [안산시 청년 취업지원금] 지원 정책의 정보 요강이 방금 갱신되었습니다.',
      date: '어제',
      read: true
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch policies and recalculate matches on profile changes
  const fetchPoliciesAndMatches = async (currentProfile: UserProfile) => {
    setLoading(true);
    try {
      // Fetch fresh catalog
      const resCatalog = await fetch('/api/policies');
      const dataCatalog = await resCatalog.json();
      if (dataCatalog.success) {
        setPolicies(dataCatalog.data);
      }

      // Compute matches via server
      const resMatch = await fetch('/api/policies/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: currentProfile })
      });
      const dataMatch = await resMatch.json();
      if (dataMatch.success) {
        const reportMap: Record<string, MatchReport> = {};
        dataMatch.data.forEach((item: { policy: Policy; match: MatchReport }) => {
          reportMap[item.policy.id] = item.match;
        });
        setMatchReports(reportMap);
      }
    } catch (err: any) {
      console.error(err);
      setErrorHeader('서버와 올바른 연동을 맺을 수 없었습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoliciesAndMatches(profile);
  }, [profile]);

  // Handle saving new profile setting from form
  const handleProfileSave = (newProfile: UserProfile) => {
    setProfile(newProfile);
    // If a policy is currently selected, refresh its matching perspective or clear active selection so student can explore
    setSelectedPolicy(null);
    setCustomResult(null);
  };

  // Chat message submission under selected standard policy
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputMessage.trim() || chatLoading || (!selectedPolicy && !customResult)) return;

    const userMsg = userInputMessage.trim();
    const newHistory = [...chatMessages, { role: 'user' as const, content: userMsg }];
    setChatMessages(newHistory);
    setUserInputMessage('');
    setChatLoading(true);

    try {
      const policyContext = selectedPolicy 
        ? {
            title: selectedPolicy.title,
            host: selectedPolicy.host,
            benefits: selectedPolicy.benefits,
            targetDescription: selectedPolicy.targetDescription
          }
        : {
            title: customResult?.title,
            host: customResult?.host,
            benefits: customResult?.benefits,
            targetDescription: customResult?.reason
          };

      const res = await fetch('/api/policy-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: profile,
          policyContext,
          messages: newHistory
        })
      });

      const data = await res.json();
      if (data.success) {
        setChatMessages([...newHistory, { role: 'assistant', content: data.reply }]);
      } else {
        setChatMessages([...newHistory, { role: 'assistant', content: '죄상합니다. AI 상담 시스템에 오류가 발생했습니다. ' + data.error }]);
      }
    } catch (err: any) {
      setChatMessages([...newHistory, { role: 'assistant', content: '네트워크 연결 오류가 발생해 대화를 전송하지 못했습니다.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Analyze unstructured text from SNS
  const handleAnalyzeCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setCustomLoading(true);
    setCustomError('');
    setCustomResult(null);
    try {
      const res = await fetch('/api/analyze-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: profile,
          policyText: customText
        })
      });

      const data = await res.json();
      if (data.success) {
        setCustomResult(data.data);
        // Clear selection from pre-seeded files to focus user's attention
        setSelectedPolicy(null);
        // Pre-simulate checked list
        setCheckedDocs({});
        // Initialize dynamic policy chat
        setChatMessages([
          {
            role: 'assistant',
            content: `안녕하세요! 복사해 주신 [${data.data.title}] 정책을 Gemini AI 비정형 매칭 엔진으로 분석 완료했습니다. 자격 매칭률은 ${data.data.matchPercentage}%입니다. 궁금한 예외 기준이나 서류 보강 사항에 대해 실시간 1:1 채팅으로 언제든 물어보세요!`
          }
        ]);
      } else {
        setCustomError('비정형 텍스트 분석에 실패했습니다. 유효한 청년 정책 문구인지 확인해주세요: ' + data.error);
      }
    } catch (err: any) {
      setCustomError('Gemini API 서버에 연동 중 오류가 생겼습니다: ' + err.message);
    } finally {
      setCustomLoading(false);
    }
  };

  // Document checklist toggle helper
  const toggleDocChecked = (docName: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  // Filter logic
  const filteredPolicies = policies.filter(p => {
    const report = matchReports[p.id];
    if (!report) return false;

    // Search term keyword
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.host.toLowerCase().includes(searchTerm.toLowerCase());

    // Category
    const matchCategory = selectedCategory === '전체' || p.category === selectedCategory;

    // Sub-tab
    let matchTab = true;
    if (activeTab === 'eligible') {
      matchTab = report.isEligible;
    } else if (activeTab === 'review') {
      matchTab = !report.isEligible;
    }

    return matchSearch && matchCategory && matchTab;
  });

  const categories = ['전체', '취업', '창업', '주거', '금융/소득', '생활/복지'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. Header (Geometric Style matching the design guideline) */}
      <header className="flex h-16 items-center justify-between border-b border-indigo-100 bg-white px-6 sm:px-8 shadow-sm shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-100">
            MU
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-indigo-950 flex items-center gap-2">
              MatchUp <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold">청년매칭 24</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold leading-none">바쁜 대학생을 위한 스마트 안심 매칭</p>
          </div>
        </div>

        {/* Global Nav & Fast Profile Reset */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2 items-center text-xs font-semibold text-slate-500 mr-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span className="bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded">한양대 에리카</span>
            <span className="text-indigo-950 font-bold">{profile.name} (만 {profile.age}세)</span>
          </div>

          {/* Dynamic Mock Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all relative"
              id="btn_notifications_toggle"
              aria-label="알림센터"
            >
              <Bell size={20} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-xs">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                  <span className="font-extrabold text-slate-950 text-sm">실시간 스마트 매칭 알림</span>
                  <button 
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({...n, read: true})));
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    전체 읽음
                  </button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-xl border ${n.read ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50/50 border-indigo-100'} transition-all`}>
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                        <span>실시간 대조 시스템</span>
                        <span>{n.date}</span>
                      </div>
                      <p className="text-slate-800 leading-normal font-semibold">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              setProfile({
                name: '김한양',
                age: 24,
                regionSiDo: '경기도',
                regionSiGunGu: '안산시 상록구',
                incomePercent: 110,
                studentStatus: '졸업예정',
                interestSectors: ['취업', '금융/소득']
              });
              setSelectedPolicy(null);
              setCustomResult(null);
              setErrorHeader('');
            }}
            className="text-xs bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 px-3 py-2 rounded-xl transition-all font-bold flex items-center gap-1.5"
            title="김한양 테스터 데이터로 전면 초기화"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">초기화</span>
          </button>
        </div>
      </header>

      {/* Network or Error Banner */}
      {errorHeader && (
        <div className="bg-rose-50 border-b border-rose-100 text-rose-700 px-6 py-3 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorHeader}</span>
          </div>
          <button onClick={() => setErrorHeader('')} className="hover:underline">닫기</button>
        </div>
      )}

      {/* Outer Layout Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-4rem)]">
        
        {/* Left Side: Setup Panel (Width bounded to 380px or responsive collapse/scroll) */}
        <aside className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-indigo-50 bg-white p-5 overflow-y-auto shrink-0 flex flex-col gap-6">
          
          {/* Section A-1: Personal profile input state & summaries */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User size={14} className="text-indigo-600" />
                <span>대학생 프로필 설정</span>
              </h2>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                실시간 갱신 활성
              </span>
            </div>

            {/* Inlined setup form */}
            <ProfileForm 
              initialProfile={profile} 
              onSave={handleProfileSave} 
              inline={true} 
            />
          </div>

          {/* Quick Active Conditions Summary HUD */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100/60 rounded-xl p-4">
            <h4 className="text-[11px] font-extrabold text-indigo-900 mb-2 tracking-wider uppercase">현재 자격 대조 변수 목록</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-slate-400 block font-bold leading-none mb-1">인적 상태</span>
                <span className="font-extrabold text-slate-800">{profile.name} (만 {profile.age}세)</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-slate-400 block font-bold leading-none mb-1">거주 지역</span>
                <span className="font-extrabold text-slate-800 truncate block text-[11px]" title={`${profile.regionSiDo} ${profile.regionSiGunGu}`}>
                  {profile.regionSiDo} {profile.regionSiGunGu}
                </span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-slate-400 block font-bold leading-none mb-1">소득 분위 비율</span>
                <span className="font-extrabold text-indigo-700">중위 {profile.incomePercent}% 이하</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-slate-400 block font-bold leading-none mb-1">소속 대학/고용 학적</span>
                <span className="font-extrabold text-purple-700">{profile.studentStatus}</span>
              </div>
            </div>
          </div>

          {/* Section: Custom AI OCR & Parser Box for SNS Copies (Everytime / Instagram) */}
          <div className="border-t border-slate-100 pt-5 mt-2">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
              <h2 className="text-sm font-extrabold text-slate-800">
                인스타/에타 공고 직접 분석
              </h2>
            </div>
            
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              SNS 뉴스 피드나 에브리타임 대학 게시판에서 캡처한 난해한 공고 텍스트를 복사해 붙여넣어 보세요! Gemini AI가 즉각 자격 충족율을 산출해 드립니다.
            </p>

            <form onSubmit={handleAnalyzeCustomText} className="space-y-3">
              <div className="relative">
                <textarea
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    if (customError) setCustomError('');
                  }}
                  placeholder="예: 안산 상생지원금 자치 공고 - 경기도 안산시에 거주하는 만 18~34세 미취업 청년 중 중위소득 150% 이하, 졸업 후 2년 이내인 사람 대상"
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium leading-normal bg-slate-50 placeholder-slate-400"
                />
                {customText && (
                  <button
                    type="button"
                    onClick={() => setCustomText('')}
                    className="absolute right-2.5 bottom-2.5 text-[10px] bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded font-bold text-slate-600 text-center"
                  >
                    본문 지우기
                  </button>
                )}
              </div>

              {customError && (
                <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-medium leading-normal">
                  ⚠️ {customError}
                </div>
              )}

              <button
                type="submit"
                disabled={customLoading || !customText.trim()}
                className={`w-full py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                  customLoading
                    ? 'bg-purple-100 text-purple-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed'
                }`}
              >
                {customLoading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin text-purple-600" />
                    <span>Gemini AI 정밀 매칭 및 대조 연산 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-purple-200" />
                    <span>AI 정밀 대조 및 분석하기</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </aside>

        {/* Center/Right Panel: Policy Catalog List and Detail Explorer Side-by-side */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Main List Section */}
          <section className="flex-1 p-5 sm:p-7 overflow-y-auto flex flex-col h-full border-r border-indigo-50">
            
            {/* Header statistics block */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 shrink-0">
              <div>
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded">
                  {profile.regionSiDo} {profile.regionSiGunGu} 기준 매칭 요강
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  💡 {profile.name}님을 위한 <span className="text-indigo-600 underline underline-offset-4 decoration-indigo-300">{filteredPolicies.length}개의 맞춤 혜택</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  학업, 거주지, 소득수준 정보 기반으로 요건 충족 현황을 실시간 분석했습니다.
                </p>
              </div>

              {/* Reset/Status info display */}
              <div className="text-right text-[11px] text-slate-400 font-medium">
                안산 데이터 갱신: 오늘 오후 3:10
              </div>
            </div>

            {/* Quick action controls (Search input & Tabs for target statuses) */}
            <div className="bg-white p-3.5 border border-slate-100 rounded-2xl shadow-sm mb-5 flex flex-col gap-3 shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search text field */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="정책 이름, 주관 기관 또는 키워드 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium bg-slate-50 placeholder-slate-400"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-indigo-600 font-semibold"
                    >
                      지우기
                    </button>
                  )}
                </div>

                {/* Categories badges filter */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 font-medium text-xs">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
                        selectedCategory === cat
                          ? 'bg-indigo-950 text-white border-indigo-950 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Match type tab switches */}
              <div className="border-t border-slate-100 pt-3 flex flex-wrap justify-between items-center gap-2">
                <div className="flex gap-1.5 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'all'
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    모든 혜택 ({policies.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('eligible')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      activeTab === 'eligible'
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>자격 100% 충족 ({(Object.values(matchReports) as MatchReport[]).filter(r => r.isEligible).length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('review')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      activeTab === 'review'
                        ? 'bg-amber-50 text-amber-700 font-bold border border-amber-100'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <HelpCircle size={13} className="text-amber-500" />
                    <span>추가 보강 필요 ({(Object.values(matchReports) as MatchReport[]).filter(r => !r.isEligible).length})</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg">
                  {filteredPolicies.length}개 나열됨
                </div>
              </div>
            </div>

            {/* Policy Cards Grid list container */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                  <Sparkles size={16} className="text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800">김한양님 자거 요건 실시간 대조 중...</p>
                  <p className="text-xs text-slate-400 mt-1">중위소득 및 가구 세대 주소지 자격 연산 완료 단계</p>
                </div>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                  <Search size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">해당 조건에 맞는 정책이 없습니다</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    입력하신 나이(만 {profile.age}세), 지역({profile.regionSiDo}), 소득({profile.incomePercent}%) 및 학적({profile.studentStatus}) 요건에 정확히 부착하는 매칭 정책이 필터에 존재하지 않습니다.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('전체');
                      setActiveTab('all');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  >
                    필터 초기화하기
                  </button>
                  <button
                    onClick={() => {
                      setProfile(prev => ({ ...prev, age: 24, incomePercent: 110, studentStatus: '졸업예정' }));
                    }}
                    className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:bg-indigo-700"
                  >
                    기본 김한양 프로필로 리바인딩
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPolicies.map((p) => (
                  <PolicyCard
                    key={p.id}
                    policy={p}
                    match={matchReports[p.id]}
                    onClick={() => {
                      setSelectedPolicy(p);
                      setCustomResult(null);
                      setCheckedDocs({}); 
                      setShowErrorReported(false);
                      // Predefine initial companion message from assistant
                      setChatMessages([
                        {
                          role: 'assistant',
                          content: `안녕하세요 ${profile.name}님! 안산시와 경기도 요강을 바탕으로 분석된 [${p.title}] 자격 판단 리포트입니다. 수혜 예상 혜택은 [${p.benefits}]이며, 자약 분석 결과에 대해 궁금한 점이나 서류 준비 시 제외 사항은 무엇이든 채팅으로 여쭤봐 주세요!`
                        }
                      ]);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Right Detailed Panel: Interactive Report and AI Expert (If open) */}
          <section className="w-full md:w-96 lg:w-112 border-t md:border-t-0 md:border-l border-indigo-50 bg-white flex flex-col h-full overflow-y-auto">
            
            {/* If no policy is selected - show beautiful guide illustration card */}
            {!selectedPolicy && !customResult ? (
              <div className="flex-1 p-8 text-center flex flex-col items-center justify-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 relative shadow-sm">
                  <Compass size={40} className="text-indigo-600 animate-pulse" />
                  <Sparkles size={18} className="text-amber-400 absolute -top-1.5 -right-1.5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-indigo-950">청년 맞춤형 정밀 자격 판단 보고서</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    자격을 모른 채 1시간 이상 공문을 살펴보다가 지치지 않도록, 상세 목록에서 청년 혜택 카드 한 개를 클릭하여 **자격 항목별 미매칭 사유**, **원클릭 필수 서류 가이드** 및 **Gemini 정책 전문 챗봇** 솔루션을 열어보세요!
                  </p>
                </div>
                
                {/* Active user status summary in placeholder to fill empty layout */}
                <div className="w-full border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">실시간 대조 준비 완료 목록</p>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>연령: 만 {profile.age}세 (청년 연령 검지)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>지역: {profile.regionSiDo} {profile.regionSiGunGu} (관내 검지)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>소득 분위: {profile.incomePercent}%</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>학적: {profile.studentStatus}</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              // Active Detail Content Flow
              <div className="flex-1 flex flex-col h-full bg-white divide-y divide-slate-100">
                
                {/* Header & Meta Summary */}
                <div className="p-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white relative">
                  <button
                    onClick={() => {
                      setSelectedPolicy(null);
                      setCustomResult(null);
                    }}
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 transition-all"
                    title="대시보드로 돌아가기"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <span className="bg-indigo-500 text-[10px] font-extrabold text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-400">
                    {selectedPolicy ? selectedPolicy.category : customResult?.category}
                  </span>

                  <h3 className="text-lg font-extrabold text-white mt-2 leading-snug">
                    {selectedPolicy ? selectedPolicy.title : customResult?.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-indigo-200">
                    <span className="font-semibold flex items-center gap-1">
                      🏫 주관: {selectedPolicy ? selectedPolicy.host : customResult?.host}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-100/90 leading-relaxed mt-2 p-2.5 bg-white/5 rounded-xl border border-white/10 font-bold">
                    💰 수혜 혜택: {selectedPolicy ? selectedPolicy.benefits : customResult?.benefits}
                  </p>
                </div>

                {/* Section B-2: 자격 판단 결과 시각화 및 충족도 */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-600" />
                      <span>자격 세부 충족 요인 대조</span>
                    </h4>
                    
                    {/* Visual Rate Badge */}
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                      (selectedPolicy ? matchReports[selectedPolicy.id]?.isEligible : customResult?.isEligible)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {selectedPolicy 
                        ? `${matchReports[selectedPolicy.id]?.matchPercentage}% 매칭 성공` 
                        : `${customResult?.matchPercentage}% 매칭 분해`
                      }
                    </span>
                  </div>

                  {/* Meter graph bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-1 text-slate-700">
                      <span>필수요건 충족도</span>
                      <span>
                        {selectedPolicy 
                          ? `${matchReports[selectedPolicy.id]?.metCriteriaCount} / ${matchReports[selectedPolicy.id]?.totalCriteriaCount} 항목 통과`
                          : `${customResult?.criteriaChecks.filter(c => c.isMatch).length} / ${customResult?.criteriaChecks.length} 항목 통과`
                        }
                      </span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden p-[2px] border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          (selectedPolicy ? matchReports[selectedPolicy.id]?.isEligible : customResult?.isEligible)
                            ? 'bg-indigo-600'
                            : 'bg-amber-400'
                        }`}
                        style={{ 
                          width: `${selectedPolicy ? matchReports[selectedPolicy.id]?.matchPercentage : customResult?.matchPercentage}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Summary Banner of Eligibility */}
                  {(selectedPolicy ? matchReports[selectedPolicy.id]?.isEligible : customResult?.isEligible) ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <div className="font-semibold">
                        <p className="font-extrabold text-emerald-950">🎉 자격 요건 100% 충족 확정!</p>
                        <p className="text-[11px] text-emerald-800 mt-0.5">안심하고 아래 증빙 단계를 준비하셔도 괜찮습니다.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl text-xs mb-4 flex items-start gap-2">
                      <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      <div className="font-semibold">
                        <p className="font-extrabold text-rose-950">⚠️ 일부 미매칭 요건 발견</p>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {selectedPolicy 
                            ? '아래 붉게 강조된 미충족 조건이 실제로 해당되는지 검정 서류를 검토해보세요.'
                            : `${customResult?.reason}`
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Criteria Items Comparison Details Checklist */}
                  <div className="space-y-2">
                    {((selectedPolicy ? matchReports[selectedPolicy.id]?.items : customResult?.criteriaChecks) || []).map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          item.isMatch 
                            ? 'bg-slate-50 border-slate-100' 
                            : 'bg-rose-50/50 border-rose-100'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1 bg-white p-1 rounded border border-slate-100">
                          <span className="font-extrabold text-slate-800">{item.name}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                            item.isMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {item.isMatch ? (
                              <>
                                <CheckCircle2 size={11} />
                                <span>충족됨</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={11} />
                                <span>미충족</span>
                              </>
                            )}
                          </span>
                        </div>
                        
                        {/* Comparison HUD */}
                        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-600 leading-normal">
                          <div className="border-r border-slate-200/60 pr-1.5">
                            <span className="text-[10px] text-slate-400 font-bold block">내 입력값</span>
                            <span className="font-bold text-slate-700">{item.userValue}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">정부 공고 기준</span>
                            <span className="font-bold text-slate-700 truncate block" title={item.policyValue}>
                              {item.policyValue}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-normal italic pl-1 border-l-2 border-indigo-400">
                          ℹ️ {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Disclaimer (MANDATORY Safety Guideline) */}
                  <div className="mt-4 bg-slate-100/80 border border-slate-200/60 p-3 rounded-xl text-[11px] text-slate-500 font-medium">
                    <div className="flex items-start gap-1 text-slate-700 font-bold mb-1">
                      <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span>AI 자격 분석 필수 확인 안내</span>
                    </div>
                    <p className="leading-relaxed">
                      ⚠️ <strong className="text-slate-900 underline">AI 분석 결과는 참고용이며 최종 수혜 자격 조건은 관련 관공서 담당 창구를 통해 반드시 교차 대조 확인하세요.</strong> MatchUp은 공공 정보를 해석해 가이딩할 뿐 국가기관을 사칭하거나 권한을 대리하지 않습니다.
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px]">
                      <span>데이터 오판단을 인지하셨습니까?</span>
                      {showErrorReported ? (
                        <span className="text-indigo-600 font-bold">오류 신고 접수 완료 (감사합니다)</span>
                      ) : (
                        <button
                          onClick={() => setShowErrorReported(true)}
                          className="font-extrabold text-rose-600 hover:underline hover:text-rose-700 border border-rose-200 bg-white px-2 py-0.5 rounded active:scale-95 transition-all"
                        >
                          오류 신고하기
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section C-1: 필수 증빙 서류 바로가기 리스트 체크리스트 */}
                <div className="p-5 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                      <FileText size={14} className="text-indigo-600" />
                      <span>필수 구비 증빙 서류 안내 (C-1)</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {Object.values(checkedDocs).filter(Boolean).length} / {
                        selectedPolicy ? selectedPolicy.documents.length : customResult?.requiredDocuments.length
                      } 준비됨
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
                    본 혜택 지원 및 최종 접수에 필요한 서류입니다. 서류 명칭 옆의 <strong>발급처 버튼</strong>을 클릭해 수수료 없이 공인 발급을 이행하세요:
                  </p>

                  <div className="space-y-2">
                    {((selectedPolicy ? selectedPolicy.documents : customResult?.requiredDocuments) || []).map((doc, idx) => {
                      const isChecked = checkedDocs[doc.name] || false;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 bg-white rounded-xl border transition-all ${
                            isChecked ? 'border-indigo-400 bg-indigo-50/10' : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1.5">
                              <button 
                                onClick={() => toggleDocChecked(doc.name)}
                                className="text-slate-400 hover:text-indigo-600 transition-all shrink-0 mt-0.5"
                                aria-label="서류 완료 체크"
                              >
                                {isChecked ? (
                                  <CheckSquare size={16} className="text-indigo-600" />
                                ) : (
                                  <Square size={16} />
                                )}
                              </button>
                              <div>
                                <span className={`text-xs font-bold block ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                  {doc.name}
                                </span>
                                <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                                  {doc.description}
                                </span>
                                <span className="inline-block mt-1.5 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                  🏛️ 발급처: {doc.issueAgency}
                                </span>
                              </div>
                            </div>

                            <a
                              href={doc.issueUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-indigo-700 px-2.5 py-1 rounded font-bold shrink-0 flex items-center gap-0.5 transition-all"
                            >
                              <span>발급처</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submission external cta */}
                  <div className="mt-4">
                    <a
                      href={selectedPolicy ? selectedPolicy.applyUrl : 'https://www.gov.kr'}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      id="btn_apply_external"
                    >
                      <span>공식 대관 접수처 홈페이지로 바로 이동하기</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* Live Policy-specific Chat Box */}
                <div className="p-5 flex-1 flex flex-col min-h-[300px] bg-slate-50/30">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-indigo-600 animate-bounce" />
                      <span>{profile.name}님 전용 1:1 AI 예외 상담사</span>
                    </h4>
                    <span className="bg-purple-100 text-purple-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      Gemini 3.5 지원
                    </span>
                  </div>

                  {/* Chat bubbles container */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 max-h-48 border border-slate-100 rounded-xl p-3.5 mb-3 bg-white scrollbar-thin">
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed font-medium ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white font-semibold' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-xl px-3 py-2 text-xs bg-slate-100 text-slate-500 flex items-center gap-1.5 font-bold">
                          <RefreshCw size={12} className="animate-spin text-indigo-600" />
                          <span>Gemini 실시간 연령/소득 예외 기준 검사 중...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat submit field */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={userInputMessage}
                      onChange={(e) => setUserInputMessage(e.target.value)}
                      placeholder="예시: 대학 휴학생인데 아르바이트 중이면 지원되나요?"
                      className="flex-1 h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      disabled={chatLoading}
                      maxLength={150}
                    />
                    <button
                      type="submit"
                      className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-all shrink-0 active:scale-90 disabled:bg-slate-100 disabled:text-slate-400"
                      disabled={chatLoading || !userInputMessage.trim()}
                      aria-label="메시지 전송"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>

              </div>
            )}
          </section>

        </main>
      </div>

      {/* Footer / Info Margin */}
      <footer className="h-10 border-t border-slate-200 bg-white text-center py-2.5 text-[10px] text-slate-400 font-semibold shrink-0">
        &copy; 2026 MatchUp Co. All Rights Reserved. 개발 시뮬레이션용 가상 정보 포털 및 매칭 데모 프로토타입.
      </footer>
    </div>
  );
}
