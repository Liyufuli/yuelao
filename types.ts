
export enum GamePhase {
  START_SCREEN,
  STORY_INTRO,
  DAY_MAP,        
  DAY_UNIVERSITY,
  DAY_SHOP,       
  DAY_HOME,       
  NIGHT_BAR,
  COMBAT,
  GAME_OVER
}

export type Gender = 'male' | 'female' | 'non-binary';

export interface PlayerStats {
  energy: number;     
  money: number;      
  cultivation: number; 
  reputation: number; 
  day: number;
  maxEnergy: number;
  restCount: number;
  // New RPG Stats
  logic: number;    // 逻辑
  wisdom: number;   // 悟性
  charisma: number; // 魅力
}

export interface Milestone {
    id: string;
    title: string;
    desc: string;
    condition: (stats: PlayerStats, matches: number) => boolean;
    reward: { type: keyof PlayerStats; value: number };
    claimed: boolean;
}

export type BgmMode = 'none' | 'day' | 'night' | 'combat';

export interface Customer {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  job: string;
  mbti: string;
  appearance: string;
  bio: string;
  requirement: string; 
  isRegular: boolean; 
  served: boolean; 
  mood: string; 
  avatarSeed: string;
  drinkPreference: 'strong' | 'sweet' | 'bitter' | 'sour' | 'refreshing' | 'spicy'; 
  drinkHint: string; 
}

export interface MatchResult {
  score: number;
  description: string;
  success: boolean;
  coupleId?: string; 
  partner1Name?: string;
  partner2Name?: string;
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'success' | 'failure' | 'combat' | 'romance' | 'mail' | 'npc';
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  description: string;
}

export interface Ingredient {
  id: string;
  name: string;
  type: 'base' | 'mixer' | 'garnish'; 
  desc: string;
  cost: number;
  flavor: 'strong' | 'sweet' | 'bitter' | 'sour' | 'refreshing' | 'spicy'; 
  color: string; // Hex color for visual mixing
}

export interface LoveInterest {
  id: string;
  name: string;
  title: string; 
  description: string;
  avatarSeed: string;
  personality: string;
  affinity: number; 
  firstMeeting: boolean;
  openingLine: string;
  unlocked: boolean;
}

export interface SpecialNPC {
    id: string;
    name: string;
    title: string;
    desc: string;
    avatarSeed: string;
    dialogue: string;
    reward: { type: keyof PlayerStats; value: number };
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  desc: string;
  cost: number;
  salary: number; 
  effect: string; 
  affinity: number;
  avatarSeed: string;
  isHired: boolean;
  dialogue: string[];
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  statCheck?: {
    stat: 'logic' | 'wisdom' | 'charisma' | 'cultivation';
    value: number;
  };
  successText: string;
  failText: string;
  rewards: {
    stat?: string;
    value: number;
  };
}

export interface DialogueOption {
  id: string;
  text: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  effect: string; 
}

export interface BarUpgrade {
  id: string;
  name: string;
  type: 'background' | 'furniture' | 'atmosphere';
  desc: string;
  price: number;
  reputationBonus: number;
  active: boolean; 
  cssClass?: string; 
}

export interface Mail {
  id: string;
  senderNames: string; 
  subject: string;
  content: string;
  isRead: boolean;
  dayReceived: number;
  options?: DialogueOption[]; 
  resolved?: boolean;
  type: 'feedback' | 'consultation';
}
