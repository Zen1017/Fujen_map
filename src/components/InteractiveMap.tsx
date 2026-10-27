import React, { useState, useRef, useEffect } from 'react';
import { 
  Building, 
  FacilityMarker, 
  FacilityType, 
  GPSLocation, 
  MapViewport 
} from '../types';
import { FACILITY_CONFIGS } from '../data/initialMarkers';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Navigation, 
  Plus, 
  Layers, 
  MapPin, 
  X,
  Compass,
  Sparkles,
  Info,
  Move
} from 'lucide-react';

interface InteractiveMapProps {
  mapImageUrl: string;
  buildings: Building[];
  searchResults: Building[];
  searchQuery: string;
  selectedBuilding: Building | null;
  onSelectBuilding: (building: Building) => void;
  facilityMarkers: FacilityMarker[];
  selectedMarker: FacilityMarker | null;
  onSelectMarker: (marker: FacilityMarker | null) => void;
  onUpdateMarkerPosition?: (id: string, newX: number, newY: number) => void;
  onUpdateBuildingPosition?: (id: string, newX: number, newY: number) => void;
  isEditMode: boolean;
  selectedTool: FacilityType | null;
  onAddMarkerAt: (x: number, y: number, type: FacilityType) => void;
  userGps: GPSLocation | null;
  isGpsActive: boolean;
  onCenterMap: (x: number, y: number) => void;
  mapViewport: MapViewport;
  setMapViewport: React.Dispatch<React.SetStateAction<MapViewport>>;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mapImageUrl,
  buildings,
  searchResults,
  searchQuery,
  selectedBuilding,
  onSelectBuilding,
  facilityMarkers,
  selectedMarker,
  onSelectMarker,
  onUpdateMarkerPosition,
  onUpdateBuildingPosition,
  isEditMode,
  selectedTool,
  onAddMarkerAt,
  userGps,
  isGpsActive,
  onCenterMap,
  mapViewport,
  setMapViewport
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Pan & Drag State
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Drag & Drop State for Facility Markers & Buildings
  const [draggingMarkerId, setDraggingMarkerId] = useState<string | null>(null);
  const [draggingBuildingId, setDraggingBuildingId] = useState<string | null>(null);

