
import React, { useState, useEffect } from 'react';
import { PlayerStats, Customer, LogEntry, LoveInterest, BarUpgrade, MatchResult, Staff, SpecialNPC } from '../types';
import { CharacterCard } from './CharacterCard';
import { BartendingGame } from './BartendingGame';
import { RomanceModal } from './RomanceModal';
import { StaffModal } from './StaffModal';
import { generateBatchCustomers, calculateMatch } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { ENERGY_COST_MATCH, MAX_CUSTOMERS, SPECIAL_NPCS } from '../constants';

interface Props {
  stats: PlayerStats;
  updateStats: (newStats: Partial<PlayerStats>) => void;
  onEndPhase: () => void;
  addLog: (text: string, type: LogEntry['type']) => void;
  upgrades: BarUpgrade[];
  onBuyUpgrade: (id: string) => void;
  onMatchComplete: (result: MatchResult) => void;
  staff: Staff[];
  onHireStaff: (id: string) => void;
  onStaffInteract: (id: string) => void;
  loveInterests: LoveInterest[];
  onUpdateLoveInterest: (id: string, change: number) => void;
}

export const BarView: React.FC<Props> = ({ stats, updateStats, onEndPhase, addLog, upgrades, onBuyUpgrade, onMatchComplete, staff, onHireStaff, onStaffInteract, loveInterests, onUpdateLoveInterest }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customerToServe, setCustomerToServe] = useState<Customer | null>(null);
  const [romanceTarget, setRomanceTarget] = useState<LoveInterest | null>(null);
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<{title: string, desc: string} | null>(null);
  const [showDecorateModal, setShowDecorateModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [npcVisitor, setNpcVisitor] = useState<SpecialNPC | null>(null);

  // Derive visual styles from upgrades
  const activeBg = upgrades.find(u => u.type === 'background' && u.active);
  const activeFurniture = upgrades.find(u => u.type === 'furniture' && u.active);
  const activeAtmosphere = upgrades.find(u => u.type === 'atmosphere' && u.active);

  // Calculate passive bonuses from staff
  const staffCharismaBonus = staff.filter(s => s.isHired && s.effect === 'charisma_boost').length * 5;
  const staffMoneyBonus = staff.filter(s => s.isHired && s.effect === 'money_boost').length;

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      const count = Math.floor(Math.random() * 3) + 4; 
      const newCustomers = await generateBatchCustomers(count, stats.day);
      setCustomers(newCustomers);
      setLoading(false);

      // Check for Special NPC Visit (15% chance)
      if (Math.random() < 0.15) {
          const npc = SPECIAL_NPCS[Math.floor(Math.random() * SPECIAL_NPCS.length)];
          setTimeout(() => setNpcVisitor(npc), 2000);
      } 
      // Check for Love Interest Visit (Every even day or 30% chance)
      else if (stats.day % 2 === 0 || Math.random() < 0.3) {
          const availableLIs = loveInterests.filter(li => li.unlocked);
          if (availableLIs.length > 0) {
              const li = availableLIs[Math.floor(Math.random() * availableLIs.length)];
              setTimeout(() => {
                  audioService.playLove();
                  setRomanceTarget(li);
                  addLog(`${li.name} 来到了酒吧！`, "romance");
              }, 4000);
          }
      }
    };
    if (customers.length === 0) loadCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNpcClaim = () => {
      if (!npcVisitor) return;
      audioService.playSuccess();
      // @ts-ignore
      updateStats({ [npcVisitor.reward.type]: (stats[npcVisitor.reward.type] || 0) + npcVisitor.reward.value });
      addLog(`${npcVisitor.name}: "${npcVisitor.dialogue}"`, 'npc');
      addLog(`获得奖励: ${npcVisitor.reward.type} +${npcVisitor.reward.value}`, 'success');
      setNpcVisitor(null);
  };

  const handleRecruit = async () => {
      if (stats.energy < 5) {
          addLog("太累了，喊不动了。", "failure");
          return;
      }
      if (customers.length >= MAX_CUSTOMERS) {
          addLog("店里已经坐不下了！", "failure");
          return;
      }
      setLoading(true);
      updateStats({ energy: stats.energy - 5 });
      const newC = await generateBatchCustomers(1, stats.day);
      if (newC.length > 0) {
          setCustomers(prev => [...prev, newC[0]]);
          addLog("一位新客人推门而入。", "info");
      }
      setLoading(false);
      audioService.playClick();
  };

  const handleCardClick = (c: Customer) => {
      audioService.playClick();
      if (selectedIds.includes(c.id)) {
        setSelectedIds(prev => prev.filter(pid => pid !== c.id));
      } else {
        if (selectedIds.length < 2) {
          setSelectedIds(prev => [...prev, c.id]);
        }
      }
  };

  const handleBartendClick = (e: React.MouseEvent, c: Customer) => {
      e.stopPropagation();
      setCustomerToServe(c);
  };

  const handleBartendingComplete = (success: boolean, earnings: number) => {
      if (!customerToServe) return;

      let finalEarnings = earnings;
      if (staffMoneyBonus > 0 && success) {
          finalEarnings = Math.floor(earnings * 1.2);
          addLog(`员工加成生效！额外获得小费。`, 'info');
      }

      if (success) {
          addLog(`给 ${customerToServe.name} 调酒成功！收入 ${finalEarnings} 香火。`, 'success');
          updateStats({ 
              money: stats.money + finalEarnings, 
              reputation: stats.reputation + 5 
          });
      } else {
          addLog(`${customerToServe.name} 对酒不太满意...`, 'failure');
          updateStats({ money: stats.money + earnings });
      }
      
      setCustomers(prev => prev.map(c => 
          c.id === customerToServe!.id ? { ...c, served: true } : c
      ));
      setCustomerToServe(null);
  };

  const handleMatch = async () => {
    if (selectedIds.length !== 2 || stats.energy < ENERGY_COST_MATCH) return;

    setLoading(true);
    updateStats({ energy: stats.energy - ENERGY_COST_MATCH });
    
    const c1 = customers.find(c => c.id === selectedIds[0])!;
    const c2 = customers.find(c => c.id === selectedIds[1])!;

    const result = await calculateMatch(c1, c2);

    if (result.success) {
      audioService.playSuccess();
      updateStats({ 
        money: stats.money + 200, 
        cultivation: stats.cultivation + 30,
        reputation: stats.reputation + 20
      });
      addLog(`红线连接成功！获得200香火，30修为。`, 'success');
      onMatchComplete(result);
      
      setCustomers(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } else {
      audioService.playFail();
      updateStats({ energy: stats.energy - 10 });
      addLog(`牵线失败，两人话不投机。`, 'failure');
      onMatchComplete(result);
      setSelectedIds([]);
    }
    setMatchResult({ title: `契合度: ${result.score}%`, desc: result.description });
    setLoading(false);
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden transition-all duration-1000 ${activeBg?.cssClass || 'bg-slate-900'}`}>
      
      {/* Atmosphere Layer */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${activeAtmosphere?.cssClass}`}></div>

      {/* Special NPC Modal */}
      {npcVisitor && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur">
              <div className="bg-gradient-to-br from-yellow-900 to-black border-2 border-yellow-500 rounded-xl p-8 max-w-lg w-full text-center animate-bounce-slow shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                  <h2 className="text-3xl font-bold text-yellow-400 mb-2">{npcVisitor.title} 到访！</h2>
                  <img src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${npcVisitor.avatarSeed}`} className="w-32 h-32 mx-auto rounded-full bg-black/30 mb-4 border border-yellow-600"/>
                  <h3 className="text-xl text-white font-bold mb-4">{npcVisitor.name}</h3>
                  <p className="text-gray-300 italic mb-6">"{npcVisitor.desc}"</p>
                  <button onClick={handleNpcClaim} className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-full text-lg shadow-lg">
                      接待并领取奖励
                  </button>
              </div>
          </div>
      )}

      {/* Modals */}
      {customerToServe && (
          <BartendingGame 
            customer={customerToServe}
            onComplete={handleBartendingComplete}
            onCancel={() => setCustomerToServe(null)}
          />
      )}

      {romanceTarget && (
          <RomanceModal 
             character={romanceTarget}
             onClose={(change) => {
                 onUpdateLoveInterest(romanceTarget.id, change);
                 setRomanceTarget(null);
             }}
          />
      )}

      {showStaffModal && (
          <StaffModal 
              staffList={staff}
              stats={stats}
              onHire={onHireStaff}
              onInteract={onStaffInteract}
              onClose={() => setShowStaffModal(false)}
          />
      )}

      {/* Decoration Modal */}
      {showDecorateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
             <div className="bg-slate-900 border border-fuchsia-500 rounded-xl w-full max-w-3xl p-6 h-[80vh] flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-fuchsia-400">装修酒吧</h2>
                     <button onClick={() => setShowDecorateModal(false)} className="text-gray-400 hover:text-white">✕</button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                     {upgrades.map(u => (
                         <div key={u.id} className={`p-4 border rounded-lg flex flex-col justify-between ${u.active ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-black/40'}`}>
                             <div>
                                 <h3 className="font-bold text-lg text-cyan-300">{u.name}</h3>
                                 <p className="text-xs text-gray-500 uppercase">{u.type}</p>
                                 <p className="text-sm text-gray-300 mt-2">{u.desc}</p>
                                 <p className="text-xs text-green-400 mt-1">口碑加成: +{u.reputationBonus}</p>
                             </div>
                             <div className="mt-4 flex justify-end">
                                 {u.active ? (
                                     <span className="text-green-500 font-bold">已装备</span>
                                 ) : (
                                     <button 
                                        onClick={() => onBuyUpgrade(u.id)}
                                        className={`px-4 py-2 rounded text-sm font-bold ${u.price === 0 ? 'bg-gray-700' : 'bg-fuchsia-700 hover:bg-fuchsia-600'} text-white`}
                                        disabled={u.price > stats.money && u.price > 0}
                                     >
                                         {u.price === 0 ? "装备" : u.price > 0 && upgrades.some(x => x.id === u.id && x.active) ? "装备" : `购买 $${u.price}`} 
                                     </button>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/60 border-b border-fuchsia-900/50 backdrop-blur-sm z-20">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-fuchsia-400 neon-text">赛博月老庙</h2>
          <div className="text-xs text-gray-400 flex gap-2">
              <span>客流: {customers.length}/{MAX_CUSTOMERS}</span>
              {staffCharismaBonus > 0 && <span className="text-pink-400">魅力加成: +{staffCharismaBonus}</span>}
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">
             <div className="text-center bg-gray-900 px-3 py-1 rounded border border-gray-700">
                <span className="text-xs text-gray-500 block">精力</span>
                <span className={`font-mono font-bold ${stats.energy < 20 ? 'text-red-500' : 'text-cyan-400'}`}>{stats.energy}</span>
             </div>
             
             <button onClick={() => setShowStaffModal(true)} className="px-3 py-1 text-xs border border-purple-500 text-purple-400 hover:bg-purple-900/30 rounded">
                👥 员工
             </button>

             <button onClick={() => setShowDecorateModal(true)} className="px-3 py-1 text-xs border border-yellow-500 text-yellow-400 hover:bg-yellow-900/30 rounded">
                🔨 装修
             </button>

             <button 
                onClick={handleRecruit}
                disabled={loading || stats.energy < 5 || customers.length >= MAX_CUSTOMERS}
                className="px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm border border-cyan-600 text-cyan-400 hover:bg-cyan-900/30 rounded disabled:opacity-50 transition-colors"
             >
                📢 招揽 (-5)
             </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        {loading && (
           <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
             <div className="text-fuchsia-400 animate-pulse text-xl font-bold flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                正在演算因果律...
             </div>
           </div>
        )}

        {matchResult && (
           <div className="mb-6 p-6 bg-gradient-to-r from-gray-900 to-indigo-900 border border-fuchsia-500 rounded-lg animate-fadeIn relative shadow-lg z-30">
              <button onClick={() => setMatchResult(null)} className="absolute top-2 right-2 text-gray-400 hover:text-white bg-black/20 rounded-full w-8 h-8">✕</button>
              <h3 className="text-2xl font-bold text-yellow-400 mb-2">{matchResult.title}</h3>
              <p className="text-gray-200 text-lg">{matchResult.desc}</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
            {customers.map(c => (
                <div key={c.id} className={`${activeFurniture?.cssClass} rounded-xl transition-all duration-500`}>
                    <CharacterCard 
                        customer={c} 
                        isSelected={selectedIds.includes(c.id)}
                        onClick={() => handleCardClick(c)}
                        onBartendClick={(e) => handleBartendClick(e, c)}
                    />
                </div>
            ))}
            {/* Empty Seats */}
            {Array.from({ length: Math.max(0, MAX_CUSTOMERS - customers.length) }).map((_, idx) => (
                <div key={idx} className={`border-2 border-dashed border-gray-800 rounded-xl flex items-center justify-center p-6 opacity-30 ${activeFurniture?.cssClass}`}>
                    <span className="text-gray-600">空位</span>
                </div>
            ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-950/90 border-t border-fuchsia-900 flex justify-between items-center z-20 backdrop-blur-md">
          <button 
             onClick={onEndPhase}
             className="px-4 md:px-6 py-2 md:py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors font-bold text-sm md:text-base"
          >
             打烊
          </button>

          <div className="text-center text-xs text-gray-500 hidden md:block">
             点击右上角调酒赚小费，或点击两人进行牵线
          </div>

          <div className="flex gap-2">
            <button
                onClick={handleMatch}
                disabled={selectedIds.length !== 2 || stats.energy < ENERGY_COST_MATCH || loading}
                className={`
                    px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm md:text-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all flex items-center space-x-2
                    ${selectedIds.length === 2 && stats.energy >= ENERGY_COST_MATCH
                        ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:scale-105 hover:shadow-[0_0_25px_rgba(232,121,249,0.6)] cursor-pointer' 
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
                `}
            >
                <span>🔗</span>
                <span>牵红线</span>
            </button>
          </div>
      </div>
    </div>
  );
};
