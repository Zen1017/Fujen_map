export type CollegeCategory = 
  | '醫學院' 
  | '管理學院' 
  | '社會科學院' 
  | '法律學院' 
  | '文學院' 
  | '教育學院' 
  | '傳播學院' 
  | '藝術學院' 
  | '民生學院' 
  | '織品學院' 
  | '外語學院' 
  | '理工學院' 
  | '行政與場館' 
  | '學生宿舍與生活' 
  | '餐飲與便利超商';

export interface Building {
  id: string;
  code: string; // e.g. "MD", "LM", "BS", "DG", "SF", "JS"
  name: string; // e.g. "國璽樓", "利瑪竇大樓"
  fullName: string; // e.g. "MD 國璽樓 (醫學院)"
  category: CollegeCategory;
  description: string;
  facilities: string[]; // e.g. ["飲水機", "AED", "洗手間", "7-11", "ATM", "電梯"]
  departments?: string[]; // Departments inside this building
  x: number; // percentage left% (0 - 100)
  y: number; // percentage top% (0 - 100)
  width?: number; // percentage width% (0 - 100)
  height?: number; // percentage height% (0 - 100)
  isCircle?: boolean; // true for 中美堂 circular dome
  shape?: 'rect' | 'circle' | 'rounded' | 'pill' | 'polygon';
  borderRadius?: string; // e.g. "16px", "50%", "24px 6px 24px 6px"
  rotation?: number; // angle in degrees, e.g. -20, 15
  clipPath?: string; // CSS clip-path for L-shape or custom polygons
  svgPath?: string; // Vector SVG path from Figma
  svgFill?: string; // Vector fill color from Figma
  color?: string; // Marker badge theme color
}

export type FacilityType = 'water' | 'tissue' | 'aed' | 'trash' | 'study' | 'restroom';

export interface FacilityTypeConfig {
  type: FacilityType;
  label: string;
  icon: string; // Emoji or SVG icon
  color: string;
  bg: string;
}

export interface FacilityMarker {
  id: string;
  type: FacilityType;
  label: string;
  icon: string;
  note: string;
  x: number; // percentage left%
  y: number; // percentage top%
  createdAt: string;
  buildingId?: string; // Optional associated building
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number | null;
  speed?: number | null;
  mapX?: number; // relative % on map
  mapY?: number; // relative % on map
  updatedAt: Date;
}

export interface MapViewport {
  scale: number;
  translateX: number;
  translateY: number;
}
