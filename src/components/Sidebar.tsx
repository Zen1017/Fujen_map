import React, { useState } from 'react';
import { 
  Building, 
  CollegeCategory, 
  FacilityMarker, 
  FacilityType 
} from '../types';
import { FACILITY_CONFIGS } from '../data/initialMarkers';
import { MarkerToolbox } from './MarkerToolbox';
import { 
  Building as BuildingIcon, 
  MapPin, 
  Edit3, 
  Save, 
  Trash2, 
  Info, 
  Layers, 
  Sparkles, 
  Navigation, 
  Check, 
  ExternalLink,
  Tag,
  BookOpen,
  X,
  ChevronRight,
  Plus
} from 'lucide-react';

interface SidebarProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onSelectBuilding: (building: Building | null) => void;
  facilityMarkers: FacilityMarker[];
  selectedMarker: FacilityMarker | null;
  onSelectMarker: (marker: FacilityMarker | null) => void;
  isEditMode: boolean;
  onSaveBuilding: (building: Building) => void;
  onAddBuilding?: () => void;
  onDeleteBuilding?: (id: string) => void;
  onSaveMarkerNote: (id: string, note: string) => void;
  onDeleteMarker: (id: string) => void;
  onUpdateMarkerPosition?: (id: string, newX: number, newY: number) => void;
  selectedTool: FacilityType | null;
  onSelectTool: (tool: FacilityType | null) => void;
  isAddingMarker: boolean;
  onCancelAddingMarker: () => void;
  gpsDistanceText?: string | null;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  onCenterMapOn: (x: number, y: number) => void;
  isSidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

const CATEGORIES: (CollegeCategory | '全部學院')[] = [
  '全部學院',
  '醫學院',
  '管理學院',
  '社會科學院',
  '法律學院',
  '文學院',
  '教育學院',
  '傳播學院',
  '藝術學院',
  '民生學院',
  '織品學院',
  '外語學院',
  '理工學院',
  '行政與場館',
  '學生宿舍與生活',
  '餐飲與便利超商'
];

