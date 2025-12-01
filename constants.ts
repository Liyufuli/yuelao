
import { PlayerStats, Ingredient, BarUpgrade, ShopItem, Staff, Customer, RandomEvent, Mail, LoveInterest, Milestone, SpecialNPC } from "./types";

export const MAX_ENERGY = 100;

export const INITIAL_STATS: PlayerStats = {
  energy: MAX_ENERGY,
  money: 500,
  cultivation: 0,
  reputation: 0,
  day: 1,
  maxEnergy: MAX_ENERGY,
  restCount: 0,
  logic: 10,
  wisdom: 10,
  charisma: 10,
};

export const MAX_REST_PER_DAY = 2; 
export const ENERGY_COST_CLASS = 25; 
export const ENERGY_COST_WORK = 10;
export const ENERGY_COST_MATCH = 20;
export const MAX_CUSTOMERS = 8;

export const MILESTONES: Milestone[] = [
    {
        id: "m1", title: "实习转正", desc: "存活到第 3 天",
        condition: (s, m) => s.day >= 3,
        reward: { type: "money", value: 500 },
        claimed: false
    },
    {
        id: "m2", title: "第一桶金", desc: "持有香火钱超过 1000",
        condition: (s, m) => s.money >= 1000,
        reward: { type: "reputation", value: 50 },
        claimed: false
    },
    {
        id: "m3", title: "初级红娘", desc: "成功撮合 3 对情侣",
        condition: (s, m) => m >= 3,
        reward: { type: "cultivation", value: 100 },
        claimed: false
    },
    {
        id: "m4", title: "学霸月老", desc: "逻辑、悟性、魅力均达到 20",
        condition: (s, m) => s.logic >= 20 && s.wisdom >= 20 && s.charisma >= 20,
        reward: { type: "energy", value: 100 }, 
        claimed: false
    },
    {
        id: "m5", title: "远近闻名", desc: "口碑达到 100",
        condition: (s, m) => s.reputation >= 100,
        reward: { type: "money", value: 2000 },
        claimed: false
    },
    {
        id: "m6", title: "金牌月老", desc: "成功撮合 10 对情侣",
        condition: (s, m) => m >= 10,
        reward: { type: "cultivation", value: 500 },
        claimed: false
    }
];

export const CLASSES = [
  { name: "数据结构与红线学", desc: "提升逻辑思维，看穿渣男渣女。", stat: "logic" },
  { name: "恋爱心理马克思", desc: "提升悟性，理解人类迷惑行为。", stat: "wisdom" },
  { name: "赛博口才艺术", desc: "提升魅力，让人无法拒绝你的推销。", stat: "charisma" },
];

export const PREDEFINED_STAFF: Staff[] = [
  { 
    id: "staff_1", name: "苏苏", role: "调酒师", desc: "九尾狐后裔，调的酒能让人说真话。", 
    cost: 500, salary: 50, effect: "money_boost", affinity: 0, avatarSeed: "susu_fox", isHired: false,
    dialogue: ["老板，今天的酒里要加点魅惑药水吗？", "哼，那个客人一直在看我尾巴。", "你可以...再靠近一点点。"]
  },
  { 
    id: "staff_2", name: "阿强-T800", role: "保镖", desc: "退役的军用义体，非常有安全感。", 
    cost: 800, salary: 80, effect: "reputation_boost", affinity: 0, avatarSeed: "robot_guard", isHired: false,
    dialogue: ["安全协议已启动。", "检测到老板心跳加速，是否需要医疗支援？", "无论发生什么，我都会挡在你身前。"]
  },
  { 
    id: "staff_3", name: "艾米", role: "服务员", desc: "元气满满的猫耳娘（或者是义体改造？）。", 
    cost: 300, salary: 30, effect: "charisma_boost", affinity: 0, avatarSeed: "amy_cat", isHired: false,
    dialogue: ["欢迎光临！喵~", "老板老板，我想吃那个金枪鱼罐头！", "只要看着你的脸，我就充满了干劲！"]
  }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: "item_energy", name: "高能营养液", desc: "立即恢复 50 点精力", price: 100, effect: "energy+50" },
  { id: "item_logic", name: "量子运算芯片", desc: "逻辑 +5 (一次性)", price: 400, effect: "logic+5" },
  { id: "item_wisdom", name: "电子佛珠", desc: "悟性 +5 (一次性)", price: 400, effect: "wisdom+5" },
  { id: "item_charisma", name: "全息美颜滤镜", desc: "魅力 +5 (一次性)", price: 400, effect: "charisma+5" },
];

