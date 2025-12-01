
import React, { useState, useEffect } from 'react';
import { Milestone, PlayerStats } from '../types';
import { audioService } from '../services/audioService';

interface Props {
  milestones: Milestone[];
  stats: PlayerStats;
  matchesCount: number;
  onClaim: (id: string) => void;
}

export const QuestWidget: React.FC<Props> = ({ milestones, stats, matchesCount, onClaim }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [justClaimed, setJustClaimed] = useState<Milestone | null>(null);

  // Find next uncompleted or unclaimed milestone
  const activeMilestone = milestones.find(m => !m.claimed);

  useEffect(() => {
    if (justClaimed) {
        const t = setTimeout(() => setJustClaimed(null), 3000);
        return () => clearTimeout(t);
    }
  }, [justClaimed]);

  if (!activeMilestone && !justClaimed) {
      return (
          <div className="absolute top-20 left-4 z-40 bg-black/60 p-2 rounded border border-gray-700 opacity-50 text-xs text-gray-400">
              所有考核已完成
          </div>
      );
  }

  const currentMilestone = activeMilestone || milestones[milestones.length - 1];
  const isCompleted = currentMilestone.condition(stats, matchesCount);

  return (
    <>
        {/* Full Screen Celebration */}
        {justClaimed && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur-sm absolute inset-0"></div>
                <div className="relative text-center animate-bounce-slow">
                    <h1 className="text-6xl font-bold text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
                        考核通过!
                    </h1>
                    <p className="text-2xl text-white mb-8">{justClaimed.title}</p>
                    <div className="text-xl text-green-400 font-mono border border-green-500 rounded px-4 py-2 inline-block bg-green-900/30">
                        奖励: {justClaimed.reward.type.toUpperCase()} +{justClaimed.reward.value}
                    </div>
                </div>
            </div>
        )}

        {/* Widget */}
        <div className={`absolute top-16 left-4 z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-10'}`}>
            <div className="bg-slate-900/90 border border-yellow-500/50 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)] overflow-hidden">
                {/* Header */}
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-slate-800 p-2 cursor-pointer flex justify-between items-center text-yellow-400 font-bold text-sm select-none"
                >
                    {isOpen ? <span>🏆 天庭考核 (KPI)</span> : <span>🏆</span>}
                    {isOpen && <span className="text-xs">▼</span>}
                </div>

                {isOpen && (
                    <div className="p-4">
                        <h3 className="text-white font-bold text-lg mb-1">{currentMilestone.title}</h3>
                        <p className="text-gray-400 text-xs mb-3">{currentMilestone.desc}</p>
                        
                        <div className="flex justify-between items-center mt-2">
                             <div className="text-xs text-green-400">
                                 奖励: {currentMilestone.reward.type} +{currentMilestone.reward.value}
                             </div>
                             
                             <button
                                disabled={!isCompleted}
                                onClick={() => {
                                    audioService.playSuccess();
                                    setJustClaimed(currentMilestone);
                                    onClaim(currentMilestone.id);
                                }}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                    isCompleted 
                                    ? 'bg-yellow-600 hover:bg-yellow-500 text-black animate-pulse shadow-[0_0_10px_yellow]' 
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                             >
                                 {isCompleted ? "领取奖励" : "进行中"}
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </>
  );
};
