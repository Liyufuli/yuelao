import React, { useState, useEffect } from 'react';
import { PlayerStats, Enemy } from '../types';
import { generateEnemy } from '../services/geminiService';
import { audioService } from '../services/audioService';

interface Props {
  stats: PlayerStats;
  updateStats: (newStats: Partial<PlayerStats>) => void;
  onVictory: () => void;
  onDefeat: () => void;
}

export const CombatView: React.FC<Props> = ({ stats, updateStats, onVictory, onDefeat }) => {
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [playerHp, setPlayerHp] = useState(100 + stats.cultivation);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isTurn, setIsTurn] = useState(true);

  useEffect(() => {
    const initFight = async () => {
      const eData = await generateEnemy(stats.day);
      setEnemy({
        name: eData.name,
        description: eData.description,
        hp: 50 + (stats.day * 10),
        maxHp: 50 + (stats.day * 10),
        attack: 5 + stats.day
      });
      setCombatLog(prev => [...prev, `遭遇敌袭！${eData.name} 出现了！`]);
    };
    initFight();
  }, [stats.day]);

  const attack = () => {
    if (!enemy || !isTurn) return;
    audioService.playBattleHit();
    const dmg = 10 + Math.floor(stats.cultivation / 5);
    const newEnemyHp = Math.max(0, enemy.hp - dmg);
    
    setEnemy({ ...enemy, hp: newEnemyHp });
    setCombatLog(prev => [...prev, `你发射了姻缘波，造成 ${dmg} 点伤害！`]);
    
    if (newEnemyHp <= 0) {
      setTimeout(() => {
        audioService.playSuccess();
        onVictory();
      }, 1000);
    } else {
      setIsTurn(false);
      setTimeout(enemyTurn, 1000);
    }
  };

  const heal = () => {
      if(!isTurn) return;
      audioService.playMoney(); // Reuse sound
      const healAmount = 20;
      setPlayerHp(prev => prev + healAmount);
      setCombatLog(prev => [...prev, `你喝了一口孟婆汤拿铁，恢复了 ${healAmount} HP`]);
      setIsTurn(false);
      setTimeout(enemyTurn, 1000);
  };

  const enemyTurn = () => {
    if (!enemy) return;
    const dmg = enemy.attack;
    setPlayerHp(prev => {
        const newHp = Math.max(0, prev - dmg);
        if(newHp <= 0) {
            setTimeout(onDefeat, 1000);
        }
        return newHp;
    });
    setCombatLog(prev => [...prev, `${enemy.name} 攻击了你，造成 ${dmg} 点精神伤害！`]);
    setIsTurn(true);
  };

  if (!enemy) return <div className="text-center p-10 text-xl animate-pulse">检测到邪恶波动...</div>;

  return (
    <div className="flex flex-col h-full p-4 bg-red-900/10 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('https://picsum.photos/1200/800?grayscale')] bg-cover mix-blend-overlay"></div>

      <div className="z-10 flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Enemy */}
        <div className="w-full max-w-md bg-black/60 border border-red-500 p-6 rounded-xl text-center relative animate-bounce-slow">
           <h2 className="text-3xl text-red-500 font-bold mb-2">{enemy.name}</h2>
           <p className="text-gray-400 mb-4 text-sm">{enemy.description}</p>
           <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden border border-gray-600">
              <div 
                className="bg-red-600 h-full transition-all duration-300"
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              ></div>
           </div>
           <p className="text-right text-xs mt-1 text-red-300">{enemy.hp}/{enemy.maxHp}</p>
        </div>

        {/* Combat Log */}
        <div className="h-32 w-full max-w-md overflow-y-auto bg-black/80 p-2 rounded border border-gray-700 text-sm font-mono text-green-400 space-y-1">
            {combatLog.map((log, i) => <div key={i}>{'>'} {log}</div>)}
        </div>

        {/* Player Controls */}
        <div className="w-full max-w-md bg-slate-900/80 border-t-2 border-cyan-500 p-6 rounded-xl">
           <div className="flex justify-between items-center mb-4">
               <span className="font-bold text-cyan-400">实习月老 (你)</span>
               <span className="text-green-400 font-mono">HP: {playerHp}</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={attack}
                disabled={!isTurn}
                className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded shadow disabled:opacity-50"
              >
                红线缠绕 (攻击)
              </button>
              <button 
                onClick={heal}
                disabled={!isTurn}
                className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded shadow disabled:opacity-50"
              >
                战术喝水 (回血)
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