export const INITIAL_BAR_UPGRADES: BarUpgrade[] = [
  { id: "bg_default", name: "工业风水泥墙", type: "background", desc: "虽然简陋，但是硬朗。", price: 0, reputationBonus: 0, active: true, cssClass: "bg-slate-900" },
  { id: "bg_cyber", name: "全息数码墙纸", type: "background", desc: "流动的代码瀑布，非常有格调。", price: 800, reputationBonus: 20, active: false, cssClass: "bg-[url('https://media.giphy.com/media/uQ4V7FPxcDKM/giphy.gif')] bg-cover opacity-50" },
  
  { id: "furn_wood", name: "宜家折叠椅", type: "furniture", desc: "屁股会痛。", price: 0, reputationBonus: 0, active: true, cssClass: "border-gray-600" },
  { id: "furn_neon", name: "反重力悬浮座", type: "furniture", desc: "客人会飘在空中喝酒。", price: 1200, reputationBonus: 50, active: false, cssClass: "border-cyan-400 shadow-[0_0_15px_cyan]" },

  { id: "atm_none", name: "昏暗灯泡", type: "atmosphere", desc: "为了省电。", price: 0, reputationBonus: 0, active: true, cssClass: "" },
  { id: "atm_pink", name: "暧昧粉雾", type: "atmosphere", desc: "空气中弥漫着恋爱的酸臭味。", price: 500, reputationBonus: 30, active: false, cssClass: "shadow-[inset_0_0_100px_rgba(236,72,153,0.3)]" },
];

export const INGREDIENTS: Ingredient[] = [
  // Bases
  { id: "base_1", name: "量子伏特加", type: "base", desc: "烈性，可能会导致短暂的测不准原理。", cost: 15, flavor: "strong", color: "#e0f7fa" },
  { id: "base_2", name: "合成桃花酿", type: "base", desc: "传统的味道，加入了赛博甜味剂。", cost: 12, flavor: "sweet", color: "#f8bbd0" },
  { id: "base_3", name: "液态硬盘水", type: "base", desc: "清冷，如同数据流淌。", cost: 10, flavor: "refreshing", color: "#81d4fa" },
  { id: "base_4", name: "机油威士忌", type: "base", desc: "只有老式义体才能消化的苦涩。", cost: 18, flavor: "bitter", color: "#ffcc80" },
  // Mixers
  { id: "mix_1", name: "霓虹通宁水", type: "mixer", desc: "发着蓝光的汽水。", cost: 5, flavor: "refreshing", color: "#64ffda" },
  { id: "mix_2", name: "忘情酸", type: "mixer", desc: "极酸，让人五官扭曲从而暂时忘忧。", cost: 8, flavor: "sour", color: "#c6ff00" },
  { id: "mix_3", name: "多巴胺糖浆", type: "mixer", desc: "甜得发腻，瞬间快乐。", cost: 10, flavor: "sweet", color: "#ff4081" },
  { id: "mix_4", name: "辣椒防火墙", type: "mixer", desc: "火辣辣的口感。", cost: 6, flavor: "spicy", color: "#ff5252" },
  // Garnish
  { id: "gar_1", name: "电子柠檬片", type: "garnish", desc: "全息投影的柠檬，只有视觉酸味。", cost: 2, flavor: "sour", color: "#ffff00" },
  { id: "gar_2", name: "红线结", type: "garnish", desc: "一根可食用的红绳，寓意吉祥。", cost: 5, flavor: "sweet", color: "#d50000" },
  { id: "gar_3", name: "内存条饼干", type: "garnish", desc: "酥脆的硅基口感。", cost: 3, flavor: "bitter", color: "#1b5e20" },
  { id: "gar_4", name: "液氮玫瑰", type: "garnish", desc: "冻结时间的浪漫。", cost: 15, flavor: "refreshing", color: "#2962ff" },
  { id: "gar_5", name: "赛博朝天椒", type: "garnish", desc: "真的很辣。", cost: 4, flavor: "spicy", color: "#b71c1c" },
  { id: "gar_6", name: "纯酒精胶囊", type: "garnish", desc: "加重酒精浓度。", cost: 10, flavor: "strong", color: "#ffffff" },
];