export const Sidebar: React.FC<SidebarProps> = ({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  facilityMarkers,
  selectedMarker,
  onSelectMarker,
  isEditMode,
  onSaveBuilding,
  onAddBuilding,
  onDeleteBuilding,
  onSaveMarkerNote,
  onDeleteMarker,
  onUpdateMarkerPosition,
  selectedTool,
  onSelectTool,
  isAddingMarker,
  onCancelAddingMarker,
  gpsDistanceText,
  activeCategory,
  setActiveCategory,
  onCenterMapOn,
  isSidebarOpen = true,
  onCloseSidebar
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'list' | 'facilities'>('info');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editCategory, setEditCategory] = useState<CollegeCategory>('醫學院');
  const [editDesc, setEditDesc] = useState('');
  const [editFacilities, setEditFacilities] = useState('');
  const [editX, setEditX] = useState<number>(0);
  const [editY, setEditY] = useState<number>(0);
  const [editWidth, setEditWidth] = useState<number>(8);
  const [editHeight, setEditHeight] = useState<number>(8);
  const [editRotation, setEditRotation] = useState<number>(0);
  const [editBorderRadius, setEditBorderRadius] = useState<string>('8px');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Marker note edit state
  const [editMarkerNote, setEditMarkerNote] = useState('');

  // Sync state when selected building changes
  React.useEffect(() => {
    if (selectedBuilding) {
      setEditName(selectedBuilding.name);
      setEditCode(selectedBuilding.code);
      setEditCategory(selectedBuilding.category);
      setEditDesc(selectedBuilding.description);
      setEditFacilities(selectedBuilding.facilities.join(', '));
      setEditX(selectedBuilding.x);
      setEditY(selectedBuilding.y);
      setEditWidth(selectedBuilding.width || 8);
      setEditHeight(selectedBuilding.height || 8);
      setEditRotation(selectedBuilding.rotation || 0);
      setEditBorderRadius(selectedBuilding.borderRadius || (selectedBuilding.isCircle ? '50%' : '8px'));
      setActiveTab('info');
    }
  }, [selectedBuilding]);

  // Sync state when selected marker changes
  React.useEffect(() => {
    if (selectedMarker) {
      setEditMarkerNote(selectedMarker.note);
      setActiveTab('facilities');
    }
  }, [selectedMarker]);

  const handleSaveBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) return;

    const updated: Building = {
      ...selectedBuilding,
      name: editName,
      code: editCode,
      fullName: `${editCode} ${editName}`,
      category: editCategory,
      description: editDesc,
      facilities: editFacilities.split(',').map(s => s.trim()).filter(Boolean),
      x: Number(editX),
      y: Number(editY),
      width: Number(editWidth),
      height: Number(editHeight),
      rotation: Number(editRotation),
      borderRadius: editBorderRadius
    };

    onSaveBuilding(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const filteredBuildings = buildings.filter(b => 
    activeCategory === '全部學院' || b.category === activeCategory
  );

  return (
    <aside className={`${
      isSidebarOpen ? 'flex' : 'hidden md:flex'
    } fixed inset-x-0 bottom-0 top-[60px] z-40 bg-slate-900 border-t border-slate-800 md:static md:z-10 md:w-[360px] md:min-w-[320px] md:max-w-[400px] md:h-full md:border-r md:border-t-0 shrink-0 text-slate-100 flex-col overflow-hidden shadow-2xl transition-all duration-200`}>
      
      {/* Mobile Drawer Header with Close Button */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
        <span className="font-bold text-slate-200">校園大樓與標記資訊</span>
        {onCloseSidebar && (
          <button 
            onClick={onCloseSidebar}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Top Sidebar Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'info'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>大樓詳情</span>
          {selectedBuilding && (
            <span className="w-2 h-2 rounded-full bg-sky-300" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BuildingIcon className="w-3.5 h-3.5" />
          <span>建築名錄 ({filteredBuildings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'facilities'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>標記註解 ({facilityMarkers.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

        {/* EDIT MODE INDICATOR BANNER */}
        {isEditMode && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center justify-between text-amber-200 text-xs shadow-inner">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
                <Edit3 className="w-4 h-4" />
              </span>
              <div>
                <div className="font-bold">編輯模式已開啟</div>
                <div className="text-[10px] text-amber-300/80">在地圖上可自由拖曳移動景點與標記</div>
              </div>
            </div>
            {onAddBuilding && (
              <button
                type="button"
                onClick={onAddBuilding}
                className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1 transition-all shrink-0 active:scale-95"
                title="新增一座大樓景點"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增大樓</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 1: BUILDING INFO & EDIT FORM */}
        {activeTab === 'info' && (
          <div>
            {selectedBuilding ? (
              <div className="space-y-4 animate-fade-in">
                
                {/* Header Card */}
                <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-2.5 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold">
                      代碼: {selectedBuilding.code}
                    </span>
                    <button
                      onClick={() => onSelectBuilding(null)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700"
                      title="關閉選擇"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-slate-100 leading-snug">
                    {selectedBuilding.name}
                  </h2>
                  <div className="text-xs font-medium text-blue-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {selectedBuilding.category}
                  </div>

                  {gpsDistanceText && (
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-sky-300">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                        距離您目前位置：
                      </span>
                      <span className="font-bold font-mono text-sky-200">{gpsDistanceText}</span>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => onCenterMapOn(selectedBuilding.x, selectedBuilding.y)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/30"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      在地圖上定位
                    </button>
                  </div>
                </div>

                {/* EDIT FORM (When edit mode is active) */}
                {isEditMode ? (
                  <form onSubmit={handleSaveBuildingSubmit} className="p-4 bg-slate-800/90 border border-amber-500/40 rounded-2xl space-y-3 shadow-lg">
                    <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-700/80 pb-2">
                      <Edit3 className="w-4 h-4" />
                      編輯大樓資料 (Persisted in LocalStorage)
                    </h3>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        大樓名稱
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          大樓代碼 (Code)
                        </label>
                        <input
                          type="text"
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          所屬學院/分類
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as CollegeCategory)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                        >
                          {CATEGORIES.filter(c => c !== '全部學院').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        大樓簡介與說明
                      </label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        附設設施 (以逗號分隔)
                      </label>
                      <input
                        type="text"
                        value={editFacilities}
                        onChange={(e) => setEditFacilities(e.target.value)}
                        placeholder="飲水機, AED, 洗手間, 7-11, 電梯"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          地圖 X 座標 (left %)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editX}
                          onChange={(e) => setEditX(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          地圖 Y 座標 (top %)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editY}
                          onChange={(e) => setEditY(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          寬度 (width %)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="50"
                          value={editWidth}
                          onChange={(e) => setEditWidth(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          高度 (height %)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="50"
                          value={editHeight}
                          onChange={(e) => setEditHeight(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          旋轉角度 (degrees)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="-180"
                          max="180"
                          value={editRotation}
                          onChange={(e) => setEditRotation(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          圓角風格 (Border Radius)
                        </label>
                        <input
                          type="text"
                          value={editBorderRadius}
                          onChange={(e) => setEditBorderRadius(e.target.value)}
                          placeholder="8px, 50%, 16px 4px 16px 4px"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        儲存大樓設定
                      </button>
                      {onDeleteBuilding && (
                        <button
                          type="button"
                          onClick={() => onDeleteBuilding(selectedBuilding.id)}
                          className="px-3 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow"
                          title="刪除這座大樓"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>刪除</span>
                        </button>
                      )}
                    </div>

                    {saveSuccess && (
                      <div className="p-2 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl text-center font-medium animate-bounce">
                        ✓ 已儲存更新至 LocalStorage
                      </div>
                    )}
                  </form>
                ) : (
                  /* READ-ONLY VIEW */
                  <div className="space-y-4">
                    {/* Description */}
                    <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
                      <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        建築與設施簡介
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedBuilding.description}
                      </p>
                    </div>

                    {/* Facilities Chips */}
                    {selectedBuilding.facilities.length > 0 && (
                      <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2">
                        <h3 className="text-xs font-bold text-slate-300">館內設施服務</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedBuilding.facilities.map((fac, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Departments List */}
                    {selectedBuilding.departments && selectedBuilding.departments.length > 0 && (
                      <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2">
                        <h3 className="text-xs font-bold text-slate-300">進駐系所與行政單位</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedBuilding.departments.map((dept, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-blue-950/60 text-blue-200 border border-blue-800/50 text-[11px]"
                            >
                              • {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-blue-400">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">請在地圖上選擇大樓</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
                    點擊右側地圖上的大樓標籤，或在上方搜尋欄輸入名稱進行定位亮起。
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BUILDING DIRECTORY LIST & COLLEGE FILTER */}
        {activeTab === 'list' && (
          <div className="space-y-3 animate-fade-in">
            {isEditMode && onAddBuilding && (
              <button
                type="button"
                onClick={onAddBuilding}
                className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>新增一座大樓景點</span>
              </button>
            )}

            {/* Category Filter Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                依學院/功能分類篩選
              </label>
              <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 bg-slate-950/50 rounded-xl border border-slate-800 custom-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Buildings List */}
            <div className="space-y-1.5">
              {filteredBuildings.map((building) => {
                const isSelected = selectedBuilding?.id === building.id;
                return (
                  <button
                    key={building.id}
                    onClick={() => {
                      onSelectBuilding(building);
                      onCenterMapOn(building.x, building.y);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-xs font-bold shrink-0">
                        {building.code}
                      </span>
                      <div>
                        <div className="text-xs font-semibold group-hover:text-blue-300 transition-colors">
                          {building.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {building.category}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM FACILITY MARKERS & TOOLBOX */}
        {activeTab === 'facilities' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Toolbox in Edit Mode */}
            {isEditMode && (
              <MarkerToolbox
                selectedTool={selectedTool}
                onSelectTool={onSelectTool}
                isAddingMarker={isAddingMarker}
                onCancelAdding={onCancelAddingMarker}
              />
            )}

            {/* Selected Marker Detail Card */}
            {selectedMarker && (
              <div className="p-3.5 bg-slate-800 border border-amber-500/50 rounded-2xl space-y-2.5 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedMarker.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{selectedMarker.label}</h4>
                      <span className="text-[10px] text-slate-400">建立時間: {selectedMarker.createdAt}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectMarker(null)}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2 bg-slate-900/80 rounded-xl text-xs text-slate-200">
                  <span className="text-[10px] text-slate-400 block">註解內容：</span>
                  {selectedMarker.note || '尚無註解'}
                </div>

                {isEditMode && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-700/80">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                        修改註解文字：
                      </label>
                      <input
                        type="text"
                        value={editMarkerNote}
                        onChange={(e) => setEditMarkerNote(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>

                    {/* Coordinate Editor (left% and top%) */}
                    <div className="space-y-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                        <span>調整座標位置 (或在圖上直接拖曳)</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          X: {selectedMarker.x.toFixed(1)}% | Y: {selectedMarker.y.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">X 座標 (left %)</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            value={selectedMarker.x}
                            onChange={(e) => {
                              const newX = Number(e.target.value);
                              if (onUpdateMarkerPosition) {
                                onUpdateMarkerPosition(selectedMarker.id, newX, selectedMarker.y);
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Y 座標 (top %)</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            value={selectedMarker.y}
                            onChange={(e) => {
                              const newY = Number(e.target.value);
                              if (onUpdateMarkerPosition) {
                                onUpdateMarkerPosition(selectedMarker.id, selectedMarker.x, newY);
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      {/* Directional Nudge Pad */}
                      <div className="pt-1 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateMarkerPosition && onUpdateMarkerPosition(selectedMarker.id, selectedMarker.x - 0.5, selectedMarker.y)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded text-[10px] font-bold border border-slate-700"
                          title="往左移 0.5%"
                        >
                          ← 左移
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateMarkerPosition && onUpdateMarkerPosition(selectedMarker.id, selectedMarker.x, selectedMarker.y - 0.5)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded text-[10px] font-bold border border-slate-700"
                          title="往上移 0.5%"
                        >
                          ↑ 上移
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateMarkerPosition && onUpdateMarkerPosition(selectedMarker.id, selectedMarker.x, selectedMarker.y + 0.5)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded text-[10px] font-bold border border-slate-700"
                          title="往下移 0.5%"
                        >
                          ↓ 下移
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateMarkerPosition && onUpdateMarkerPosition(selectedMarker.id, selectedMarker.x + 0.5, selectedMarker.y)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded text-[10px] font-bold border border-slate-700"
                          title="往右移 0.5%"
                        >
                          右移 →
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onSaveMarkerNote(selectedMarker.id, editMarkerNote)}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        儲存註解
                      </button>
                      <button
                        onClick={() => onDeleteMarker(selectedMarker.id)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-all"
                        title="刪除此標記"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List of Markers */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>校園地圖標記列表</span>
                <span className="text-[10px] text-slate-400 font-normal">點擊在地圖定位</span>
              </h3>

              {facilityMarkers.length > 0 ? (
                facilityMarkers.map((marker) => {
                  const isSelected = selectedMarker?.id === marker.id;
                  const cfg = FACILITY_CONFIGS[marker.type];
                  return (
                    <button
                      key={marker.id}
                      onClick={() => {
                        onSelectMarker(marker);
                        onCenterMapOn(marker.x, marker.y);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">{marker.icon}</span>
                        <div>
                          <div className="text-xs font-bold">{marker.label}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {marker.note || cfg?.label}
                          </div>
                        </div>
                      </div>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  尚無新增設施標記。可在編輯模式下新增！
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </aside>
  );
};
