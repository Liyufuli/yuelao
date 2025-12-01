
import React from 'react';
import { Staff, PlayerStats } from '../types';
import { audioService } from '../services/audioService';

interface Props {
  staffList: Staff[];
  stats: PlayerStats;
  onHire: (id: string) => void;
  onInteract: (id: string) => void;
  onClose: () => void;
}

export const StaffModal: React.FC<Props> = ({ staffList, stats, onHire, onInteract, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
      <div className="w-full max-w-4xl bg-slate-900 border border-fuchsia-500 rounded-xl flex flex-col h-[80vh] shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-slate-800">
             <h2 className="text-2xl font-bold text-fuchsia-400">员工管理 / 恋爱对象</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map(staff => (
                <div key={staff.id} className={`bg-black/40 border-2 ${staff.isHired ? 'border-fuchsia-500' : 'border-gray-700'} rounded-xl overflow-hidden flex flex-col relative`}>
                    <div className="h-32 bg-gradient-to-b from-gray-800 to-black relative">
                        <img 
                           src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${staff.avatarSeed}`} 
                           alt={staff.name} 
                           className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-40 drop-shadow-lg"
                        />
                        {staff.isHired && (
                             <div className="absolute top-2 right-2 flex items-center bg-black/60 px-2 rounded-full border border-pink-500">
                                 <span className="text-xs mr-1">💓</span>
                                 <span className="text-xs font-mono text-pink-300">{staff.affinity}</span>
                             </div>
                        )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-end mb-2">
                             <h3 className="text-xl font-bold text-white">{staff.name}</h3>
                             <span className="text-xs text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded">{staff.role}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 flex-1">{staff.desc}</p>
                        
                        <div className="text-xs text-gray-500 mb-4 font-mono">
                            日薪: ${staff.salary} | 效果: {staff.effect}
                        </div>

                        {staff.isHired ? (
                            <button 
                                onClick={() => { audioService.playLove(); onInteract(staff.id); }}
                                className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <span>💬</span> 撩一下
                            </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    if (stats.money >= staff.cost) {
                                        audioService.playMoney();
                                        onHire(staff.id);
                                    } else {
                                        audioService.playFail();
                                    }
                                }}
                                className={`w-full py-2 rounded font-bold transition-colors ${
                                    stats.money >= staff.cost 
                                    ? 'bg-green-700 hover:bg-green-600 text-white' 
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                雇佣 (${staff.cost})
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