export const FIXED_LOVE_INTERESTS: LoveInterest[] = [
    {
        id: "li_sword", name: "李逍遥·2077", title: "赛博剑仙", 
        description: "踩着反重力滑板的冷酷剑客，背上背着一把激光重剑。",
        personality: "傲娇、正义、有些中二", avatarSeed: "sword_hero", affinity: 0, firstMeeting: true,
        openingLine: "老板，你这酒能解千愁吗？还是说只能解bug？", unlocked: true
    },
    {
        id: "li_hacker", name: "0x_Ch0", title: "天才黑客", 
        description: "戴着发光护目镜的双马尾少女，手里永远在摆弄全息终端。",
        personality: "古灵精怪、毒舌、技术宅", avatarSeed: "hacker_girl", affinity: 0, firstMeeting: true,
        openingLine: "哎呀，这酒吧的防火墙挺别致啊，我都忍不住想戳一下。", unlocked: true
    },
    {
        id: "li_idol", name: "苏妲己_V3", title: "全息偶像", 
        description: "拥有九条机械尾巴的顶级虚拟偶像，一颦一笑都带着魅惑算法。",
        personality: "温柔、腹黑、完美主义", avatarSeed: "fox_idol", affinity: 0, firstMeeting: true,
        openingLine: "嘘... 别出声，我是偷偷溜出来的。能给我一杯这一季的新品吗？", unlocked: true
    }
];

export const SPECIAL_NPCS: SpecialNPC[] = [
    {
        id: "npc_wealth", name: "财神·赵公明", title: "天庭CFO", desc: "掌管三界经济流动的最高执行官。",
        avatarSeed: "wealth_god", dialogue: "年轻人，看你这店生意不错，本神看好你这只潜力股。",
        reward: { type: "money", value: 888 }
    },
    {
        id: "npc_leader", name: "月老主管", title: "姻缘部部长", desc: "你的顶头上司，总是拿着KPI报表。",
        avatarSeed: "yue_lao", dialogue: "最近的配对率还可以，继续保持。这是组织给你的补贴。",
        reward: { type: "reputation", value: 50 }
    },
    {
        id: "npc_guard", name: "二郎神", title: "安保队长", desc: "带着哮天犬（机械狗）巡逻。",
        avatarSeed: "erlang_shen", dialogue: "例行检查...嗯，没有违禁品。注意安全。",
        reward: { type: "energy", value: 50 }
    }
];

// --- EXTENDED FALLBACK DATA FOR OFFLINE MODE ---

