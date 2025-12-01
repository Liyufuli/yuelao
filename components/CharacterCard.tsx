
import React from 'react';
import { Customer } from '../types';

interface Props {
  customer: Customer;
  isSelected: boolean;
  onClick: () => void;
  onBartendClick: (e: React.MouseEvent) => void;
}

export const CharacterCard: React.FC<Props> = ({ customer, isSelected, onClick, onBartendClick }) => {
  // Use DiceBear Avatars
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${customer.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const getGenderIcon = (g: string) => {
      switch(g) {
          case 'male': return <span className="text-blue-400">♂</span>;
          case 'female': return <span className="text-pink-400">♀</span>;
          default: return <span className="text-purple-400">⚧</span>;
      }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 overflow-hidden
        ${isSelected 
          ? 'bg-fuchsia-950/80 border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.4)] scale-105 z-10' 
          : 'bg-slate-900/90 border-slate-700/50 hover:border-cyan-400 hover:bg-slate-800'
        }
      `}
    >
      {/* Top Banner Status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                customer.mbti.startsWith('E') ? 'bg-orange-900/50 border-orange-500 text-orange-300' : 'bg-blue-900/50 border-blue-500 text-blue-300'
            }`}>
                {customer.mbti}
            </span>
            {customer.isRegular && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-900/50 border border-yellow-500 text-yellow-300">
                    VIP
                </span>
            )}
        </div>
        {customer.served ? (
            <span className="text-xl" title="已喝过酒">🍸</span>
        ) : (
             <button 
                onClick={onBartendClick}
                className="z-20 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-3 py-1 rounded-full shadow-lg border border-white/20 animate-pulse"
             >
                🍺 调酒
             </button>
        )}
      </div>

      <div className="flex gap-3">
          {/* Avatar */}
          <div className="shrink-0 w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden border border-slate-600 relative">
             <img src={avatarUrl} alt={customer.name} className="w-full h-full object-cover" />
             <div className="absolute bottom-0 right-0 bg-black/60 px-1 rounded-tl text-xs">
                 {getGenderIcon(customer.gender)}
             </div>
          </div>
          
          {/* Main Info */}
          <div className="flex-1 min-w-0">
             <h3 className={`font-bold text-lg truncate ${isSelected ? 'text-fuchsia-300' : 'text-cyan-300'}`}>
               {customer.name}
             </h3>
             <p className="text-xs text-gray-400 truncate">{customer.job} | {customer.age}岁</p>
             <div className="mt-1 h-px bg-gray-700 w-full" />
             <p className="text-xs text-gray-300 italic mt-1 line-clamp-2">"{customer.bio}"</p>
          </div>
      </div>

      {/* Requirement Section */}
      <div className="mt-3 bg-black/40 p-2 rounded border border-gray-800">
         <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider mb-0.5">❤️ 寻缘需求</p>
         <p className="text-xs text-gray-300 leading-snug">{customer.requirement}</p>
      </div>

      {/* Overlay for Selection */}
      {isSelected && (
        <div className="absolute top-2 right-2 pointer-events-none">
           <div className="w-6 h-6 bg-fuchsia-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-fuchsia-500/50">
             ❤️
           </div>
        </div>
      )}
    </div>
  );
};
