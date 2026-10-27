import React, { useState } from 'react';
import { Image, Upload, Link, RotateCcw, X, Check } from 'lucide-react';

interface MapImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMapUrl: string;
  onUpdateMapUrl: (url: string) => void;
  onResetMapUrl: () => void;
}

export const MapImageModal: React.FC<MapImageModalProps> = ({
  isOpen,
  onClose,
  currentMapUrl,
  onUpdateMapUrl,
  onResetMapUrl
}) => {
  const [inputUrl, setInputUrl] = useState(currentMapUrl);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          onUpdateMapUrl(resultStr);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onUpdateMapUrl(inputUrl.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-scale-up">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-400" />
            設定地圖底圖圖源
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload File Option */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            選擇電腦/手機中的校園地圖圖片檔：
          </label>
          <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-800/50 hover:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
            <Upload className="w-8 h-8 text-blue-400 mb-1" />
            <span className="text-xs font-semibold text-slate-200">點擊上傳校園地圖 (JPG / PNG)</span>
            <span className="text-[10px] text-slate-400 mt-0.5">圖片載入後將自動調整比例並保持百分比座標鎖定</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">或輸入圖片網址</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/fju_campus_map.jpg"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
          >
            <Check className="w-4 h-4" />
            使用此圖片網址
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              onResetMapUrl();
              onClose();
            }}
            className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            恢復預設圖片
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