export const FALLBACK_CUSTOMERS: Customer[] = [
  {
    id: "c1", name: "李逍遥_2077", gender: "male", age: 25, job: "御剑飞行外卖员", mbti: "ESTP",
    appearance: "背着反重力滑板，穿着古风冲锋衣", bio: "想找个人一起送外卖，顺便仗剑走天涯。",
    requirement: "不恐高，喜欢吃麻辣烫。", isRegular: false, served: false, mood: "exciting",
    avatarSeed: "li_xiaoyao", drinkPreference: "spicy", drinkHint: "想喝点刺激的，像御剑飞行一样的感觉！"
  },
  {
    id: "c2", name: "林黛玉_Beta", gender: "female", age: 19, job: "情感数据分析师", mbti: "INFP",
    appearance: "柔弱的仿生人，眼角总是有模拟泪水", bio: "我的核心代码里写满了忧伤。",
    requirement: "懂文学，最好能一起葬花（清理垃圾内存）。", isRegular: true, served: false, mood: "sad",
    avatarSeed: "lin_daiyu", drinkPreference: "bitter", drinkHint: "生活太苦了，我想喝点和我心情一样的东西。"
  },
  {
    id: "c3", name: "孙悟空_Mecha", gender: "male", age: 500, job: "安保系统主管", mbti: "ENTJ",
    appearance: "金色合金外壳，手持伸缩警棍", bio: "曾经大闹天宫（黑进服务器），现在只想找个猴子（划掉）伴侣。",
    requirement: "能管得住我，脾气要好。", isRegular: false, served: false, mood: "happy",
    avatarSeed: "wukong", drinkPreference: "strong", drinkHint: "给俺老孙来最烈的酒！"
  },
  {
    id: "c4", name: "织女_Streamer", gender: "female", age: 22, job: "全息纺织主播", mbti: "ESFJ",
    appearance: "穿着流光溢彩的云锦汉服", bio: "家人们谁懂啊，一年只能见一次老公太难了。",
    requirement: "不当异地恋，要有时间陪我。", isRegular: true, served: false, mood: "tired",
    avatarSeed: "zhinu", drinkPreference: "sweet", drinkHint: "直播太累了，想要甜甜的安慰。"
  },
  {
    id: "c5", name: "哪吒_Cyber", gender: "non-binary", age: 16, job: "极限运动博主", mbti: "ISTP",
    appearance: "踩着风火轮滑板，戴着AR眼镜", bio: "我命由我不由天（系统）！",
    requirement: "能陪我一起疯，别太唠叨。", isRegular: false, served: false, mood: "exciting",
    avatarSeed: "nezha", drinkPreference: "refreshing", drinkHint: "刚跑完酷，来点清爽的降降温！"
  },
  {
    id: "c6", name: "白素贞_Med", gender: "female", age: 1000, job: "生物制药专家", mbti: "INFJ",
    appearance: "白大褂，戴着蛇形耳环", bio: "为了找恩人，我黑入了民政局数据库。",
    requirement: "老实人，最好是医生。", isRegular: false, served: false, mood: "happy",
    avatarSeed: "whitesnake", drinkPreference: "sour", drinkHint: "想要一种初恋般青涩酸楚的味道。"
  },
  {
    id: "c7", name: "牛魔王_Boss", gender: "male", age: 45, job: "黑帮老大", mbti: "ESTJ",
    appearance: "穿着貂皮大衣，戴着金链子", bio: "怕老婆（铁扇公主），出来喝闷酒。",
    requirement: "别告诉我老婆我在这。", isRegular: true, served: false, mood: "sad",
    avatarSeed: "bullking", drinkPreference: "strong", drinkHint: "最近压力大，给我来杯最劲的！"
  },
  {
    id: "c8", name: "嫦娥_Space", gender: "female", age: 28, job: "月球基地站长", mbti: "ISFP",
    appearance: "穿着宇航服，抱着电子玉兔", bio: "月球上太冷清了，想找个地球人聊天。",
    requirement: "能接受异球恋，喜欢小动物。", isRegular: false, served: false, mood: "sad",
    avatarSeed: "change", drinkPreference: "refreshing", drinkHint: "想要像广寒宫一样冰冷的酒。"
  },
  // New Additions
  {
    id: "c9", name: "二郎神_Eye", gender: "male", age: 30, job: "天眼监控主管", mbti: "ISTJ",
    appearance: "额头有一只红色电子义眼", bio: "我看清了所有人，却看不清自己的心。",
    requirement: "遵纪守法，没有犯罪记录。", isRegular: false, served: false, mood: "tired",
    avatarSeed: "erlang", drinkPreference: "bitter", drinkHint: "加班三天了，来点苦咖啡味的酒提提神。"
  },
  {
    id: "c10", name: "白骨精_Beauty", gender: "female", age: 24, job: "美妆博主", mbti: "ESTP",
    appearance: "皮肤苍白，可以随意更换面部骨骼", bio: "画皮画虎难画骨，知人知面不知心。",
    requirement: "必须是颜控，能接受我每天换脸。", isRegular: true, served: false, mood: "exciting",
    avatarSeed: "baigujing", drinkPreference: "sweet", drinkHint: "要甜甜的，像我的粉丝一样甜。"
  },
  {
    id: "c11", name: "唐僧_HR", gender: "male", age: 27, job: "人力资源总监", mbti: "ENFJ",
    appearance: "穿着袈裟风格的西装，光头", bio: "Only you... 能伴我取西经（完成KPI）。",
    requirement: "能忍受我的碎碎念。", isRegular: false, served: false, mood: "happy",
    avatarSeed: "tangseng", drinkPreference: "refreshing", drinkHint: "阿弥陀佛，来杯清茶般的酒，莫要贪杯。"
  },
  {
    id: "c12", name: "蜘蛛精_Web", gender: "female", age: 21, job: "全栈工程师", mbti: "INTP",
    appearance: "身后有六只机械臂在敲键盘", bio: "我编织的网（Web），从来没有Bug。",
    requirement: "不仅要懂Python，还要懂我。", isRegular: false, served: false, mood: "tired",
    avatarSeed: "spider", drinkPreference: "strong", drinkHint: "Debug了一整晚，需要高浓度的酒精重启大脑。"
  },
  {
    id: "c13", name: "玉兔_Pharm", gender: "female", age: 18, job: "药剂师学徒", mbti: "ISFJ",
    appearance: "戴着长长的兔耳耳机，在那捣药", bio: "嫦娥姐姐最近不理我了呜呜。",
    requirement: "喜欢吃胡萝卜味能量棒。", isRegular: true, served: false, mood: "sad",
    avatarSeed: "yutu", drinkPreference: "sour", drinkHint: "酸酸的，像我现在的柠檬精心情。"
  },
  {
    id: "c14", name: "雷公_Power", gender: "male", age: 35, job: "电力工程师", mbti: "ESTJ",
    appearance: "背着巨大的电池包，头发竖起", bio: "没有我，整个赛博城都要停电。",
    requirement: "不怕触电（物理）。", isRegular: false, served: false, mood: "exciting",
    avatarSeed: "leigong", drinkPreference: "spicy", drinkHint: "来杯带电的！要麻辣味的！"
  },
  {
    id: "c15", name: "孟婆_Barista", gender: "female", age: 99, job: "连锁咖啡店长", mbti: "INFJ",
    appearance: "慈祥的老奶奶，手里拿着汤勺", bio: "喝了我的汤，忘了那个渣男吧。",
    requirement: "喜欢听故事，不嫌弃老年人。", isRegular: true, served: false, mood: "happy",
    avatarSeed: "mengpo", drinkPreference: "bitter", drinkHint: "人生百味，尽在苦涩之中。来杯苦的。"
  }
];

