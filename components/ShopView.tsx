
import React from 'react';
import { PlayerStats, ShopItem } from '../types';
import { SHOP_ITEMS } from '../constants';
import { audioService } from '../services/audioService';

interface Props {
  stats: PlayerStats;
  onBuy: (item: ShopItem) => void;
  onBack: () => void;
}

export const ShopView: React.FC<Props> = ({ stats, onBuy, onBack }) => {
  return (
    <div className="flex flex-col h-full p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-yellow-400">赛博百货</h2>
            <button onClick={onBack} className="text-gray-400 hover:text-white underline">返回地图</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHOP_ITEMS.map(item => (
                <div key={item.id} className="bg-slate-900 border border-yellow-700/50 p-6 rounded-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white">{item.name}</h3>
                        <span className="bg-yellow-900 text-yellow-300 px-2 py-1 rounded text-sm font-mono">${item.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-6 h-12">{item.desc}</p>
                    <button 
                        onClick={() => {
                            if(stats.money >= item.price) {
                                audioService.playMoney();
                                onBuy(item);
                            } else {
                                audioService.playFail();
                            }
                        }}
                        disabled={stats.money < item.price}
                        className={`w-full py-2 rounded font-bold ${
                            stats.money >= item.price ? 'bg-yellow-600 hover:bg-yellow-500 text-black' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        购买
                    </button>
                </div>
            ))}
        </div>
        
        <div className="mt-auto pt-6 border-t border-gray-800 text-center text-gray-500">
            欢迎下次光临... 如果你还付得起的话。
        </div>
    </div>
  );
};
