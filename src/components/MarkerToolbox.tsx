import React from 'react';
import { FacilityType, FacilityTypeConfig } from '../types';
import { FACILITY_CONFIGS } from '../data/initialMarkers';
import { Plus, Check, Info } from 'lucide-react';

interface MarkerToolboxProps {
  selectedTool: FacilityType | null;
  onSelectTool: (tool: FacilityType | null) => void;
  isAddingMarker: boolean;
  onCancelAdding: () => void;
}

export const MarkerToolbox: React.FC<MarkerToolboxProps> = ({
  selectedTool,
  onSelectTool,
  isAddingMarker,
  onCancelAdding
}) => {
  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-lg space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          新增設施標記工具箱
        </h3>
        {selectedTool && (
          <button
            onClick={onCancelAdding}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline"
          >
            取消選擇
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed">
        請點選下方設施圖示，接著<span className="text-amber-300 font-semibold">點擊地圖目標位置</span>即可放置標記並輸入註解：
      </p>

      {/* Facility Icon Grid */}
      <div className="grid grid-cols-3 gap-2">
        {Object.values(FACILITY_CONFIGS).map((cfg) => {
          const isSelected = selectedTool === cfg.type;
          return (
            <button
              key={cfg.type}
              onClick={() => onSelectTool(isSelected ? null : cfg.type)}
              className={`p-2 rounded-xl text-left border transition-all flex flex-col items-center justify-center gap-1 relative ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 shadow-md'
                  : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/80 hover:border-slate-500'
              }`}
            >
              <span className="text-2xl">{cfg.icon}</span>
              <span className="text-[11px] font-medium tracking-tight text-center">
                {cfg.label}
              </span>
              {isSelected && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {selectedTool && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2 animate-fade-in">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">以選擇：{FACILITY_CONFIGS[selectedTool]?.label} {FACILITY_CONFIGS[selectedTool]?.icon}</span>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              請在右側地圖上點擊要標註的位置點。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