  // Aspect Ratio State for Base Image (Requirement 2)
  const [imgAspectRatio, setImgAspectRatio] = useState<number | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setImgAspectRatio(img.naturalWidth / img.naturalHeight);
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setMapViewport(prev => ({ ...prev, scale: Math.min(prev.scale * 1.25, 4.0) }));
  };

  const handleZoomOut = () => {
    setMapViewport(prev => ({ ...prev, scale: Math.max(prev.scale / 1.25, 0.6) }));
  };

  const handleResetZoom = () => {
    setMapViewport({ scale: 1, translateX: 0, translateY: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setMapViewport(prev => ({
      ...prev,
      scale: Math.max(0.6, Math.min(prev.scale * zoomFactor, 4.0))
    }));
  };

  // Mouse / Touch Drag handlers for Map Canvas Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-pin-btn') || (e.target as HTMLElement).closest('.building-overlay') || draggingMarkerId || draggingBuildingId) return;
    setIsDraggingMap(true);
    setDragStart({
      x: e.clientX - mapViewport.translateX,
      y: e.clientY - mapViewport.translateY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMap || draggingMarkerId || draggingBuildingId) return;
    setMapViewport(prev => ({
      ...prev,
      translateX: e.clientX - dragStart.x,
      translateY: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDraggingMap(false);
  };

  // Drag & Drop Handler for Facility Markers
  const handleMarkerStartDrag = (e: React.MouseEvent | React.TouchEvent, marker: FacilityMarker) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setDraggingMarkerId(marker.id);
    onSelectMarker(marker);
  };

  // Drag & Drop Handler for Building Hotspots
  const handleBuildingStartDrag = (e: React.MouseEvent | React.TouchEvent, building: Building) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setDraggingBuildingId(building.id);
    onSelectBuilding(building);
  };

  // Unified Pointer Listener for Dragging Markers & Buildings
  useEffect(() => {
    if ((!draggingMarkerId && !draggingBuildingId) || !isEditMode) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;

      const percentX = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      const percentY = Math.max(0, Math.min(100, (clickY / rect.height) * 100));

      const roundedX = Math.round(percentX * 10) / 10;
      const roundedY = Math.round(percentY * 10) / 10;

      if (draggingMarkerId && onUpdateMarkerPosition) {
        onUpdateMarkerPosition(draggingMarkerId, roundedX, roundedY);
      } else if (draggingBuildingId && onUpdateBuildingPosition) {
        onUpdateBuildingPosition(draggingBuildingId, roundedX, roundedY);
      }
    };

    const handlePointerUp = () => {
      setDraggingMarkerId(null);
      setDraggingBuildingId(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [draggingMarkerId, draggingBuildingId, isEditMode, onUpdateMarkerPosition, onUpdateBuildingPosition]);

  // Handle Map Click (For placing facility markers in Edit mode or selecting)
  const handleMapClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-pin-btn') || draggingMarkerId || draggingBuildingId) return;

    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate click location relative to image percentage (0-100%)
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (clickY / rect.height) * 100));

    // If edit mode and a tool is selected, place new marker!
    if (isEditMode && selectedTool) {
      onAddMarkerAt(
        Math.round(percentX * 10) / 10, 
        Math.round(percentY * 10) / 10, 
        selectedTool
      );
    }
  };

  // Check if a building is in search matching set
  const searchMatchedIds = new Set(searchResults.map(b => b.id));
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="relative w-full h-full flex-1 bg-slate-950 overflow-hidden select-none cursor-grab active:cursor-grabbing">
      
      {/* Floating Map Controls Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 hover:bg-blue-600 hover:border-blue-500 shadow-xl flex items-center justify-center transition-all backdrop-blur"
          title="放大 (+)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 hover:bg-blue-600 hover:border-blue-500 shadow-xl flex items-center justify-center transition-all backdrop-blur"
          title="縮小 (-)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetZoom}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 hover:bg-blue-600 hover:border-blue-500 shadow-xl flex items-center justify-center transition-all backdrop-blur"
          title="重設大小"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {isGpsActive && userGps && (
          <button
            onClick={() => {
              if (userGps.mapX && userGps.mapY) {
                onCenterMap(userGps.mapX, userGps.mapY);
              }
            }}
            className="w-10 h-10 rounded-2xl bg-blue-600 border border-blue-400 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center transition-all animate-bounce"
            title="移至我的 GPS 位置"
          >
            <Navigation className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Floating Status / Legend Badge & Edit Mode Drag Hint */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
        {isEditMode && (
          <div className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-300 animate-pulse">
            <Move className="w-4 h-4" />
            <span>【編輯模式】可在地圖上按住拖曳【大樓與設施標註】自由改變位置！</span>
          </div>
        )}

        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-2.5 shadow-2xl text-xs text-slate-200 hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping inline-block" />
            <span className="font-semibold text-amber-300">搜尋高亮</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>大樓標註</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-sky-400 ring-4 ring-sky-400/30 animate-pulse" />
            <span className="text-sky-300 font-medium">GPS定位藍點</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Viewport Canvas */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapClick}
        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${mapViewport.translateX}px, ${mapViewport.translateY}px) scale(${mapViewport.scale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Aspect-Ratio Locked Container for Precision Cross-Device Alignment (Requirement 2) */}
        <div 
          className="relative inline-block shadow-2xl rounded-2xl border border-slate-800 shrink-0 overflow-hidden"
          style={{
            aspectRatio: imgAspectRatio ? `${imgAspectRatio}` : undefined
          }}
        >
          {/* Main Campus Map Base Image */}
          <img
            ref={imageRef}
            src="./your_map.jpg"
            alt="輔仁大學校園導覽地圖"
            referrerPolicy="no-referrer"
            onLoad={handleImageLoad}
            className="block max-w-full max-h-[85vh] w-auto h-auto object-contain pointer-events-none rounded-2xl"
          />

          {/* SVG VECTOR OVERLAY LAYER (Figma Exact Building Shapes) */}
          <svg
            viewBox="0 0 1281 801"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {buildings.map((b) => {
              if (!b.svgPath) return null;
              const isSelected = selectedBuilding?.id === b.id;
              const isMatchedBySearch = isSearchActive && searchMatchedIds.has(b.id);
              const isHighlighted = isSelected || isMatchedBySearch;

              return (
                <path
                  key={`svg-${b.id}`}
                  d={b.svgPath}
                  fill={isHighlighted ? '#F59E0B' : (b.svgFill || b.color || '#FDD782')}
                  fillOpacity={isHighlighted ? 0.75 : 0.45}
                  stroke={isHighlighted ? '#FBB55F' : '#000000'}
                  strokeWidth={isHighlighted ? 3.5 : 1.5}
                  filter={isHighlighted ? 'url(#glow)' : undefined}
                  className={`pointer-events-auto transition-all duration-200 ${
                    isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                  } hover:fill-amber-400/80 hover:stroke-amber-300`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBuilding(b);
                  }}
                  onMouseDown={(e) => handleBuildingStartDrag(e, b)}
                  onTouchStart={(e) => handleBuildingStartDrag(e, b)}
                >
                  <title>{`${b.code} ${b.name}`}</title>
                </path>
              );
            })}
          </svg>

          {/* OVERLAY LAYER: ABSOLUTE POSITIONED BUILDING HOTSPOTS & HIGHLIGHTS */}
          {buildings.map((b) => {
            const isSelected = selectedBuilding?.id === b.id;
            const isMatchedBySearch = isSearchActive && searchMatchedIds.has(b.id);
            const isHighlighted = isSelected || isMatchedBySearch;
            const isCircleShape = b.isCircle || b.shape === 'circle' || b.code === '中美堂' || b.id === 'b-zhongmei';

            const boxWidth = b.width || 8;
            const boxHeight = b.height || 8;
            const borderRadius = b.borderRadius || (isCircleShape ? '50%' : '8px');
            const rotation = b.rotation || 0;
            const isBeingDragged = draggingBuildingId === b.id;

            return (
              <div
                key={b.id}
                onMouseDown={(e) => handleBuildingStartDrag(e, b)}
                onTouchStart={(e) => handleBuildingStartDrag(e, b)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBuilding(b);
                }}
                className={`building-overlay pointer-events-auto ${
                  b.svgPath 
                    ? (isEditMode ? 'border border-dashed border-amber-400/60 bg-amber-400/10' : 'bg-transparent border-none shadow-none') 
                    : `${isHighlighted ? 'building-highlight' : ''} ${isCircleShape ? 'building-circle' : ''}`
                } ${
                  isEditMode ? 'cursor-grab active:cursor-grabbing border-2 border-amber-400/80 shadow-amber-500/30' : ''
                }`}
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${boxWidth}%`,
                  height: `${boxHeight}%`,
                  borderRadius: borderRadius,
                  transform: rotation ? `rotate(${rotation}deg)` : undefined,
                  clipPath: b.clipPath || undefined
                }}
                title={`${b.code} ${b.name}${isEditMode ? ' (按住拖曳可移動位置)' : ''}`}
              >
                {/* Real-Time Coordinate Badge while Dragging or Selected in Edit Mode */}
                {(isBeingDragged || (isSelected && isEditMode)) && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-400/80 shadow-2xl whitespace-nowrap z-50 pointer-events-none">
                    X: {b.x.toFixed(1)}% | Y: {b.y.toFixed(1)}%
                  </div>
                )}

                {/* Building Code Pin Label */}
                <div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-auto z-30"
                  style={{ transform: rotation ? `rotate(${-rotation}deg)` : undefined }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBuilding(b);
                    }}
                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all shadow-lg flex items-center gap-1 border whitespace-nowrap ${
                      isHighlighted
                        ? 'bg-amber-400 border-amber-200 text-slate-950 font-black scale-110 ring-2 ring-amber-300 z-30'
                        : 'bg-slate-900/90 border-slate-700 text-slate-100 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-blue-500/30 text-blue-200">
                      {b.code}
                    </span>
                    <span className="hidden sm:inline">{b.name}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* OVERLAY LAYER: CUSTOM FACILITY MARKERS (Support Drag & Drop in Edit Mode) */}
          {facilityMarkers.map((marker) => {
            const isSelected = selectedMarker?.id === marker.id;
            const isBeingDragged = draggingMarkerId === marker.id;

            return (
              <div
                key={marker.id}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 map-pin-btn pointer-events-auto ${
                  isEditMode ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                onMouseDown={(e) => handleMarkerStartDrag(e, marker)}
                onTouchStart={(e) => handleMarkerStartDrag(e, marker)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMarker(marker);
                  }}
                  className={`p-1.5 rounded-full shadow-xl transition-all border flex items-center justify-center text-sm ${
                    isBeingDragged
                      ? 'bg-amber-400 border-amber-100 text-slate-950 ring-4 ring-amber-300 scale-150 z-40 shadow-amber-500/50'
                      : isSelected
                      ? 'bg-amber-400 border-amber-200 text-slate-950 ring-4 ring-amber-400/50 scale-125 z-30'
                      : isEditMode
                      ? 'bg-amber-500/90 border-amber-200 text-slate-950 hover:scale-125 ring-2 ring-amber-400/50'
                      : 'bg-slate-900/90 border-slate-700 text-slate-100 hover:scale-125 hover:bg-slate-800'
                  }`}
                  title={`${marker.label}: ${marker.note}${isEditMode ? ' (按住拖曳可移動位置)' : ''}`}
                >
                  <span>{marker.icon}</span>
                </button>

                {/* Real-Time Coordinate Tooltip Badge while Dragging or Selected in Edit Mode */}
                {(isBeingDragged || (isSelected && isEditMode)) && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-400/60 shadow-2xl whitespace-nowrap z-50 pointer-events-none">
                    X: {marker.x.toFixed(1)}% | Y: {marker.y.toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}

          {/* OVERLAY LAYER: REAL-TIME GPS BLUE DOT */}
          {isGpsActive && userGps && userGps.mapX && userGps.mapY && (
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${userGps.mapX}%`, top: `${userGps.mapY}%` }}
            >
              {/* GPS Accuracy Circle */}
              <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-400/40 animate-ping -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2" />
              
              {/* Blue Dot */}
              <div className="relative w-5 h-5 bg-sky-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-700 rounded-full" />
              </div>

              {/* User Tag */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-sky-300 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-sky-500/40 whitespace-nowrap shadow-md">
                您的位置 (±{Math.round(userGps.accuracy)}m)
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
