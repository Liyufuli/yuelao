
import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, RandomEvent } from '../types';
import { CLASSES, ENERGY_COST_CLASS, MAX_ENERGY } from '../constants';
import { audioService } from '../services/audioService';
import { generateRandomEvent } from '../services/geminiService';
import { EventModal } from './EventModal';

interface Props {
  stats: PlayerStats;
  onAttendClass: (statBoost: string) => void;
  onEndPhase: () => void;
  updateStats: (newStats: Partial<PlayerStats>) => void;
  addLog: (text: string, type: any) => void;
}

const CYBER_LOGS = [
    "正在建立神经连接...",
    "握手协议成功...",
    "正在绕过防火墙...",
    "数据流注入中...",
    "突触优化进度 20%...",
    "检测到逻辑回路冗余...",
    "正在重构思维模型...",
    "下载速度: 12TB/s...",
    "警告: 脑温略微升高...",
    "正在写入长期记忆...",
    "解析古老代码片段...",
    "同步云端知识库..."
];

export const UniversityView: React.FC<Props> = ({ stats, onAttendClass, onEndPhase, updateStats, addLog }) => {
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [studyingClass, setStudyingClass] = useState<typeof CLASSES[0] | null>(null);
  const [progress, setProgress] = useState(0);
  const [localLogs, setLocalLogs] = useState<string[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(false);
  
  const progressRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, []);

  // Study Logic Loop - Optimized to 50ms interval for better performance
  useEffect(() => {
      if (studyingClass && !loadingEvent && !currentEvent) {
          // Reset if just started
          if (progress === 0 && progressRef.current === 0) {
              setLocalLogs(["初始化下载进程..."]);
          }

          timerRef.current = window.setInterval(() => {
              if (progressRef.current < 100) {
                  progressRef.current += 0.8; // Faster auto increment
                  setProgress(progressRef.current);
                  
                  // Random logs with lower frequency
                  if (Math.random() > 0.95) {
                      setLocalLogs(prev => [...prev, CYBER_LOGS[Math.floor(Math.random() * CYBER_LOGS.length)]].slice(-6));
                  }
              } else {
                 finishStudy();
              }
          }, 50); // 50ms is smoother than 30ms for React updates

          return () => {
              if (timerRef.current) clearInterval(timerRef.current);
          };
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyingClass, loadingEvent, currentEvent]);

  const startClass = (cls: typeof CLASSES[0]) => {
      setStudyingClass(cls);
      setProgress(0);
      progressRef.current = 0;
      audioService.playClick();
  };

  const handleClickAccelerate = () => {
      if (!studyingClass || loadingEvent) return;
      audioService.playClick();
      progressRef.current = Math.min(100, progressRef.current + 12); // +12% per click, feel faster
      setProgress(progressRef.current);
      if (progressRef.current >= 100) finishStudy();
  };

  const finishStudy = async () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Prevent double trigger
      if (loadingEvent || !studyingClass) return;

      const cls = studyingClass;

      // 1. Check if enough energy (double check)
      if (stats.energy < ENERGY_COST_CLASS) {
           setStudyingClass(null);
           addLog("精力耗尽，被迫中断下载。", "failure");
           return;
      }

      // 2. Pay Cost immediately visually
      updateStats({ energy: stats.energy - ENERGY_COST_CLASS });
      
      // 3. Check Event Chance (Reduced to 15%)
      const roll = Math.random();
      if (roll < 0.15) {
          setLoadingEvent(true);
          setLocalLogs(prev => [...prev, "⚠️ 警告：检测到异常信号介入...", "正在解析突发事件源..."]);
          
          try {
              const event = await generateRandomEvent(cls.name);
              setLoadingEvent(false);
              if (event) {
                  setCurrentEvent(event);
                  setStudyingClass(null); // Close study modal, open event modal
                  return;
              }
          } catch (e) {
              setLoadingEvent(false);
          }
      }

      // 4. Normal Success
      audioService.playSuccess();
      onAttendClass(cls.stat);
      setStudyingClass(null);
  };

  const handleEventClose = (result: 'success' | 'fail') => {
      if (!currentEvent) return;
      if (result === 'success') {
          addLog(currentEvent.successText, 'success');
          if (currentEvent.rewards.stat) {
              const val = currentEvent.rewards.value || 5;
              const s = currentEvent.rewards.stat;
              // @ts-ignore
              updateStats({ [s]: (stats[s] || 0) + val });
              addLog(`属性提升: ${s} +${val}`, 'info');
          }
      } else {
          addLog(currentEvent.failText, 'failure');
      }
      setCurrentEvent(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-4 animate-fadeIn relative">
      {currentEvent && <EventModal event={currentEvent} stats={stats} onClose={handleEventClose} />}

      {/* Study Mini-Game Modal */}
      {studyingClass && !currentEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur">
              <div className="w-full max-w-md bg-slate-900 border border-cyan-500 rounded-xl p-8 flex flex-col items-center relative shadow-[0_0_50px_rgba(0,255,255,0.2)]">
                  <h2 className="text-2xl font-bold text-cyan-400 mb-2 animate-pulse text-center">正在下载: {studyingClass.name}</h2>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-8 bg-gray-800 rounded-full overflow-hidden border border-gray-600 mb-6 relative shadow-inner">
                      <div 
                          className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-75"
                          style={{ width: `${progress}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold text-white mix-blend-difference z-10">
                          {Math.floor(progress)}%
                      </div>
                  </div>

                  {/* Logs */}
                  <div className="w-full h-40 bg-black/50 border border-gray-700 rounded p-3 mb-6 font-mono text-xs text-green-400 overflow-hidden flex flex-col justify-end shadow-inner">
                      {localLogs.map((l, i) => <div key={i} className="animate-fadeIn">{`> ${l}`}</div>)}
                      {loadingEvent && <div className="text-yellow-400 animate-pulse">{`> 正在解析突发事件...`}</div>}
                  </div>

                  {/* Button */}
                  <button 
                      onMouseDown={handleClickAccelerate}
                      className="w-full py-4 bg-cyan-700 hover:bg-cyan-600 active:scale-95 text-white font-bold rounded shadow-lg transition-all border border-cyan-400/50"
                  >
                      ⚡ 点击加速同化 ⚡
                  </button>
                  <p className="text-xs text-gray-500 mt-2">狂点按钮以加速学习进程</p>
              </div>
          </div>
      )}

      <div className="text-center">
        <h2 className="text-4xl font-bold text-cyan-400 mb-2 cyber-font">第一大学: 教学楼</h2>
        <p className="text-gray-400">大四实习生 {stats.day}日目 - 能量: {stats.energy}/{MAX_ENERGY}</p>
        
        {/* Stats Display */}
        <div className="flex gap-4 justify-center mt-4">
            <div className="bg-blue-900/30 px-3 py-1 rounded border border-blue-500/30">
                <span className="text-xs text-blue-400 block">LOGIC</span>
                <span className="font-mono text-xl">{stats.logic}</span>
            </div>
            <div className="bg-purple-900/30 px-3 py-1 rounded border border-purple-500/30">
                <span className="text-xs text-purple-400 block">WISDOM</span>
                <span className="font-mono text-xl">{stats.wisdom}</span>
            </div>
            <div className="bg-pink-900/30 px-3 py-1 rounded border border-pink-500/30">
                <span className="text-xs text-pink-400 block">CHARISMA</span>
                <span className="font-mono text-xl">{stats.charisma}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {CLASSES.map((cls) => (
          <button
            key={cls.name}
            disabled={stats.energy < ENERGY_COST_CLASS || !!studyingClass}
            onClick={() => startClass(cls)}
            className="group relative p-6 bg-slate-900 border border-slate-700 hover:border-cyan-400 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left hover:scale-[1.02] shadow-lg"
          >
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <h3 className="text-xl font-bold text-white mb-2">{cls.name}</h3>
            <p className="text-sm text-gray-400 mb-4 h-10">{cls.desc}</p>
            <div className="flex justify-between items-center text-xs font-mono">
               <span className="text-red-400">Energy -{ENERGY_COST_CLASS}</span>
               <span className="text-green-400">{cls.stat.toUpperCase()} UP</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <button 
          onClick={() => {
              audioService.playClick();
              onEndPhase();
          }}
          className="px-8 py-3 bg-fuchsia-900 border border-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-colors shadow-[0_0_15px_rgba(217,70,239,0.3)]"
        >
          返回地图
        </button>
      </div>
    </div>
  );
};