export const FALLBACK_EVENTS: RandomEvent[] = [
    {
        id: "ev1", title: "迷路的新生", description: "一个大一新生迷失在了复杂的全息教学楼里。",
        statCheck: { stat: "charisma", value: 15 },
        successText: "你温柔地指引了方向，学弟/学妹对你满眼崇拜。", failText: "你指了个反方向，良心有点痛。",
        rewards: { stat: "reputation", value: 10 }
    },
    {
        id: "ev2", title: "甚至古籍", description: "在电子图书馆角落发现一本加密的《量子姻缘谱》。",
        statCheck: { stat: "wisdom", value: 20 },
        successText: "你破解了加密，学到了新的红线技巧！", failText: "你看得头晕眼花，什么都没懂。",
        rewards: { stat: "cultivation", value: 20 }
    },
    {
        id: "ev3", title: "逻辑悖论", description: "教授问：'如果月老给自己牵红线，是否违反职业道德？'",
        statCheck: { stat: "logic", value: 25 },
        successText: "你用完美的逻辑驳倒了教授。", failText: "你被绕晕了，大脑宕机。",
        rewards: { stat: "logic", value: 5 }
    },
    {
        id: "ev4", title: "校园辩论", description: "辩题：'仿生人是否应该拥有恋爱权？'",
        statCheck: { stat: "logic", value: 20 },
        successText: "你的发言博得了满堂喝彩。", failText: "你结结巴巴，被对方辩手碾压。",
        rewards: { stat: "reputation", value: 15 }
    },
    {
        id: "ev5", title: "社团招新", description: "全息汉服社邀请你做模特。",
        statCheck: { stat: "charisma", value: 30 },
        successText: "你成为了校园新星！", failText: "你穿上汉服像个粽子，被婉拒了。",
        rewards: { stat: "charisma", value: 10 }
    }
];

