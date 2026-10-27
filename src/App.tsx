import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building, 
  FacilityMarker, 
  FacilityType, 
  GPSLocation, 
  MapViewport 
} from './types';
import { INITIAL_BUILDINGS } from './data/fjuBuildings';
import { INITIAL_MARKERS, FACILITY_CONFIGS } from './data/initialMarkers';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { InteractiveMap } from './components/InteractiveMap';
import { MapImageModal } from './components/MapImageModal';

// LocalStorage Keys
const LS_BUILDINGS_KEY = 'fju_map_buildings_v2';
const LS_MARKERS_KEY = 'fju_map_markers_v2';
const LS_EDIT_MODE_KEY = 'fju_map_edit_mode_v2';
const LS_MAP_URL_KEY = 'fju_map_image_url_v2';

// Default campus map image path
const DEFAULT_MAP_URL = './your_map.jpg';

export default function App() {
  // 1. Buildings state with LocalStorage persistence
  const [buildings, setBuildings] = useState<Building[]>(() => {
    try {
      const saved = localStorage.getItem(LS_BUILDINGS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BUILDINGS;
    } catch (e) {
      console.error('Failed to parse saved buildings:', e);
      return INITIAL_BUILDINGS;
    }
  });

  // 2. Custom Facility Markers state
  const [facilityMarkers, setFacilityMarkers] = useState<FacilityMarker[]>(() => {
    try {
      const saved = localStorage.getItem(LS_MARKERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MARKERS;
    } catch (e) {
      console.error('Failed to parse saved markers:', e);
      return INITIAL_MARKERS;
    }
  });

  // 3. Edit Mode State (Persisted in localStorage)
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LS_EDIT_MODE_KEY);
      return saved ? JSON.parse(saved) === 'true' : false;
    } catch (e) {
      return false;
    }
  });

  // 4. Map Image URL state
  const [mapImageUrl, setMapImageUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LS_MAP_URL_KEY);
      return saved || DEFAULT_MAP_URL;
    } catch (e) {
      return DEFAULT_MAP_URL;
    }
  });

  // Search & Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(INITIAL_BUILDINGS[0]);
  const [selectedMarker, setSelectedMarker] = useState<FacilityMarker | null>(null);
  const [activeCategory, setActiveCategory] = useState('全部學院');

  // Edit Mode Marker Toolbox selection state
  const [selectedTool, setSelectedTool] = useState<FacilityType | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);

  // Map Image Settings Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // GPS Tracking state
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [userGps, setUserGps] = useState<GPSLocation | null>(null);
  const watchIdRef = React.useRef<number | null>(null);

  // Map Viewport (Pan / Zoom)
  const [mapViewport, setMapViewport] = useState<MapViewport>({
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  // Mobile Sidebar Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Save Buildings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_BUILDINGS_KEY, JSON.stringify(buildings));
    } catch (e) {
      console.error('Failed to save buildings to localStorage', e);
    }
  }, [buildings]);

  // Save Facility Markers to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_MARKERS_KEY, JSON.stringify(facilityMarkers));
    } catch (e) {
      console.error('Failed to save markers to localStorage', e);
    }
  }, [facilityMarkers]);

  // Save Edit Mode State to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_EDIT_MODE_KEY, JSON.stringify(isEditMode));
    } catch (e) {
      console.error('Failed to save edit mode state', e);
    }
  }, [isEditMode]);

  // Save Map Image URL
  useEffect(() => {
    try {
      localStorage.setItem(LS_MAP_URL_KEY, mapImageUrl);
    } catch (e) {
      console.error('Failed to save map image url', e);
    }
  }, [mapImageUrl]);

  // Fuzzy Search filtering (Requirement 1)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return buildings.filter(b => {
      return (
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.fullName.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.facilities.some(f => f.toLowerCase().includes(q)) ||
        (b.departments && b.departments.some(d => d.toLowerCase().includes(q)))
      );
    });
  }, [searchQuery, buildings]);

  // Center Map on a specific building or marker percentage coordinate
  const handleCenterMapOn = useCallback((x: number, y: number) => {
    // Zoom in slightly and center
    setMapViewport({
      scale: 1.4,
      translateX: -(x - 50) * 8,
      translateY: -(y - 50) * 6
    });
  }, []);

  // GPS Tracking Toggle (Requirement 5)
  const toggleGps = () => {
    if (isGpsActive) {
      // Turn OFF
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsGpsActive(false);
      setUserGps(null);
    } else {
      // Turn ON
      if (!('geolocation' in navigator)) {
        alert('您的瀏覽器不支援 GPS 地理定位服務。');
        return;
      }

      setIsGpsActive(true);
      
      // Start watchPosition
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          // Convert GPS lat/lng to Fu Jen University campus bounding box relative percentage (approx bounds)
          // Fu Jen campus center approx: 25.0350° N, 121.4320° E
          const FJU_MIN_LAT = 25.0310;
          const FJU_MAX_LAT = 25.0390;
          const FJU_MIN_LNG = 121.4280;
          const FJU_MAX_LNG = 121.4370;

          let mapX = ((lng - FJU_MIN_LNG) / (FJU_MAX_LNG - FJU_MIN_LNG)) * 100;
          let mapY = (1 - (lat - FJU_MIN_LAT) / (FJU_MAX_LAT - FJU_MIN_LAT)) * 100;

          // Clamp coordinates to campus map area, or set default center if testing outside campus
          if (mapX < 5 || mapX > 95 || mapY < 5 || mapY > 95) {
            // Default simulated positioning around MD / Main gate area for demo if outside FJU
            mapX = 50.0;
            mapY = 50.0;
          }

          setUserGps({
            latitude: lat,
            longitude: lng,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            mapX,
            mapY,
            updatedAt: new Date()
          });
        },
        (err) => {
          console.warn('Geolocation watch error:', err.message);
          // Provide fallback demo position in Fu Jen campus center
          setUserGps({
            latitude: 25.0350,
            longitude: 121.4320,
            accuracy: 15,
            mapX: 45.0,
            mapY: 55.0,
            updatedAt: new Date()
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }
  };

  // Calculate GPS distance to selected building in meters
  const gpsDistanceText = useMemo(() => {
    if (!userGps || !selectedBuilding || !userGps.latitude || !userGps.longitude) return null;

    // Approximate distance calculation from map coordinates or lat/lng
    // Scale 1% on map roughly equal to 12 meters across FJU campus
    if (userGps.mapX && userGps.mapY) {
      const dx = userGps.mapX - selectedBuilding.x;
      const dy = userGps.mapY - selectedBuilding.y;
      const distPercent = Math.sqrt(dx * dx + dy * dy);
      const distMeters = Math.round(distPercent * 12);
      return distMeters < 1000 ? `${distMeters} 公尺` : `${(distMeters / 1000).toFixed(1)} 公里`;
    }
    return null;
  }, [userGps, selectedBuilding]);

  // Handler for saving edited building details (Requirement 3)
  const handleSaveBuilding = (updated: Building) => {
    setBuildings(prev => prev.map(b => b.id === updated.id ? updated : b));
    setSelectedBuilding(updated);
  };

  // Handler for adding new facility marker on map click (Requirement 4)
  const handleAddMarkerAt = (x: number, y: number, type: FacilityType) => {
    const config = FACILITY_CONFIGS[type];
    const defaultNote = prompt(`請輸入此【${config.label}】標記之詳細說明註解：`, `位於 ${selectedBuilding?.name || '校園道路'} 附近`);
    
    if (defaultNote === null) return; // User cancelled

    const newMarker: FacilityMarker = {
      id: `m-custom-${Date.now()}`,
      type,
      label: `${config.label} 標記`,
      icon: config.icon,
      note: defaultNote || `${config.label} 設施`,
      x,
      y,
      createdAt: new Date().toISOString().split('T')[0],
      buildingId: selectedBuilding?.id
    };

    setFacilityMarkers(prev => [...prev, newMarker]);
    setSelectedMarker(newMarker);
    setSelectedTool(null);
  };

  // Handler for editing marker note
  const handleSaveMarkerNote = (id: string, newNote: string) => {
    setFacilityMarkers(prev => prev.map(m => m.id === id ? { ...m, note: newNote } : m));
    if (selectedMarker?.id === id) {
      setSelectedMarker(prev => prev ? { ...prev, note: newNote } : null);
    }
  };

  // Handler for deleting facility marker
  const handleDeleteMarker = (id: string) => {
    if (confirm('確定要刪除此設施標記嗎？')) {
      setFacilityMarkers(prev => prev.filter(m => m.id !== id));
      if (selectedMarker?.id === id) {
        setSelectedMarker(null);
      }
    }
  };

  // Handler for updating building position (drag & drop or coordinate edit)
  const handleUpdateBuildingPosition = useCallback((id: string, newX: number, newY: number) => {
    setBuildings(prev => prev.map(b => b.id === id ? { ...b, x: newX, y: newY } : b));
    setSelectedBuilding(prev => (prev && prev.id === id ? { ...prev, x: newX, y: newY } : prev));
  }, []);

  // Handler for creating a new building (Requirement 1)
  const handleAddBuilding = useCallback(() => {
    const newId = `b-custom-${Date.now()}`;
    const newBuilding: Building = {
      id: newId,
      code: 'NEW',
      name: '新建大樓景點',
      fullName: 'NEW 新建大樓景點',
      category: '行政與場館',
      description: '點擊側邊欄可修改此新建大樓景點名稱、代碼、寬高與介紹。可在地圖上直接拖曳改變其位置。',
      facilities: ['飲水機', '洗手間'],
      departments: [],
      x: 50.0,
      y: 50.0,
      width: 8.0,
      height: 8.0,
      borderRadius: '8px',
      rotation: 0,
      color: '#3B82F6'
    };
    setBuildings(prev => [...prev, newBuilding]);
    setSelectedBuilding(newBuilding);
    setSelectedMarker(null);
  }, []);

  // Handler for deleting a building
  const handleDeleteBuilding = useCallback((id: string) => {
    if (confirm('確定要刪除這座大樓景點嗎？')) {
      setBuildings(prev => prev.filter(b => b.id !== id));
      setSelectedBuilding(prev => (prev?.id === id ? null : prev));
    }
  }, []);

  // Handler for updating facility marker position (drag & drop or coordinate edit)
  const handleUpdateMarkerPosition = useCallback((id: string, newX: number, newY: number) => {
    setFacilityMarkers(prev => prev.map(m => m.id === id ? { ...m, x: newX, y: newY } : m));
    setSelectedMarker(prev => (prev && prev.id === id ? { ...prev, x: newX, y: newY } : prev));
  }, []);

  // Reset Data to Default
  const handleResetData = () => {
    if (confirm('確定要將所有大樓資料與設施標記重置為預設狀態嗎？這將清除先前的編輯。')) {
      setBuildings(INITIAL_BUILDINGS);
      setFacilityMarkers(INITIAL_MARKERS);
      setMapImageUrl(DEFAULT_MAP_URL);
      localStorage.removeItem(LS_BUILDINGS_KEY);
      localStorage.removeItem(LS_MARKERS_KEY);
      localStorage.removeItem(LS_MAP_URL_KEY);
      setSelectedBuilding(INITIAL_BUILDINGS[0]);
      alert('已恢復預設校園圖資！');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
      
      {/* 1. Top Navigation Bar (Height: 60px) */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isGpsActive={isGpsActive}
        toggleGps={toggleGps}
        isEditMode={isEditMode}
        toggleEditMode={() => setIsEditMode(prev => !prev)}
        searchResults={searchResults}
        onSelectBuilding={(b) => {
          setSelectedBuilding(b);
          setSelectedMarker(null);
          handleCenterMapOn(b.x, b.y);
          setIsSidebarOpen(true);
        }}
        openMapSettings={() => setIsImageModalOpen(true)}
        onResetData={handleResetData}
        gpsDistanceText={gpsDistanceText}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* 2. Main Content Area (Navbar below: height: calc(100vh - 60px); display: flex;) */}
      <div className="flex-1 w-full h-[calc(100vh-60px)] flex flex-row overflow-hidden relative">
        
        {/* Left Information & Edit Sidebar (Width: 360px, Height: 100%, z-index: 10) */}
        <Sidebar
          buildings={buildings}
          selectedBuilding={selectedBuilding}
          onSelectBuilding={(b) => {
            setSelectedBuilding(b);
            if (b) setSelectedMarker(null);
          }}
          facilityMarkers={facilityMarkers}
          selectedMarker={selectedMarker}
          onSelectMarker={(m) => {
            setSelectedMarker(m);
            if (m) setSelectedBuilding(null);
          }}
          isEditMode={isEditMode}
          onSaveBuilding={handleSaveBuilding}
          onAddBuilding={handleAddBuilding}
          onDeleteBuilding={handleDeleteBuilding}
          onSaveMarkerNote={handleSaveMarkerNote}
          onDeleteMarker={handleDeleteMarker}
          onUpdateMarkerPosition={handleUpdateMarkerPosition}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          isAddingMarker={isAddingMarker}
          onCancelAddingMarker={() => setSelectedTool(null)}
          gpsDistanceText={gpsDistanceText}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onCenterMapOn={handleCenterMapOn}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />

        {/* Right Map Canvas Area (flex: 1, height: 100%, position: relative, overflow: hidden) */}
        <InteractiveMap
          mapImageUrl={mapImageUrl}
          buildings={buildings}
          searchResults={searchResults}
          searchQuery={searchQuery}
          selectedBuilding={selectedBuilding}
          onSelectBuilding={(b) => {
            setSelectedBuilding(b);
            setSelectedMarker(null);
            if (!isEditMode) {
              setIsSidebarOpen(true);
            }
          }}
          facilityMarkers={facilityMarkers}
          selectedMarker={selectedMarker}
          onSelectMarker={(m) => {
            setSelectedMarker(m);
            setSelectedBuilding(null);
            if (!isEditMode) {
              setIsSidebarOpen(true);
            }
          }}
          onUpdateMarkerPosition={handleUpdateMarkerPosition}
          onUpdateBuildingPosition={handleUpdateBuildingPosition}
          isEditMode={isEditMode}
          selectedTool={selectedTool}
          onAddMarkerAt={handleAddMarkerAt}
          userGps={userGps}
          isGpsActive={isGpsActive}
          onCenterMap={handleCenterMapOn}
          mapViewport={mapViewport}
          setMapViewport={setMapViewport}
        />

      </div>

      {/* Custom Map Base Image Settings Modal */}
      <MapImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        currentMapUrl={mapImageUrl}
        onUpdateMapUrl={(newUrl) => setMapImageUrl(newUrl)}
        onResetMapUrl={() => setMapImageUrl(DEFAULT_MAP_URL)}
      />

    </div>
  );
}
