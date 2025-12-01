
import React, { useState } from 'react';
import { Mail, DialogueOption } from '../types';
import { audioService } from '../services/audioService';

interface Props {
  mails: Mail[];
  onClose: () => void;
  onReply: (mailId: string, option: DialogueOption) => void;
}

export const MailModal: React.FC<Props> = ({ mails, onClose, onReply }) => {
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [animating, setAnimating] = useState<'love' | 'break' | null>(null);

  const selectedMail = mails.find(m => m.id === selectedMailId);

  const handleReplyClick = (mailId: string, opt: DialogueOption) => {
      // Trigger visuals
      const type = opt.impact === 'positive' ? 'love' : 'break';
      if (type === 'love') audioService.playLove();
      else audioService.playHeartbreak();

      setAnimating(type);
      setTimeout(() => {
          setAnimating(null);
          onReply(mailId, opt);
      }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur">
        
        {/* Fullscreen Animation Overlay */}
        {animating === 'love' && (
            <div className="absolute inset-0 pointer-events-none z-[70] flex items-center justify-center overflow-hidden">
                <div className="text-9xl animate-ping text-pink-500">❤️</div>
                <div className="absolute inset-0 bg-pink-500/20 animate-pulse"></div>
            </div>
        )}
        {animating === 'break' && (
             <div className="absolute inset-0 pointer-events-none z-[70] flex items-center justify-center overflow-hidden">
                <div className="text-9xl animate-ping text-gray-500">💔</div>
                <div className="absolute inset-0 bg-gray-500/20 animate-pulse"></div>
            </div>
        )}

        <div className="w-full max-w-4xl h-[80vh] bg-slate-900 border border-cyan-500 rounded-xl flex overflow-hidden shadow-2xl">
            {/* Sidebar List */}
            <div className="w-1/3 bg-black/40 border-r border-gray-700 overflow-y-auto">
                <div className="p-4 border-b border-gray-700 bg-slate-800">
                    <h3 className="font-bold text-cyan-400">收件箱</h3>
                </div>
                {mails.length === 0 && <div className="p-4 text-gray-500 text-center">暂无信件</div>}
                {mails.map(mail => (
                    <div 
                        key={mail.id}
                        onClick={() => { audioService.playClick(); setSelectedMailId(mail.id); }}
                        className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-slate-800 transition-colors ${selectedMailId === mail.id ? 'bg-slate-800 border-l-4 border-l-cyan-500' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-1">
                             <div className={`text-sm font-bold truncate ${mail.isRead ? 'text-gray-400' : 'text-white'}`}>
                                {!mail.isRead && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>}
                                {mail.senderNames}
                            </div>
                            {mail.type === 'consultation' && <span className="text-[10px] bg-purple-900 text-purple-300 px-1 rounded">求助</span>}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{mail.subject}</div>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col bg-slate-900 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                
                {selectedMail ? (
                    <div className="p-8 flex-1 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-2">
                             {selectedMail.type === 'consultation' ? (
                                 <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-bold">情感咨询</span>
                             ) : (
                                 <span className="bg-cyan-600 text-white text-xs px-2 py-1 rounded font-bold">用户反馈</span>
                             )}
                             <h2 className="text-2xl font-bold text-white">{selectedMail.subject}</h2>
                        </div>
                        
                        <div className="text-sm text-cyan-500 mb-6">From: {selectedMail.senderNames}</div>
                        
                        <div className="bg-white/5 p-6 rounded-lg border border-white/10 text-gray-300 leading-relaxed font-serif text-lg mb-8">
                            {selectedMail.content}
                        </div>

                        {selectedMail.options && !selectedMail.resolved && (
                            <div className="space-y-4">
                                <p className="text-sm text-yellow-500 font-bold uppercase">回复建议:</p>
                                {selectedMail.options.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleReplyClick(selectedMail.id, opt)}
                                        disabled={!!animating}
                                        className="w-full text-left p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors group"
                                    >
                                        <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{opt.text}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {selectedMail.type === 'consultation' 
                                              ? (opt.impact === 'positive' ? '✨ 大幅提升口碑' : opt.impact === 'negative' ? '📉 损害名誉' : '😐 无影响')
                                              : (opt.impact === 'positive' ? '💕 增加爱情值' : opt.impact === 'negative' ? '💔 可能导致分手' : '😐 无影响')
                                            }
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {selectedMail.resolved && (
                            <div className="p-4 bg-green-900/30 border border-green-600 text-green-400 rounded text-center">
                                已回复
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-600">
                        选择一封邮件阅读
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
