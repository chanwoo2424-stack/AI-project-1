import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { POLICIES, calculateDeterministicMatch } from './src/policiesData';
import { UserProfile } from './src/types';

dotenv.config();

// Initialize Gemini SDK lazily to prevent startup crash if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Get all policies
  app.get('/api/policies', (req, res) => {
    try {
      res.json({ success: true, count: POLICIES.length, data: POLICIES });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route: Get deterministic match stats for a policy against an active profile
  app.post('/api/policies/match', (req, res) => {
    try {
      const { userProfile, policyId } = req.body;
      if (!userProfile) {
        return res.status(400).json({ success: false, error: 'User profile is mandatory.' });
      }

      if (policyId) {
        const policy = POLICIES.find(p => p.id === policyId);
        if (!policy) {
          return res.status(404).json({ success: false, error: 'Policy not found.' });
        }
        const matchResult = calculateDeterministicMatch(userProfile, policy);
        return res.json({ success: true, data: matchResult });
      }

      // If no specific policyId is provided, compute matches across all policies
      const matches = POLICIES.map(p => {
        const matchResult = calculateDeterministicMatch(userProfile, p);
        return {
          policy: p,
          match: matchResult
        };
      });

      res.json({ success: true, data: matches });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route: Ask Gemini detailed questions about this policy eligibility
  app.post('/api/policy-chat', async (req, res) => {
    try {
      const { userProfile, policyContext, messages } = req.body;
      if (!userProfile || !policyContext || !messages) {
        return res.status(400).json({ success: false, error: 'Missing chat parameters.' });
      }

      const ai = getGenAI();
      const currentMessage = messages[messages.length - 1]?.content || '';

      const systemInstruction = `
      당신은 대한민국 청년 지원 정책 분야의 전문 AI 상담사입니다. 
      아래에 전달되는 [사용자 개인 정보 프로필]과 [상담 대상 청년지원정책 명세]를 철저히 파악하여, 사용자가 질문하는 자격 요건 충족 가능성과 신청 팁을 친절하고 상세하게 답변해야 합니다.

      [사용자 개인 정보 프로필]:
      - 성명: ${userProfile.name}
      - 나이: 만 ${userProfile.age}세
      - 거주지 시/도: ${userProfile.regionSiDo}
      - 거주지 시/군/구: ${userProfile.regionSiGunGu}
      - 중위소득 등급: 기준 중위소득 ${userProfile.incomePercent}% 수준
      - 현대 학적/고용 상태: ${userProfile.studentStatus}
      - 관심 분야: ${userProfile.interestSectors?.join(', ') || '미선택'}

      [상담 대상 청년지원정책 명세]:
      - 정책명: ${policyContext.title}
      - 주관구분: ${policyContext.host}
      - 주요 혜택내용: ${policyContext.benefits}
      - 자격 조건 설명: ${policyContext.targetDescription}

      [답변 주의 및 윤리규정]:
      1. 상담 대상 정책 정보를 임의로 지어내거나 사실을 외곡하지 마십시오.
      2. 사용자 프로필을 바탕으로 나이, 소득수준, 거주지, 고용상태 등 각 항목을 정밀 비교해 자격 충족 여부를 "확신 및 안도감" 있는 톤으로 설명하십시오.
      3. 만약 소득이나 자격 조건 등에서 판단이 불투명한 부분이 존재한다면 숨기지 않고 명시하고, "최종 심사 및 정밀 자격은 관련 관공서 담당 창구를 통해 무조건 교차 확인하시기 바랍니다."라는 법률 근거 안내 문구를 포함하십시오.
      4. 바쁜 청년 대학생을 위해 딱딱한 법률 용어를 풀어서 쉬운 우리말로 정갈하게 대화체로 답변해야 합니다.
      `;

      // Formulate the prompt sequence or context
      const chatHistoryPrompt = messages.map((m: any) => `${m.role === 'user' ? '질문' : '답변'}: ${m.content}`).join('\n');
      const finalPrompt = `
      대화 내역:
      ${chatHistoryPrompt}
      
      사용자의 최근 질문: "${currentMessage}"
      
      전문 상담사로서 한글 대화 톤으로 격조 높고 따뜻하고 명쾌하게 답변해 주세요.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: finalPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ success: true, reply: response.text });
    } catch (error: any) {
      console.error("Gemini Policy Chat Error: ", error);
      res.status(500).json({ success: false, error: 'Gemini 서버 연동 중 오류 발생: ' + error.message });
    }
  });

  // API Route: Custom Unstructured Text Parser and Matcher
  app.post('/api/analyze-custom', async (req, res) => {
    try {
      const { userProfile, policyText } = req.body;
      if (!userProfile || !policyText) {
        return res.status(400).json({ success: false, error: 'User profile and unstructured policy text are required.' });
      }

      const ai = getGenAI();

      const systemInstruction = `
      당신은 대한민국 청년 지원 정책 텍스트 전문 분석가입니다. 
      사용자가 인스타그램, 에브리타임, SNS, 혹은 공문서 공고에서 붙여넣은 비정형적이고 정제되지 않은 청년지원 공고문([사용자가 입력한 비정형 공고문])을 철저히 독해하십시오.
      
      그리고 함께 제공된 [사용자의 개인 정보 프로필]을 정합해 자격 수혜 결과를 정밀히 판단하십시오.
      
      [사용자의 개인 정보 프로필]:
      - 성명: ${userProfile.name}
      - 나이: 만 ${userProfile.age}세
      - 거주 지역: ${userProfile.regionSiDo} ${userProfile.regionSiGunGu}
      - 중위소득: 기준 중위소득 ${userProfile.incomePercent}% 수준
      - 현대 학적/고용 상태: ${userProfile.studentStatus}

      [분석 가이드]:
      - 사용자가 입력한 공고문 텍스트에서 정책명(title), 주관기관(host), 연령 조건, 소득 조건, 거주지 조건, 학적 상태 조건을 추출하십시오.
      - 사용자의 프로필 상태와 각 요건을 개별 비교하여 '충족 여부(isMatch)'와 판단한 '근거(desc)'를 구체적으로 수립합니다.
      - 최종 수혜 대상자 자격에 부합하는지 100% 대상자인지에 근거를 바탕으로 매칭률(%)을 산출하십시오. 충족 항목수 / 총 요구 항목수 * 100 입니다.
      - 해당 정책 신청에 반드시 필요한 증빙 서류 정보(requiredDocuments) 및 발급처가 공고에 서술되어 있다면 추출하거나, 보편적 상식에서 추출하여 목록화해 안내하도록 합니다.
      - "AI 분석 결과는 참고용이며 최종 자격은 관공서에 확인하세요" 경고 및 가이드를 명시하십시오.

      출력은 반드시 지정된 JSON schema 포맷을 정확히 지켜 전송해 주십시오. JSON 내부 속성의 값들은 반드시 한국어로 기술하십시오.
      `;

      const prompt = `
      [사용자가 입력한 비정형 공고문]:
      """
      ${policyText}
      """
      
      이 비정형 텍스트를 철저하게 분석하고 사용자의 프로필 조건에 비추어 자격 결과를 파싱한 후 상세 JSON 구조로 응답해 주세요.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "정책 및 사업 이름" },
              category: { type: Type.STRING, description: "분류: '취업' | '창업' | '주거' | '금융/소득' | '생활/복지'" },
              host: { type: Type.STRING, description: "정책 주관 부처 또는 지자체" },
              summary: { type: Type.STRING, description: "정책 개요 요약 (100자 이하)" },
              benefits: { type: Type.STRING, description: "구체적 수혜 혜택 자금이나 내용" },
              isEligible: { type: Type.BOOLEAN, description: "모든 필수 조건을 충족해서 100% 대상자인가 여부" },
              matchPercentage: { type: Type.INTEGER, description: "전체 조건 중 사용자 프로필이 부합하는 충족율 (0~100)" },
              reason: { type: Type.STRING, description: "종합 판정 세부 사유 요약 (대상자 확정 사유 또는 특정 요건 미달 사유)" },
              criteriaChecks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "요건 명칭 (예: '나이 조건', '거주지 조건', '소득 조건', '고용 조건 등')" },
                    isMatch: { type: Type.BOOLEAN, description: "해당 항목 충족 여부" },
                    userValue: { type: Type.STRING, description: "사용자의 현재 조건 값" },
                    policyValue: { type: Type.STRING, description: "정책이 요구하는 자격 기준 요강" },
                    desc: { type: Type.STRING, description: "충족 여부에 대한 세부 상세 소견 설명" }
                  },
                  required: ["name", "isMatch", "userValue", "policyValue", "desc"]
                },
                description: "세부 자격 요건 대조 일체 목록"
              },
              requiredDocuments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "제출 서류 명칭" },
                    description: { type: Type.STRING, description: "서류 제출이 필요해진 맥락이나 설명" },
                    issueAgency: { type: Type.STRING, description: "발급 행정 기관" },
                    issueUrl: { type: Type.STRING, description: "온라인 바로가기 주소 (모르는 경우 일반 정부24 포털 주관 주소 제공)" }
                  },
                  required: ["name", "description", "issueAgency", "issueUrl"]
                },
                description: "필수 증빙 서류 목록"
              }
            },
            required: ["title", "category", "host", "summary", "benefits", "isEligible", "matchPercentage", "reason", "criteriaChecks", "requiredDocuments"]
          }
        }
      });

      const parsedResult = JSON.parse(response.text || '{}');
      res.json({ success: true, data: parsedResult });
    } catch (error: any) {
      console.error("Gemini Custom Policy Analysis Error: ", error);
      res.status(500).json({ success: false, error: 'Gemini 비정형 분석 오류: ' + error.message });
    }
  });


  // Serve frontend routes using Vite in development or static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MatchUp Server running on port ${PORT}`);
  });
}

startServer();
