import React, { useState, useEffect } from 'react';
import { LoveInterest, DialogueOption } from '../types';
import { generateDialogue } from '../services/geminiService';
import { audioService } from '../services/audioService';

interface Props {
  character: LoveInterest;
  onClose: (affinityChange: number) => void;
}

export const RomanceModal: React.FC<Props> = ({ character, onClose }) => {
  const [history, setHistory] = useState<{sender: 'char' | 'player', text: string}[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [options, setOptions] = useState<DialogueOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [affinity, setAffinity] = useState(character.affinity);

  useEffect(() => {
    // Initial greeting
    if (history.length === 0) {
        setHistory([{ sender: 'char', text: character.firstMeeting ? `(一位${character.description}的${character.title}走了进来)\n${character.openingLine}` : character.openingLine }]);
        loadNextStep(character.openingLine);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextStep = async (lastContext: string) => {
    setLoading(true);
    const result = await generateDialogue(character, lastContext);
    setOptions(result.options);
    if(history.length > 1) { // Don't replace the very first opening line logic immediately or handle it better
       // Actually for simplicity, we just use the options generated based on context.
       // The 'text' from Gemini is the character's response to what Player JUST selected. 
    }
    setLoading(false);
  };

  const handleOptionClick = async (opt: DialogueOption) => {
    audioService.playClick();
    
    // 1. Add player choice to history
    setHistory(prev => [...prev, { sender: 'player', text: opt.text }]);
    setOptions([]); // clear options
    setLoading(true);

    // 2. Update affinity
    let change = 0;
    if (opt.impact === 'positive') change = 10;
    if (opt.impact === 'negative') change = -5;
    const newAffinity = affinity + change;
    setAffinity(newAffinity);

    if (opt.impact === 'positive') audioService.playSuccess();

    // 3. Get AI response
    const result = await generateDialogue({ ...character, affinity: newAffinity }, opt.text);
    
    setHistory(prev => [...prev, { sender: 'char', text: result.text }]);
    setOptions(result.options);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95">
       {/* Background Image / Atmosphere */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
       
       <div className="w-full max-w-5xl h-full md:h-[90vh] flex flex-col relative">
            {/* Header: Name and Affinity */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
                <div className="bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-fuchsia-500/50">
                    <h2 className="text-2xl font-bold text-fuchsia-300 shadow-black drop-shadow-md">{character.name}</h2>
                    <p className="text-xs text-fuchsia-500">{character.title}</p>
                </div>
                <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-pink-500/50 flex items-center gap-2">
                    <span>💓</span>
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${Math.min(100, affinity)}%` }}></div>
                    </div>
                    <span className="text-pink-400 font-mono">{affinity}</span>
                </div>
            </div>

            <button 
                onClick={() => onClose(affinity - character.affinity)}
                className="absolute top-4 right-4 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm text-gray-300"
            >
                结束邂逅
            </button>

            {/* Character Sprite Area */}
            <div className="flex-1 flex items-end justify-center pb-32 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0"></div>
                 <img 
                    src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${character.avatarSeed}&backgroundColor=transparent`} 
                    alt="Character"
                    className="h-[80%] md:h-[95%] object-contain drop-shadow-[0_0_30px_rgba(232,121,249,0.3)] animate-fadeIn z-0 transform transition-transform hover:scale-105 duration-1000"
                 />
            </div>

            {/* Dialogue Box */}
            <div className="h-1/3 bg-gradient-to-t from-black via-black/90 to-transparent p-4 md:p-8 flex flex-col justify-end z-10">
                <div className="max-w-4xl mx-auto w-full">
                    {/* Chat History / Current Text */}
                    <div className="bg-black/80 border border-fuchsia-900/50 rounded-xl p-6 mb-4 min-h-[120px] shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
                        {loading && <div className="text-fuchsia-400 animate-pulse text-sm">对方正在输入...</div>}
                        {!loading && history.length > 0 && (
                            <p className="text-lg md:text-xl text-gray-100 leading-relaxed font-serif">
                                {history[history.length - 1].sender === 'char' && (
                                    <span className="text-fuchsia-400 font-bold mr-2">{character.name}:</span>
                                )}
                                {history[history.length - 1].text}
                            </p>
                        )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleOptionClick(opt)}
                                disabled={loading}
                                className="bg-slate-900/90 hover:bg-fuchsia-900/50 border border-slate-700 hover:border-fuchsia-400 text-gray-200 py-4 px-6 rounded-lg text-left transition-all hover:scale-[1.02] shadow-lg text-sm md:text-base"
                            >
                                {opt.text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};