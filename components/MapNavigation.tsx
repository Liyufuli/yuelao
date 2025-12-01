
import React from 'react';
import { PlayerStats } from '../types';
import { audioService } from '../services/audioService';

interface Props {
  stats: PlayerStats;
  onNavigate: (destination: 'university' | 'shop' | 'home' | 'bar') => void;
  onOpenMail: () => void;
  unreadMailCount: number;
}

export const MapNavigation: React.FC<Props> = ({ stats, onNavigate, onOpenMail, unreadMailCount }) => {
  const locations = [
    { id: 'university', name: '第一大学', icon: '🏫', color: 'text-cyan-400', border: 'border-cyan-500', desc: '上课提升属性，消耗精力' },
    { id: 'shop', name: '赛博商业街', icon: '🛍️', color: 'text-yellow-400', border: 'border-yellow-500', desc: '购买道具，挥霍香火钱' },
    { id: 'home', name: '出租屋', icon: '🏠', color: 'text-green-400', border: 'border-green-500', desc: '休息恢复精力' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fadeIn space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 cyber-font">
            DAY {stats.day}: 自由行动
        </h2>
        <p className="text-gray-400 mt-2">选择你的去向</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {locations.map(loc => (
              <button
                key={loc.id}
                onClick={() => { audioService.playClick(); onNavigate(loc.id as any); }}
                className={`group relative p-8 bg-slate-900/80 border-2 ${loc.border} rounded-2xl transition-all hover:scale-105 hover:bg-slate-800`}
              >
                  <div className="text-6xl mb-4 group-hover:animate-bounce">{loc.icon}</div>
                  <h3 className={`text-2xl font-bold ${loc.color} mb-2`}>{loc.name}</h3>
                  <p className="text-gray-400 text-sm">{loc.desc}</p>
              </button>
          ))}
      </div>

      <div className="flex gap-4 w-full max-w-5xl">
         <button 
             onClick={onOpenMail}
             className="flex-1 p-4 bg-slate-800 border border-slate-600 rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 relative"
         >
             <span className="text-2xl">📧</span>
             <span className="font-bold text-gray-200">查看信箱</span>
             {unreadMailCount > 0 && (
                 <span className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
                     {unreadMailCount}
                 </span>
             )}
         </button>

         <button 
             onClick={() => { audioService.playClick(); onNavigate('bar'); }}
             className="flex-[2] p-4 bg-fuchsia-900/80 border border-fuchsia-500 rounded-xl hover:bg-fuchsia-800 transition-colors flex items-center justify-center gap-2"
         >
             <span className="text-2xl">🍸</span>
             <span className="font-bold text-white">前往酒吧 (进入夜晚)</span>
         </button>
      </div>
    </div>
  );
};
