
import React, { useState } from 'react';
import { Customer, Ingredient } from '../types';
import { INGREDIENTS } from '../constants';
import { audioService } from '../services/audioService';
import { evaluateDrink } from '../services/geminiService';

interface Props {
  customer: Customer;
  onComplete: (success: boolean, earnings: number) => void;
  onCancel: () => void;
}

const IngredientButton: React.FC<{ item: Ingredient, onClick: () => void }> = ({ item, onClick }) => (
  <button 
      onClick={onClick}
      className={`relative group p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-cyan-400 transition-all flex flex-col items-center gap-1 active:scale-95`}
  >
      <div className="text-2xl filter drop-shadow-md">
          {item.type === 'base' ? '🍾' : item.type === 'mixer' ? '🥤' : '🍒'}
      </div>
      <div className="text-[10px] font-bold text-center leading-tight">{item.name}</div>
      <div className="w-full h-1 mt-1 rounded-full" style={{ backgroundColor: item.color }}></div>
      <span className={`text-[9px] uppercase mt-1 px-1 rounded bg-black/40 ${
           item.flavor === 'sweet' ? 'text-pink-300' :
           item.flavor === 'spicy' ? 'text-red-400' :
           item.flavor === 'bitter' ? 'text-green-300' :
           item.flavor === 'strong' ? 'text-purple-400' : 'text-blue-300'
      }`}>{item.flavor}</span>
  </button>
);

export const BartendingGame: React.FC<Props> = ({ customer, onComplete, onCancel }) => {
  // Visual state for the cup
  const [layers, setLayers] = useState<Ingredient[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [gameState, setGameState] = useState<'mixing' | 'shaking' | 'result'>('mixing');
  const [result, setResult] = useState<{comment: string, satisfied: boolean} | null>(null);

  const bases = INGREDIENTS.filter(i => i.type === 'base');
  const mixers = INGREDIENTS.filter(i => i.type === 'mixer');
  const garnishes = INGREDIENTS.filter(i => i.type === 'garnish');

  const handleAddIngredient = (item: Ingredient) => {
      if (layers.length >= 5) return; // Max 5 layers
      audioService.playPour();
      setLayers([...layers, item]);
  };

  const handleClear = () => {
      setLayers([]);
      audioService.playClick();
  };

  const handleShake = async () => {
      if (layers.length === 0) return;
      
      setIsShaking(true);
      setGameState('shaking');
      audioService.playShake();

      // Simulate process
      setTimeout(async () => {
          setIsShaking(false);
          // Evaluate
          const evalResult = await evaluateDrink(customer, layers);
          setResult(evalResult);
          setGameState('result');
          if (evalResult.satisfied) audioService.playSuccess();
          else audioService.playFail();
      }, 2000);
  };

  const finish = () => {
    if (!result) return;
    const totalCost = layers.reduce((sum, item) => sum + item.cost, 0);
    const basePrice = totalCost * 3;
    const tip = result.satisfied ? Math.floor(Math.random() * 80) + 50 : 0;
    audioService.playMoney();
    onComplete(result.satisfied, basePrice + tip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fadeIn">
      <div className="w-full max-w-6xl bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl h-[95vh] md:h-auto">
        
        {/* Left: Customer Info */}
        <div className="md:w-1/4 bg-slate-950 p-6 flex flex-col items-center border-r border-slate-800">
             <img 
                src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${customer.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                alt="avatar" 
                className="w-24 h-24 rounded-full border-4 border-fuchsia-500 shadow-[0_0_20px_rgba(232,121,249,0.3)] mb-4 bg-slate-800"
             />
             <h2 className="text-xl font-bold text-white mb-1">{customer.name}</h2>
             <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 w-full text-center relative mt-4 mb-4">
                <p className="text-cyan-300 italic text-sm font-serif">
                   "{customer.drinkHint}"
                </p>
             </div>
             <div className="mt-auto text-xs text-gray-500 w-full text-center">
                 <button onClick={onCancel} className="text-gray-400 hover:text-white underline">离开</button>
             </div>
        </div>

        {/* Center: The Cup Visual */}
        <div className="md:w-1/3 bg-slate-900 p-8 flex flex-col items-center justify-center relative border-r border-slate-800">
             {gameState === 'result' ? (
                 <div className="text-center animate-fadeIn">
                    <div className="text-6xl mb-6">{result?.satisfied ? '🤩' : '🤮'}</div>
                    <div className={`text-xl font-bold mb-4 ${result?.satisfied ? 'text-green-400' : 'text-red-400'}`}>
                        {result?.satisfied ? "完美好评!" : "难以下咽..."}
                    </div>
                    <p className="text-gray-300 italic mb-8">"{result?.comment}"</p>
                    <button onClick={finish} className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-full font-bold shadow-lg animate-bounce">
                        结账
                    </button>
                 </div>
             ) : (
                 <>
                    {/* The Glass */}
                    <div className={`relative w-32 h-64 border-l-4 border-r-4 border-b-8 border-slate-400 rounded-b-2xl bg-slate-800/30 backdrop-blur-sm overflow-hidden transition-transform duration-100 ${isShaking ? 'animate-shake' : ''}`}>
                        {/* Liquid Layers */}
                        <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse w-full transition-all duration-500">
                             {layers.map((layer, idx) => (
                                 <div 
                                    key={idx} 
                                    className="w-full transition-all duration-500 animate-slideUp"
                                    style={{ 
                                        height: `${64 / 5}px`, 
                                        backgroundColor: layer.color,
                                        opacity: 0.9
                                    }}
                                 ></div>
                             ))}
                        </div>
                        {/* Reflections */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex gap-4 mt-8">
                        <button 
                            onClick={handleClear} 
                            disabled={layers.length === 0 || isShaking}
                            className="px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded border border-red-900"
                        >
                            倒掉重做
                        </button>
                        <button 
                            onClick={handleShake}
                            disabled={layers.length === 0 || isShaking}
                            className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_15px_cyan]"
                        >
                            {isShaking ? "混合中..." : "制作完成"}
                        </button>
                    </div>
                 </>
             )}
        </div>

        {/* Right: Ingredients Selection */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
            {gameState !== 'result' && (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-800 pb-1">基酒 Base</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {bases.map(i => <IngredientButton key={i.id} item={i} onClick={() => handleAddIngredient(i)} />)}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-800 pb-1">辅料 Mixer</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {mixers.map(i => <IngredientButton key={i.id} item={i} onClick={() => handleAddIngredient(i)} />)}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-800 pb-1">装饰 Garnish</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {garnishes.map(i => <IngredientButton key={i.id} item={i} onClick={() => handleAddIngredient(i)} />)}
                        </div>
                    </div>
                </div>
            )}
        </div>

      </div>
      <style>{`
        @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
            animation: shake 0.5s infinite;
        }
        @keyframes slideUp {
            from { height: 0; opacity: 0; }
            to { opacity: 0.9; }
        }
        .animate-slideUp {
            animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
