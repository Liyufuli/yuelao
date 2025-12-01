
import React, { useState, useEffect, useRef } from 'react';
import { GamePhase, PlayerStats, LogEntry, ShopItem, BarUpgrade, Mail, MatchResult, DialogueOption, Staff, Milestone, LoveInterest } from './types';
import { INITIAL_STATS, INITIAL_BAR_UPGRADES, PREDEFINED_STAFF, MILESTONES, FIXED_LOVE_INTERESTS } from './constants';
import { UniversityView } from './components/UniversityView';
import { BarView } from './components/BarView';
import { CombatView } from './components/CombatView';
import { MapNavigation } from './components/MapNavigation';
import { ShopView } from './components/ShopView';
import { HomeView } from './components/HomeView';
import { MailModal } from './components/MailModal';
import { QuestWidget } from './components/QuestWidget';
import { audioService } from './services/audioService';
import { generateMail, generateConsultationMail } from './services/geminiService';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START_SCREEN);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // New State
  const [barUpgrades, setBarUpgrades] = useState<BarUpgrade[]>(INITIAL_BAR_UPGRADES);
  const [matches, setMatches] = useState<MatchResult[]>([]); 
  const [mails, setMails] = useState<Mail[]>([]);
  const [showMail, setShowMail] = useState(false);
  const [staff, setStaff] = useState<Staff[]>(PREDEFINED_STAFF);
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONES);
  const [loveInterests, setLoveInterests] = useState<LoveInterest[]>(FIXED_LOVE_INTERESTS);

  const addLog = (text: string, type: LogEntry['type'] = 'info') => {
    const id = crypto.randomUUID();
    setLogs(prev => [...prev, { id, text, type }].slice(-20)); 
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Audio BGM Logic
  useEffect(() => {
      switch (phase) {
          case GamePhase.DAY_MAP:
          case GamePhase.DAY_UNIVERSITY:
          case GamePhase.DAY_SHOP:
          case GamePhase.DAY_HOME:
              audioService.startBgm('day');
              break;
          case GamePhase.NIGHT_BAR:
              audioService.startBgm('night');
              break;
          case GamePhase.COMBAT:
              audioService.startBgm('combat');
              break;
          default:
              audioService.stopBgm();
              break;
      }
  }, [phase]);

  const updateStats = (newStats: Partial<PlayerStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const handleUpdateLoveInterest = (id: string, change: number) => {
      setLoveInterests(prev => prev.map(li => {
          if (li.id === id) {
              return { ...li, affinity: li.affinity + change, firstMeeting: false };
          }
          return li;
      }));
  };

  const handleClaimMilestone = (id: string) => {
      setMilestones(prev => prev.map(m => {
          if (m.id === id) {
              // Grant reward
              const val = m.reward.value;
              // @ts-ignore
              updateStats({ [m.reward.type]: (stats[m.reward.type] || 0) + val });
              addLog(`达成成就: ${m.title}! 获得 ${m.reward.type} +${val}`, 'success');
              return { ...m, claimed: true };
          }
          return m;
      }));
  };

  // Logic: Generate Mail at Start of Day
  const checkMail = async (day: number) => {
      // 1. Existing Couples Feedback
      for (const match of matches) {
          if (Math.random() > 0.7) { 
              const newMail = await generateMail(`${match.partner1Name} & ${match.partner2Name}`, day);
              if (newMail) {
                  setMails(prev => [newMail, ...prev]);
                  addLog("收到了一封新的感谢信！", "mail");
              }
          }
      }

      // 2. Daily Consultation (Guaranteed or High Chance)
      const consultation = await generateConsultationMail(day);
      if (consultation) {
          setMails(prev => [consultation, ...prev]);
          addLog("收到了一封情感咨询信件。", "mail");
      }
  };

  // Phase Transitions
  const startGame = () => {
    audioService.playClick();
    setPhase(GamePhase.STORY_INTRO);
  };

  const startDay = () => {
     setPhase(GamePhase.DAY_MAP);
     addLog(`📅 第 ${stats.day} 天。又是充满希望的一天。`);
     checkMail(stats.day);
  };

  const goToNight = () => {
    setPhase(GamePhase.NIGHT_BAR);
    addLog("🌃 夜幕降临，月老酒吧开张。", "info");
  };

  const triggerCombat = () => {
    if (Math.random() > 0.7 || stats.day % 3 === 0) {
      setPhase(GamePhase.COMBAT);
      addLog("⚠️ 警报：检测到针对姻缘树的恶意攻击！", "combat");
    } else {
      endDay();
    }
  };

  const endDay = () => {
    // Pay Staff Salaries
    const hiredStaff = staff.filter(s => s.isHired);
    const totalSalary = hiredStaff.reduce((sum, s) => sum + s.salary, 0);
    if (totalSalary > 0) {
        addLog(`支付员工工资: -${totalSalary} 香火`, 'info');
    }

    updateStats({ 
        day: stats.day + 1,
        energy: 100, // Full restore
        restCount: 0, // Reset rest limit
        money: stats.money - totalSalary
    });
    addLog("💤 一天结束了。");
    startDay(); 
  };

  const handleCombatVictory = () => {
    addLog("✅ 威胁已清除！", "success");
    updateStats({ cultivation: stats.cultivation + 50 });
    endDay();
  };

  const handleShopBuy = (item: ShopItem) => {
      updateStats({ money: stats.money - item.price });
      addLog(`购买了 ${item.name}`, 'success');
      
      if (item.effect.includes('energy')) {
          const amount = parseInt(item.effect.split('+')[1]);
          updateStats({ energy: Math.min(stats.maxEnergy || 100, stats.energy + amount) });
      } else if (item.effect.includes('cultivation')) {
          const amount = parseInt(item.effect.split('+')[1]);
          updateStats({ cultivation: stats.cultivation + amount });
      } else if (item.effect.includes('logic')) {
          const amount = parseInt(item.effect.split('+')[1]);
          updateStats({ logic: (stats.logic || 0) + amount });
      } else if (item.effect.includes('wisdom')) {
          const amount = parseInt(item.effect.split('+')[1]);
          updateStats({ wisdom: (stats.wisdom || 0) + amount });
      } else if (item.effect.includes('charisma')) {
          const amount = parseInt(item.effect.split('+')[1]);
          updateStats({ charisma: (stats.charisma || 0) + amount });
      }
  };

  const handleBuyUpgrade = (id: string) => {
      const upgrade = barUpgrades.find(u => u.id === id);
      if(!upgrade) return;

      if (upgrade.price > stats.money) {
          audioService.playFail();
          return;
      }
      
      audioService.playMoney();
      if (upgrade.price > 0) updateStats({ money: stats.money - upgrade.price });
      
      setBarUpgrades(prev => prev.map(u => {
          if (u.type === upgrade.type) {
              return { ...u, active: u.id === id }; // Activate target, deactivate others of same type
          }
          return u;
      }));
      addLog(`装饰已更换为: ${upgrade.name}`, 'success');
  };

  const handleHireStaff = (id: string) => {
      setStaff(prev => prev.map(s => {
          if (s.id === id) {
              updateStats({ money: stats.money - s.cost });
              addLog(`雇佣了 ${s.name}！`, 'success');
              return { ...s, isHired: true };
          }
          return s;
      }));
  };

  const handleStaffInteract = (id: string) => {
      setStaff(prev => prev.map(s => {
          if (s.id === id) {
              const dialogue = s.dialogue[Math.floor(Math.random() * s.dialogue.length)];
              addLog(`${s.name}: "${dialogue}"`, 'romance');
              // Small chance to boost charisma or affinity
              return { ...s, affinity: s.affinity + 5 };
          }
          return s;
      }));
      updateStats({ energy: stats.energy - 5 });
  };

  const handleMailReply = (mailId: string, option: DialogueOption) => {
      setMails(prev => prev.map(m => m.id === mailId ? { ...m, resolved: true, isRead: true } : m));
      const mail = mails.find(m => m.id === mailId);
      
      if (option.impact === 'positive') {
          if (mail?.type === 'consultation') {
              updateStats({ reputation: stats.reputation + 20, cultivation: stats.cultivation + 10 });
              addLog("你的建议很有智慧！口碑大幅提升。", "success");
          } else {
              updateStats({ reputation: stats.reputation + 10, cultivation: stats.cultivation + 20 });
              addLog("你的祝福收到了！获得好评和修为。", "success");
          }
      } else if (option.impact === 'negative') {
          updateStats({ reputation: stats.reputation - 10 });
          addLog("你的建议似乎不太妥当...", "failure");
      } else {
          addLog("回复已发送。", "info");
      }
  };

  // Render Logic
  const renderPhase = () => {
    switch (phase) {
      case GamePhase.START_SCREEN:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fadeIn px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 neon-text cyber-font">
              实习月老：<br/>赛博神庙
            </h1>
            <p className="text-xl text-gray-300 tracking-widest">CYBER MATCHMAKER</p>
            <button 
              onClick={startGame}
              className="px-12 py-4 bg-fuchsia-700 hover:bg-fuchsia-600 text-white rounded text-xl font-bold shadow-[0_0_30px_rgba(232,121,249,0.4)] transition-transform hover:scale-105"
            >
              入职报到
            </button>
          </div>
        );
      
      case GamePhase.STORY_INTRO:
        return (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-8 text-center space-y-8 animate-fadeIn">
                <h2 className="text-3xl text-cyan-400 font-bold border-b border-cyan-800 pb-4">📨 收到一封来自天庭的邮件</h2>
                <div className="text-lg leading-relaxed text-gray-300 text-left bg-gray-900/50 p-6 rounded-lg border-l-4 border-cyan-500">
                    <p className="mb-4">"恭喜你通过了地府校招。"</p>
                    <p>你的任务是经营【赛博神庙】酒吧，撮合凡人姻缘，同时抵御反恋爱算法。</p>
                </div>
                <button 
                    onClick={startDay}
                    className="mt-8 px-8 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-900/50 rounded hover:text-white transition-colors"
                >
                    接受红线 (开始游戏)
                </button>
            </div>
        );

      case GamePhase.DAY_MAP:
          return (
              <MapNavigation 
                  stats={stats}
                  onNavigate={(dest) => {
                      if (dest === 'university') setPhase(GamePhase.DAY_UNIVERSITY);
                      if (dest === 'shop') setPhase(GamePhase.DAY_SHOP);
                      if (dest === 'home') setPhase(GamePhase.DAY_HOME);
                      if (dest === 'bar') goToNight();
                  }}
                  onOpenMail={() => setShowMail(true)}
                  unreadMailCount={mails.filter(m => !m.isRead).length}
              />
          );

      case GamePhase.DAY_UNIVERSITY:
        return (
          <div className="h-full flex flex-col">
              <UniversityView 
                stats={stats}
                updateStats={updateStats}
                addLog={addLog}
                onAttendClass={(stat) => {
                     // @ts-ignore
                     updateStats({ [stat]: (stats[stat] || 0) + 1 });
                     addLog(`认真听课，${stat} +1`, 'info');
                     updateStats({ energy: stats.energy - 25 });
                }}
                onEndPhase={() => setPhase(GamePhase.DAY_MAP)} 
              />
          </div>
        );

      case GamePhase.DAY_SHOP:
          return (
             <ShopView 
                stats={stats}
                onBuy={handleShopBuy}
                onBack={() => setPhase(GamePhase.DAY_MAP)}
             />
          );

      case GamePhase.DAY_HOME:
          return (
              <HomeView 
                  stats={stats}
                  onRest={() => {
                      updateStats({ 
                          energy: Math.min(100, stats.energy + 30),
                          restCount: stats.restCount + 1
                      });
                      addLog("休息了一会儿，精力充沛！");
                  }}
                  onBack={() => setPhase(GamePhase.DAY_MAP)}
              />
          );

      case GamePhase.NIGHT_BAR:
        return (
          <BarView 
            stats={stats}
            updateStats={updateStats}
            onEndPhase={triggerCombat}
            addLog={addLog}
            upgrades={barUpgrades}
            onBuyUpgrade={handleBuyUpgrade}
            onMatchComplete={(res) => {
                if (res.success && res.coupleId) {
                    setMatches(prev => [...prev, res]);
                }
            }}
            staff={staff}
            onHireStaff={handleHireStaff}
            onStaffInteract={handleStaffInteract}
            loveInterests={loveInterests}
            onUpdateLoveInterest={handleUpdateLoveInterest}
          />
        );

      case GamePhase.COMBAT:
        return (
            <CombatView 
                stats={stats}
                updateStats={updateStats}
                onVictory={handleCombatVictory}
                onDefeat={() => setPhase(GamePhase.GAME_OVER)}
            />
        );

      case GamePhase.GAME_OVER:
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fadeIn">
                <h2 className="text-6xl text-red-600 font-bold cyber-font">GAME OVER</h2>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded text-white"
                >
                    重启时间线
                </button>
            </div>
        );
      
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="bg-gray-950 h-screen w-screen text-gray-100 flex flex-col font-sans overflow-hidden">
        {/* Quest Widget */}
        {phase !== GamePhase.START_SCREEN && phase !== GamePhase.GAME_OVER && (
            <QuestWidget 
                milestones={milestones}
                stats={stats}
                matchesCount={matches.length}
                onClaim={handleClaimMilestone}
            />
        )}

        {showMail && (
            <MailModal 
                mails={mails} 
                onClose={() => setShowMail(false)} 
                onReply={handleMailReply}
            />
        )}

        {/* Top Status Bar */}
        {phase !== GamePhase.START_SCREEN && phase !== GamePhase.GAME_OVER && (
            <header className="bg-black/80 border-b border-gray-800 p-2 flex justify-end items-center z-30 shadow-md backdrop-blur">
                <div className="flex items-center space-x-6 text-sm md:text-base pl-2 mr-4">
                    <span className="font-bold text-fuchsia-400">📅 Day {stats.day}</span>
                    <div className="flex items-center space-x-1" title="香火钱">
                        <span>💰</span>
                        <span className="text-yellow-400 font-mono">{stats.money}</span>
                    </div>
                    <div className="flex items-center space-x-1" title="神力修为">
                        <span>✨</span>
                        <span className="text-cyan-400 font-mono">{stats.cultivation}</span>
                    </div>
                    <div className="flex items-center space-x-1" title="精力">
                        <span>⚡</span>
                        <span className={`${stats.energy < 30 ? 'text-red-500 animate-pulse' : 'text-green-400'} font-mono`}>{stats.energy}</span>
                    </div>
                </div>
            </header>
        )}

        {/* Main Game Stage */}
        <main className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
             {renderPhase()}
        </main>

        {/* Log Area */}
        {phase !== GamePhase.START_SCREEN && (
            <div className="h-32 bg-black border-t border-gray-800 p-2 overflow-y-auto font-mono text-sm opacity-90 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                {logs.map((log) => (
                    <div key={log.id} className={`mb-1 transition-opacity animate-fadeIn ${
                        log.type === 'success' ? 'text-green-400' : 
                        log.type === 'failure' ? 'text-gray-500' : 
                        log.type === 'combat' ? 'text-red-500 font-bold' : 
                        log.type === 'romance' ? 'text-pink-400' :
                        log.type === 'mail' ? 'text-yellow-400 font-bold' : 
                        log.type === 'npc' ? 'text-orange-400 font-bold' : 'text-cyan-200'
                    }`}>
                        <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                        {log.text}
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>
        )}
    </div>
  );
};

export default App;