export const FALLBACK_MAILS: Mail[] = [
    {
        id: "m1", senderNames: "李逍遥 & 赵灵儿", subject: "感谢信", content: "多谢大仙牵线！我们现在在仙剑客栈过得很幸福。",
        isRead: false, dayReceived: 2, resolved: false,
        options: [{ id: "o1", text: "祝福你们", impact: "positive" }],
        type: 'feedback'
    },
    {
        id: "m2", senderNames: "无名氏", subject: "投诉", content: "上次介绍的对象是个机器人，还没充电！",
        isRead: false, dayReceived: 3, resolved: false,
        options: [{ id: "o2", text: "退款是不可能退款的", impact: "negative" }, { id: "o3", text: "下次给您介绍个核动力的", impact: "positive" }],
        type: 'feedback'
    },
    {
        id: "m3", senderNames: "许仙 & 白素贞", subject: "好消息", content: "我们开了一家药铺，生意兴隆。多亏了您的撮合！",
        isRead: false, dayReceived: 4, resolved: false,
        options: [{ id: "o1", text: "以后买药给我打折", impact: "positive" }],
        type: 'feedback'
    }
];

export const FALLBACK_CONSULTATIONS: Mail[] = [
    {
        id: "cm1", senderNames: "迷茫的仿生人", subject: "我有Bug吗？", content: "最近看到创造者时，CPU温度会异常升高，风扇狂转。我是不是感染了病毒？还是...这就是爱？",
        isRead: false, dayReceived: 1, resolved: false,
        options: [
            { id: "c1", text: "这是爱啊！快去表白！", impact: "positive" },
            { id: "c2", text: "可能是散热硅脂干了，建议维修", impact: "negative" }
        ],
        type: 'consultation'
    },
    {
        id: "cm2", senderNames: "全息偶像粉", subject: "跨维度的恋爱", content: "我爱上了一个只会说预设台词的NPC。只要我氪金，她就会对我笑。这种感情真实吗？",
        isRead: false, dayReceived: 1, resolved: false,
        options: [
            { id: "c3", text: "感情是真的，但钱包是痛的", impact: "neutral" },
            { id: "c4", text: "醒醒，那只是代码", impact: "negative" }
        ],
        type: 'consultation'
    },
    {
        id: "cm3", senderNames: "社畜小妖", subject: "办公室恋情", content: "我想追我的上司（一只几百年的老虎精），但他看起来好凶，总说要吃人。我该怎么办？",
        isRead: false, dayReceived: 2, resolved: false,
        options: [
            { id: "c5", text: "带点猫薄荷去试试", impact: "positive" },
            { id: "c6", text: "辞职保平安", impact: "negative" }
        ],
        type: 'consultation'
    }
];

export const FALLBACK_LOVE_INTERESTS: LoveInterest[] = [
    {
        id: "l1", name: "赛博剑仙", title: "神秘客", description: "背着光剑的冷酷剑客",
        personality: "高冷", avatarSeed: "swordmaster", affinity: 10, firstMeeting: true,
        openingLine: "...你的酒，能斩断烦恼吗？", unlocked: true
    },
    {
        id: "l2", name: "霓虹黑客", title: "情报贩子", description: "戴着护目镜的俏皮少女",
        personality: "古灵精怪", avatarSeed: "hacker", affinity: 10, firstMeeting: true,
        openingLine: "嘿老板，听说你这里能连上天庭的内网？", unlocked: true
    },
    {
        id: "l3", name: "机械狐仙", title: "当红偶像", description: "有着九条机械尾巴的绝美艺人",
        personality: "魅惑", avatarSeed: "foxidol", affinity: 10, firstMeeting: true,
        openingLine: "哎呀，这里就是传说中的月老庙？比我想象的要有趣呢。", unlocked: true
    }
];
