
import React from 'react';
import { PlayerStats } from '../types';
import { MAX_REST_PER_DAY } from '../constants';
import { audioService } from '../services/audioService';

interface Props {
    stats: PlayerStats;
    onRest: () => void;
    onBack: () => void;
}

export const HomeView: React.FC<Props> = ({ stats, onRest, onBack }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-950 animate-fadeIn relative">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-10 pointer-events-none"></div>
             
             <div className="z-10 bg-black/60 p-8 rounded-2xl border border-gray-700 max-w-2xl w-full text-center backdrop-blur-md">
                 <h2 className="text-3xl font-bold text-green-400 mb-6">狭小的出租屋</h2>
                 <p className="text-gray-300 mb-8 leading-relaxed">
                     只有十平米的胶囊公寓，充满了泡面味和旧电脑的嗡嗡声。这里是你唯一能卸下面具的地方。
                 </p>

                 <div className="grid grid-cols-2 gap-8 mb-8">
                     <div className="bg-gray-900 p-4 rounded text-center">
                         <div className="text-sm text-gray-500">今日剩余休息次数</div>
                         <div className="text-2xl font-bold text-white">{MAX_REST_PER_DAY - stats.restCount} / {MAX_REST_PER_DAY}</div>
                     </div>
                     <div className="bg-gray-900 p-4 rounded text-center">
                         <div className="text-sm text-gray-500">当前精力</div>
                         <div className="text-2xl font-bold text-cyan-400">{stats.energy}</div>
                     </div>
                 </div>

                 <button 
                    onClick={() => {
                        if (stats.restCount < MAX_REST_PER_DAY) {
                            audioService.playSuccess();
                            onRest();
                        } else {
                            audioService.playFail();
                        }
                    }}
                    disabled={stats.restCount >= MAX_REST_PER_DAY}
                    className={`w-full py-4 text-xl rounded font-bold mb-4 transition-all ${
                        stats.restCount < MAX_REST_PER_DAY 
                        ? 'bg-green-700 hover:bg-green-600 text-white shadow-lg' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                 >
                     {stats.restCount < MAX_REST_PER_DAY ? "小睡一会 (+30 精力)" : "今天睡太多了，起来干活！"}
                 </button>

                 <button onClick={onBack} className="text-gray-400 hover:text-white underline">
                     出门
                 </button>
             </div>
        </div>
    );
};
