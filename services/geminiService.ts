
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Customer, MatchResult, Enemy, Ingredient, LoveInterest, DialogueOption, Mail, RandomEvent } from "../types";
import { FALLBACK_CUSTOMERS, FALLBACK_EVENTS, FALLBACK_MAILS, FALLBACK_LOVE_INTERESTS, FALLBACK_CONSULTATIONS } from "../constants";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

// Define Schema for Customer Generation
const customerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    gender: { type: Type.STRING, enum: ['male', 'female', 'non-binary'] },
    age: { type: Type.INTEGER },
    job: { type: Type.STRING },
    mbti: { type: Type.STRING },
    appearance: { type: Type.STRING },
    bio: { type: Type.STRING },
    requirement: { type: Type.STRING },
    mood: { type: Type.STRING, description: "One word emotion: happy, sad, tired, excited" },
    avatarSeed: { type: Type.STRING },
    drinkPreference: { type: Type.STRING, enum: ['strong', 'sweet', 'bitter', 'sour', 'refreshing', 'spicy'] },
    drinkHint: { type: Type.STRING, description: "A sentence hinting at the drink preference without saying it directly" }
  },
  required: ["name", "gender", "age", "job", "mbti", "appearance", "bio", "requirement", "mood", "avatarSeed", "drinkPreference", "drinkHint"],
};

// Batch generation schema
const batchCustomerSchema: Schema = {
    type: Type.ARRAY,
    items: customerSchema
};

function getRandomFallbackCustomers(count: number): Customer[] {
    // Better random shuffling
    const shuffled = [...FALLBACK_CUSTOMERS].sort(() => 0.5 - Math.random());
    // Create copies with new IDs so we can have "same" person multiple times if needed, but distinct logic
    return shuffled.slice(0, count).map(c => ({...c, id: crypto.randomUUID()}));
}

export const generateBatchCustomers = async (count: number, day: number): Promise<Customer[]> => {
    const ai = getAiClient();
    if (!ai) return getRandomFallbackCustomers(count);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `生成 ${count} 个“赛博朋克+中国神话”背景下的酒吧顾客角色。
            请返回中文 JSON 数组。
            drinkPreference 必须是 strong, sweet, bitter, sour, refreshing, spicy 之一。`,
            config: {
                responseMimeType: "application/json",
                responseSchema: batchCustomerSchema,
                temperature: 1.1, 
            },
        });

        const data = JSON.parse(response.text || "[]");
        if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid format");

        return data.map((c: any) => ({
            id: crypto.randomUUID(),
            ...c,
            isRegular: Math.random() > 0.8,
            served: false,
        }));
    } catch (error) {
        console.warn("Gemini Batch Error (Falling back):", error);
        return getRandomFallbackCustomers(count);
    }
};

export const generateCustomer = async (day: number): Promise<Customer> => {
    const batch = await generateBatchCustomers(1, day);
    return batch[0];
};

const randomEventSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        statCheck: { 
            type: Type.OBJECT,
            properties: {
                stat: { type: Type.STRING, enum: ['logic', 'wisdom', 'charisma', 'cultivation'] },
                value: { type: Type.INTEGER }
            }
        },
        successText: { type: Type.STRING },
        failText: { type: Type.STRING },
        rewards: {
            type: Type.OBJECT,
            properties: {
                stat: { type: Type.STRING, enum: ['logic', 'wisdom', 'charisma', 'cultivation'] },
                value: { type: Type.INTEGER }
            }
        }
    }
}

export const generateRandomEvent = async (subject: string): Promise<RandomEvent | null> => {
    const ai = getAiClient();
    
    // Fallback function
    const getFallback = () => {
        const event = FALLBACK_EVENTS[Math.floor(Math.random() * FALLBACK_EVENTS.length)];
        return { ...event, id: crypto.randomUUID() };
    };

    if (!ai) return getFallback();
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `生成一个在“赛博修仙大学”上课时发生的突发事件。
            课程主题: ${subject}。
            返回中文 JSON。`,
            config: {
                responseMimeType: "application/json",
                responseSchema: randomEventSchema
            }
        });
        const data = JSON.parse(response.text || "{}");
        return {
            id: crypto.randomUUID(),
            ...data
        };
    } catch (e) {
        console.warn("Gemini Event Error:", e);
        return getFallback();
    }
}

const matchResultSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Compatibility score 0-100" },
    description: { type: Type.STRING, description: "Funny explanation in Chinese" },
    success: { type: Type.BOOLEAN, description: "True if score > 60" },
  },
  required: ["score", "description", "success"],
};

export const calculateMatch = async (p1: Customer, p2: Customer): Promise<MatchResult> => {
  const ai = getAiClient();
  
  // Enhanced Offline Logic
  const fallbackMatch = (): MatchResult => {
      // 1. MBTI Logic Check
      const m1 = p1.mbti;
      const m2 = p2.mbti;
      let score = 50;

      // N vs N is usually good, S vs S is good
      if (m1[1] === m2[1]) score += 15;
      // E vs I is often complementary
      if (m1[0] !== m2[0]) score += 10;
      // J vs P friction
      if (m1[3] !== m2[3]) score -= 5;
      
      // Random variance
      score += Math.floor(Math.random() * 40) - 10; 
      score = Math.max(0, Math.min(100, score));

      const success = score >= 60;
      
      // Local Descriptions
      const successDescs = [
          "两人的磁场发生了量子纠缠，这波稳了！",
          "从八字（数据流）来看，简直是天作之合。",
          "性格互补，虽然吵吵闹闹但离不开对方。",
          "红线直接绑成了死结，解都解不开！"
      ];
      const failDescs = [
          "这两人在一起比服务器宕机还灾难。",
          "聊不到三句就会开始互扔逻辑炸弹。",
          "信号完全不匹配，强行连接会导致系统崩溃。",
          "一个是火，一个是冰，注定没有结果。"
      ];

      const desc = success 
        ? successDescs[Math.floor(Math.random() * successDescs.length)]
        : failDescs[Math.floor(Math.random() * failDescs.length)];

      return {
          score,
          success,
          description: desc + " (离线预测)",
          coupleId: crypto.randomUUID(),
          partner1Name: p1.name,
          partner2Name: p2.name
      }
  };

  if (!ai) return fallbackMatch();

  try {
    const prompt = `
      评估两位角色的恋爱契合度。背景是赛博修仙世界。
      角色 A: ${JSON.stringify(p1)}
      角色 B: ${JSON.stringify(p2)}
      
      请用幽默、毒舌或富有哲理的中文进行点评（扮演老练的月老）。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: matchResultSchema,
      },
    });
    
    const res = JSON.parse(response.text || "{}");
    return {
        ...res,
        coupleId: crypto.randomUUID(),
        partner1Name: p1.name,
        partner2Name: p2.name
    };
  } catch (error) {
     console.warn("Gemini Match Error:", error);
     return fallbackMatch();
  }
};

export const evaluateDrink = async (customer: Customer, ingredients: Ingredient[]): Promise<{comment: string, satisfied: boolean}> => {
    // Local logic for strictness (always runs)
    const flavors = ingredients.map(i => i.flavor);
    const pref = customer.drinkPreference;
    const matchCount = flavors.filter(f => f === pref).length;
    // Need at least one matching flavor, or if 'strong', high alcohol cost? Simplified to flavor match.
    const satisfied = matchCount > 0;

    const ai = getAiClient();
    
    // Enhanced Fallback comments
    const getFallbackComment = () => {
        const happyComments = [
            "这味道...让我想起了初次飞升的感觉！(满意)",
            "这正是我想喝的，老板懂我！(满意)",
            "虽然数据很简单，但口感很高级。(满意)",
            "好酒！赏你个好评！(满意)"
        ];
        const sadComments = [
            "这根本不是我想要的口味... (失望)",
            "喝起来像过期的机油。 (失望)",
            "你是想毒死我好继承我的花呗吗？ (失望)",
            "完全不对... 退钱！ (失望)"
        ];

        if (satisfied) return happyComments[Math.floor(Math.random() * happyComments.length)];
        return sadComments[Math.floor(Math.random() * sadComments.length)];
    };

    if (!ai) return { comment: getFallbackComment(), satisfied };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `顾客: ${customer.name}, 想要: ${customer.drinkPreference}。
            实际得到: ${flavors.join(", ")}。
            Match status: ${satisfied ? "Success" : "Failure"}.
            以顾客口吻写一句中文评价。`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { comment: { type: Type.STRING } }
                }
            }
        });
        const data = JSON.parse(response.text || "{}");
        return { comment: data.comment, satisfied };
    } catch (e) {
        return { comment: getFallbackComment(), satisfied };
    }
};

// Removed generateLoveInterest as we now use fixed ones, but we need dialogue generation

export const generateDialogue = async (char: LoveInterest, lastAction: string): Promise<{ text: string, options: DialogueOption[] }> => {
    const ai = getAiClient();
    // Simple fallback dialogue
    if (!ai) return { 
        text: `（${char.name} 看着你，似乎在思考什么...）`, 
        options: [
            { id: "o1", text: "微笑", impact: "positive" },
            { id: "o2", text: "沉默", impact: "neutral" },
            { id: "o3", text: "转身离开", impact: "negative" }
        ] 
    };

    try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `角色: ${char.name} (${char.title})
            性格: ${char.personality}
            简介: ${char.description}
            好感度: ${char.affinity}
            
            玩家刚刚做了/说了: "${lastAction}"。
            请生成角色的回复（text）和玩家的3个回复选项（options）。
            回复要符合角色设定的语气。
            返回中文 JSON。`,
            config: { responseMimeType: "application/json" }
         });
         return JSON.parse(response.text || "{}");
    } catch (e) {
        return { text: "...", options: [] };
    }
};

export const generateEnemy = async (day: number): Promise<Enemy> => {
    const ai = getAiClient();
    const fallbackEnemy = { name: "反恋爱算法 (Offline)", description: "试图将所有人类匹配为NULL的本地代码。", hp: 100, maxHp: 100, attack: 10 };
    
    if(!ai) return fallbackEnemy;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `生成一个试图砍断姻缘树的“邪恶势力”。
            难度系数：第 ${day} 天。
            返回中文 JSON。`,
            config: { responseMimeType: "application/json" }
        });
        const data = JSON.parse(response.text || "{}");
        return {
            name: data.name,
            description: data.description,
            hp: 50 + (day * 15),
            maxHp: 50 + (day * 15),
            attack: 5 + day
        };
    } catch (e) {
        return fallbackEnemy;
    }
};

const mailSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    senderName: { type: Type.STRING },
    subject: { type: Type.STRING },
    content: { type: Type.STRING },
    options: { 
        type: Type.ARRAY,
        items: {
             type: Type.OBJECT,
             properties: {
                 id: { type: Type.STRING },
                 text: { type: Type.STRING },
                 impact: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'] }
             }
        }
    }
  },
  required: ["subject", "content", "options", "senderName"]
};

export const generateMail = async (names: string, day: number): Promise<Mail | null> => {
    const ai = getAiClient();
    
    const getFallback = () => {
        const mail = FALLBACK_MAILS[Math.floor(Math.random() * FALLBACK_MAILS.length)];
        return { ...mail, id: crypto.randomUUID(), senderNames: names, dayReceived: day };
    };

    if (!ai) return getFallback();

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `背景：玩家是月老，之前撮合了 ${names}。
            现在是配对后的第几天，请生成一封他们发来的信件。
            返回中文 JSON。`,
            config: {
                responseMimeType: "application/json",
                responseSchema: mailSchema
            }
        });
        const data = JSON.parse(response.text || "{}");
        return {
            id: crypto.randomUUID(),
            senderNames: names,
            subject: data.subject,
            content: data.content,
            isRead: false,
            dayReceived: day,
            options: data.options,
            resolved: false,
            type: 'feedback'
        };
    } catch (e) {
        return getFallback();
    }
};

export const generateConsultationMail = async (day: number): Promise<Mail> => {
    const ai = getAiClient();
    const fallback = FALLBACK_CONSULTATIONS[Math.floor(Math.random() * FALLBACK_CONSULTATIONS.length)];
    const fallbackObj = { ...fallback, id: crypto.randomUUID(), dayReceived: day };

    if (!ai) return fallbackObj;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `生成一封来自赛博朋克世界陌生人的情感咨询邮件。
            比如：人类爱上AI、义体改造导致情感缺失、网恋对象是全息投影等。
            返回中文 JSON。
            格式：{ subject, content, senderName, options: [{id, text, impact: 'positive'|'negative'|'neutral'}] }`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: mailSchema 
            }
        });
        const data = JSON.parse(response.text || "{}");
        return {
            id: crypto.randomUUID(),
            senderNames: data.senderName || "匿名咨询者",
            subject: data.subject,
            content: data.content,
            isRead: false,
            dayReceived: day,
            options: data.options,
            resolved: false,
            type: 'consultation'
        };
    } catch (e) {
        return fallbackObj;
    }
};
