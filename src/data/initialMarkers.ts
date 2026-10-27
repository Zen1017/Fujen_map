import { FacilityMarker, FacilityTypeConfig } from '../types';

export const FACILITY_CONFIGS: Record<string, FacilityTypeConfig> = {
  water: {
    type: 'water',
    label: '飲水機',
    icon: '🚰',
    color: '#0284C7',
    bg: '#E0F2FE'
  },
  tissue: {
    type: 'tissue',
    label: '衛生紙',
    icon: '🧻',
    color: '#D97706',
    bg: '#FEF3C7'
  },
  aed: {
    type: 'aed',
    label: 'AED 急救',
    icon: '🚑',
    color: '#DC2626',
    bg: '#FEE2E2'
  },
  trash: {
    type: 'trash',
    label: '垃圾桶/回收',
    icon: '🗑️',
    color: '#4B5563',
    bg: '#F3F4F6'
  },
  study: {
    type: 'study',
    label: '自習空間',
    icon: '📖',
    color: '#2563EB',
    bg: '#DBEAFE'
  },
  restroom: {
    type: 'restroom',
    label: '洗手間',
    icon: '🚻',
    color: '#7C3AED',
    bg: '#EDE9FE'
  }
};

export const INITIAL_MARKERS: FacilityMarker[] = [
  {
    id: 'm-1',
    type: 'aed',
    label: 'MD國璽樓1樓AED',
    icon: '🚑',
    note: '位於國璽樓1樓電梯旁與大廳服務台前方。',
    x: 13.5,
    y: 18.5,
    createdAt: '2026-08-01',
    buildingId: 'b-md'
  },
  {
    id: 'm-2',
    type: 'water',
    label: '中美堂門口飲水機',
    icon: '🚰',
    note: '中美堂正門入口處右側，冰溫熱飲水機。',
    x: 23.5,
    y: 22.0,
    createdAt: '2026-08-01',
    buildingId: 'b-zhongmei'
  },
  {
    id: 'm-3',
    type: 'study',
    label: '濟時樓 24H 閱覽區',
    icon: '📖',
    note: '濟時樓地下室 K 書自習室，刷學生證可入場。',
    x: 22.0,
    y: 73.5,
    createdAt: '2026-08-01',
    buildingId: 'b-js'
  },
  {
    id: 'm-4',
    type: 'water',
    label: 'LM利瑪竇 2F 飲水機',
    icon: '🚰',
    note: 'LM利瑪竇大樓 2樓與3樓中庭梯口。',
    x: 25.0,
    y: 40.5,
    createdAt: '2026-08-02',
    buildingId: 'b-lm'
  },
  {
    id: 'm-5',
    type: 'tissue',
    label: 'SF聖言樓 1F 衛生紙販賣機',
    icon: '🧻',
    note: '聖言樓1F女廁與男廁門口備有面紙投幣機。',
    x: 42.5,
    y: 69.5,
    createdAt: '2026-08-02',
    buildingId: 'b-sf'
  },
  {
    id: 'm-6',
    type: 'restroom',
    label: '輔園學餐無障礙洗手間',
    icon: '🚻',
    note: '輔園餐飲美食街側邊，無障礙友善洗手間。',
    x: 78.5,
    y: 63.5,
    createdAt: '2026-08-03',
    buildingId: 'b-fuyuan'
  },
  {
    id: 'm-7',
    type: 'trash',
    label: '風華廣場資源回收站',
    icon: '🗑️',
    note: '風華廣場與利瑪竇之間，設有一般垃圾與資源回收桶。',
    x: 37.5,
    y: 35.0,
    createdAt: '2026-08-03'
  },
  {
    id: 'm-8',
    type: 'aed',
    label: '耕莘樓行政大樓AED',
    icon: '🚑',
    note: '耕莘樓1樓總務處櫃檯前壁掛式自動體外心臟電擊去顫器。',
    x: 71.5,
    y: 84.0,
    createdAt: '2026-08-04',
    buildingId: 'b-a'
  }
];
