
import React from 'react';
import { RandomEvent, PlayerStats } from '../types';
import { audioService } from '../services/audioService';

interface Props {
  event: RandomEvent;
  stats: PlayerStats;
  onClose: (result: 'success' | 'fail') => void;
}

export const EventModal: React.FC<Props> = ({ event, stats, onClose }) => {
  const checkStat = event.statCheck?.stat || 'logic';
  const checkValue = event.statCheck?.value || 10;
  const playerValue = stats[checkStat] || 0;
  const success = playerValue >= checkValue;

  const handleConfirm = () => {
      if (success) audioService.playSuccess();
      else audioService.playFail();
      onClose(success ? 'success' : 'fail');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-500 rounded-xl p-8 relative shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-fadeIn">
        
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <span>⚡</span> 突发事件：{event.title}
        </h2>
        
        <p className="text-gray-300 mb-6 text-lg leading-relaxed">
            {event.description}
        </p>

        <div className="bg-black/50 p-4 rounded mb-6 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 uppercase text-xs tracking-wider">Stat Check</span>
                <span className={`font-bold uppercase ${success ? 'text-green-500' : 'text-red-500'}`}>
                    {success ? 'Pass' : 'Fail'}
                </span>
            </div>
            <div className="flex justify-between text-xl font-mono">
                <span className="text-cyan-400">{checkStat.toUpperCase()}</span>
                <span>
                    <span className={success ? 'text-green-400' : 'text-red-400'}>{playerValue}</span>
                    <span className="text-gray-600"> / </span>
                    <span className="text-gray-400">{checkValue}</span>
                </span>
            </div>
        </div>

        <button 
            onClick={handleConfirm}
            className={`w-full py-4 rounded font-bold text-xl transition-transform hover:scale-105 ${
                success ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-red-900/50 text-red-300 border border-red-700 hover:bg-red-800'
            }`}
        >
            {success ? '轻松解决' : '搞砸了...'}
        </button>
      </div>
    </div>
  );
};
