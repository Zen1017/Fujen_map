import React from 'react';
import { 
  Search, 
  Navigation, 
  Lock, 
  Unlock, 
  MapPin, 
  Image as ImageIcon, 
  RotateCcw, 
  X,
  PanelLeft,
  Menu
} from 'lucide-react';
import { Building } from '../types';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isGpsActive: boolean;
  toggleGps: () => void;
  isEditMode: boolean;
  toggleEditMode: () => void;
  searchResults: Building[];
  onSelectBuilding: (building: Building) => void;
  openMapSettings: () => void;
  onResetData: () => void;
  gpsDistanceText?: string | null;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  isGpsActive,
  toggleGps,
  isEditMode,
  toggleEditMode,
  searchResults,
  onSelectBuilding,
  openMapSettings,
  onResetData,
  gpsDistanceText,
  isSidebarOpen,
  toggleSidebar
}) => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  return (
    <header className="h-[60px] w-full bg-slate-900 border-b border-slate-800 text-white shadow-md flex items-center justify-between px-3 md:px-5 shrink-0 z-30 relative">
      
      {/* Left: Brand & Mobile Sidebar Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl transition-colors md:hidden border ${
            isSidebarOpen 
              ? 'bg-blue-600 border-blue-400 text-white' 
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="切換資訊側欄"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[9px] flex items-center justify-center text-sky-400 font-black text-xs">
              輔大
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-100 leading-tight tracking-wide flex items-center gap-1.5">
              輔大互動校園地圖
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                FJU Map
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center: Search Bar with Instant Match Dropdown */}
      <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="搜尋大樓名稱、代碼 (如 MD, LM, 國璽)..."
            className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-8 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Instant Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() !== '' && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-700/50">
            <div className="px-3 py-1.5 bg-slate-900/90 text-[11px] font-medium text-slate-400 flex justify-between items-center">
              <span>搜尋比對結果 ({searchResults.length})</span>
              <span className="text-sky-400">地圖即時亮起</span>
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((building) => (
                <button
                  key={building.id}
                  onClick={() => {
                    onSelectBuilding(building);
                    setIsSearchOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700/80 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold border border-blue-500/30">
                      {building.code}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                        {building.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {building.category}
                      </div>
                    </div>
                  </div>
                  <MapPin className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                未找到符合關鍵字的大樓
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Quick Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* GPS Tracking Button */}
        <button
          onClick={toggleGps}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 border ${
            isGpsActive
              ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/30'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="GPS位置追蹤"
        >
          <Navigation className={`w-3.5 h-3.5 ${isGpsActive ? 'animate-spin text-sky-200' : ''}`} />
          <span className="hidden sm:inline">{isGpsActive ? '定位中' : '定位'}</span>
        </button>

        {/* Edit Mode Toggle */}
        <button
          onClick={toggleEditMode}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 border ${
            isEditMode
              ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="切換編輯模式"
        >
          {isEditMode ? (
            <>
              <Unlock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">編輯 (開)</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">編輯</span>
            </>
          )}
        </button>

        {/* Map Base Settings */}
        <button
          onClick={openMapSettings}
          className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          title="地圖圖源"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Reset Data */}
        <button
          onClick={onResetData}
          className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-colors"
          title="重置圖資"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
};

