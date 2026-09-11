// Comprehensive Geographic, Topographic, and Hydrological dataset for North Eastern Region (NER)
// Focus areas: Sikkim (Teesta Basin, NH-10, NH-717A), Meghalaya (Shillong Plateau, NH-6, Cherrapunji), Assam (Brahmaputra Valley & Barak Valley)

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface MountainPeak {
  id: string;
  name: string;
  elevationMeters: number;
  coordinates: GeoCoordinate;
  description: string;
  range: string;
}

export interface MountainPass {
  id: string;
  name: string;
  elevationMeters: number;
  coordinates: GeoCoordinate;
  significance: string;
  status: 'OPEN' | 'SNOW_BOUND' | 'RESTRICTED' | 'PERMIT_ONLY';
}

export interface RiverPath {
  id: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng]
  basin: string;
  flowVelocityAvg: number; // m/s
  isMainCorridor?: boolean;
}

export interface WaterBody {
  id: string;
  name: string;
  type: 'LAKE' | 'RESERVOIR' | 'WETLAND';
  coordinates: GeoCoordinate;
  elevationMeters: number;
  areaSqKm: number;
}

export interface RegionBoundary {
  id: string;
  name: string;
  category: 'STATE' | 'INTERNATIONAL' | 'DISTRICT';
  coordinates: [number, number][]; // [lat, lng]
  strokeDash?: string;
  strokeColor?: string;
}

export interface HazardHotspot {
  id: string;
  name: string;
  hazardType: 'LANDSLIDE' | 'DEBRIS_FLOW' | 'FLASH_FLOOD' | 'FAULT_LINE' | 'SINKHOLE';
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  coordinates: GeoCoordinate;
  radiusKm: number;
  description: string;
  triggerThresholdMm: number; // 24h rainfall trigger
  historicalIncidents: number;
}

export interface StrategicCorridor {
  code: string;
  name: string;
  description: string;
  elevationProfile: { min: number; max: number };
  criticalChokepoints: string[];
  alternativeRouteCode: string;
}

// 1. High Himalayan Summits & Escarpment Peaks
export const mountainPeaks: MountainPeak[] = [
  {
    id: 'peak_kanchenjunga',
    name: 'Mt. Kangchenjunga',
    elevationMeters: 8586,
    coordinates: { lat: 27.7025, lng: 88.1475 },
    description: '3rd highest peak on Earth, sacred guardian deity of Sikkim',
    range: 'Great Himalaya'
  },
  {
    id: 'peak_pandim',
    name: 'Mt. Pandim',
    elevationMeters: 6691,
    coordinates: { lat: 27.5833, lng: 88.2167 },
    description: 'Prominent peak overlooking Goecha La and Dzongri',
    range: 'Sikkim Himalaya'
  },
  {
    id: 'peak_kabru',
    name: 'Mt. Kabru',
    elevationMeters: 7412,
    coordinates: { lat: 27.6333, lng: 88.1167 },
    description: 'South of Kangchenjunga, glaciated headwaters of Rathong Chu',
    range: 'Singalila / Great Himalaya'
  },
  {
    id: 'peak_paohanri',
    name: 'Pauhunri Peak',
    elevationMeters: 7128,
    coordinates: { lat: 27.9525, lng: 88.8475 },
    description: 'North-Eastern Sikkim border peak near Gurudongmar/Chholamo',
    range: 'Tibetan Border Crest'
  },
  {
    id: 'peak_shillong',
    name: 'Shillong Peak',
    elevationMeters: 1965,
    coordinates: { lat: 25.5325, lng: 91.8683 },
    description: 'Highest point of the Meghalaya Plateau, IAF radar station',
    range: 'Khasi Hills'
  },
  {
    id: 'peak_nokrek',
    name: 'Nokrek Peak',
    elevationMeters: 1412,
    coordinates: { lat: 25.4867, lng: 90.325 },
    description: 'Highest peak of Garo Hills, UNESCO Biosphere Reserve',
    range: 'Garo Hills'
  },
  {
    id: 'peak_saramati',
    name: 'Thadlaskein Ridge',
    elevationMeters: 1380,
    coordinates: { lat: 25.495, lng: 92.203 },
    description: 'Scenic ridge overlooking Jaintia Hills coal corridor',
    range: 'Jaintia Hills'
  }
];

// 2. Mountain Passes & Strategic Transit Checkpoints
export const mountainPasses: MountainPass[] = [
  {
    id: 'pass_nathula',
    name: 'Nathu La Pass',
    elevationMeters: 4310,
    coordinates: { lat: 27.3865, lng: 88.8315 },
    significance: 'Historic Silk Route border crossing with China (Tibet Autonomous Region). Heavy winter snow blocks.',
    status: 'PERMIT_ONLY'
  },
  {
    id: 'pass_jelepla',
    name: 'Jelep La Pass',
    elevationMeters: 4267,
    coordinates: { lat: 27.3644, lng: 88.8711 },
    significance: 'High mountain pass between India (East Sikkim) and Tibet via Chumbi Valley.',
    status: 'RESTRICTED'
  },
  {
    id: 'pass_chola',
    name: 'Cho La Pass',
    elevationMeters: 4420,
    coordinates: { lat: 27.4333, lng: 88.8167 },
    significance: 'Northern pass connecting Sikkim with the Chumbi Valley.',
    status: 'RESTRICTED'
  },
  {
    id: 'pass_sela',
    name: 'Sela Pass Gate',
    elevationMeters: 4170,
    coordinates: { lat: 27.502, lng: 92.103 },
    significance: 'High-altitude mountain pass connecting West Kameng to Tawang (Border Roads Sela Tunnel).',
    status: 'OPEN'
  }
];

// 3. High-Fidelity River Network (Coordinates tracing actual mountain gorges and river basins)
export const riverSystems: RiverPath[] = [
  {
    id: 'river_teesta_main',
    name: 'Teesta River (Main Ghy Corridor)',
    basin: 'Brahmaputra / Bay of Bengal',
    flowVelocityAvg: 3.8,
    isMainCorridor: true,
    coordinates: [
      [27.85, 88.58], // North Sikkim glaciated source
      [27.60, 88.55], // Chungthang confluence
      [27.51, 88.53], // Mangan Valley
      [27.40, 88.51], // Dikchu Dam & NH-10 approach
      [27.24, 88.50], // Singtam confluence
      [27.18, 88.52], // Rangpo interstate border
      [27.12, 88.48], // Melli confluence with Rangeet
      [27.05, 88.44], // Teesta Bazaar & 29th Mile landslide zone
      [26.96, 88.45], // Likhu Veer gorge
      [26.88, 88.47], // Sevoke Coronation Bridge
      [26.78, 88.53], // Gazoldoba Teesta Barrage
      [26.60, 88.68], // Jalpaiguri Plains
      [26.40, 88.85]  // Towards Bangladesh border
    ]
  },
  {
    id: 'river_rangeet',
    name: 'Rangeet River (West Sikkim)',
    basin: 'Teesta Sub-basin',
    flowVelocityAvg: 2.9,
    coordinates: [
      [27.35, 88.22], // Yuksom headwaters
      [27.28, 88.27], // Tashiding holy river
      [27.22, 88.31], // Legship hydro dam
      [27.15, 88.39], // Jorethang hub
      [27.12, 88.48]  // Confluence with Teesta at Melli
    ]
  },
  {
    id: 'river_brahmaputra',
    name: 'Brahmaputra River (Assam Lifeline)',
    basin: 'Brahmaputra Basin',
    flowVelocityAvg: 2.4,
    isMainCorridor: true,
    coordinates: [
      [26.75, 93.00], // Tezpur reach
      [26.60, 92.80], // Silghat / Kaziranga north fringe
      [26.45, 92.40], // Morigaon reach
      [26.25, 91.85], // East Guwahati approach
      [26.19, 91.75], // Guwahati Uzan Bazaar
      [26.15, 91.68], // Saraighat Rail-Road Bridge
      [26.12, 91.50], // Palasbari reach
      [26.10, 91.10], // Chaygaon
      [26.15, 90.60], // Goalpara Pancharatna Bridge
      [25.95, 89.98]  // Dhubri reach (border with Bangladesh)
    ]
  },
  {
    id: 'river_barak',
    name: 'Barak River (Surma-Kushiyara Basin)',
    basin: 'Meghna / Barak Basin',
    flowVelocityAvg: 1.8,
    isMainCorridor: true,
    coordinates: [
      [25.02, 93.02], // Lakhipur intake
      [24.83, 92.78], // Silchar Annapurna Ghat
      [24.87, 92.60], // Badarpur railway junction
      [24.86, 92.35]  // Karimganj border split
    ]
  },
  {
    id: 'river_umiam',
    name: 'Umiam River & Barapani Gorge',
    basin: 'Brahmaputra tributary',
    flowVelocityAvg: 1.5,
    coordinates: [
      [25.68, 91.90], // Umiam reservoir headwaters
      [25.75, 91.87], // Hydro plant gorge
      [25.85, 91.82], // Byrnihat industrial zone
      [26.05, 91.75]  // Guwahati south outskirts
    ]
  },
  {
    id: 'river_umngot',
    name: 'Umngot River (Dawki Border River)',
    basin: 'Surma Basin',
    flowVelocityAvg: 1.2,
    coordinates: [
      [25.35, 92.05], // West Jaintia hills source
      [25.22, 92.03], // Dawki Suspension Bridge
      [25.18, 92.02]  // Bangladesh border at Tamabil
    ]
  }
];

// 4. Critical Water Bodies & Strategic Reservoirs
export const waterBodies: WaterBody[] = [
  {
    id: 'lake_tsomgo',
    name: 'Tsomgo (Changu) Lake',
    type: 'LAKE',
    coordinates: { lat: 27.3742, lng: 88.7619 },
    elevationMeters: 3753,
    areaSqKm: 0.24
  },
  {
    id: 'lake_gurudongmar',
    name: 'Gurudongmar Lake',
    type: 'LAKE',
    coordinates: { lat: 28.0258, lng: 88.7094 },
    elevationMeters: 5430,
    areaSqKm: 1.18
  },
  {
    id: 'res_umiam',
    name: 'Umiam Lake (Barapani Reservoir)',
    type: 'RESERVOIR',
    coordinates: { lat: 25.6667, lng: 91.895 },
    elevationMeters: 990,
    areaSqKm: 220
  },
  {
    id: 'wetland_deepor',
    name: 'Deepor Beel Ramsar Wetland',
    type: 'WETLAND',
    coordinates: { lat: 26.1264, lng: 91.6569 },
    elevationMeters: 53,
    areaSqKm: 40.1
  }
];

// 5. State & International Border Lines (Cartographic polylines)
export const regionBoundaries: RegionBoundary[] = [
  // International: India - Bhutan Border
  {
    id: 'border_bhutan',
    name: 'India - Bhutan Border',
    category: 'INTERNATIONAL',
    strokeDash: '4 4',
    strokeColor: '#f59e0b',
    coordinates: [
      [27.35, 88.92], // Junction near Jelep La
      [27.15, 88.90],
      [27.00, 89.20],
      [26.85, 89.80],
      [26.85, 90.50],
      [26.85, 91.50],
      [26.90, 92.10]
    ]
  },
  // International: India - Bangladesh Border (Meghalaya & Assam frontier)
  {
    id: 'border_bangladesh',
    name: 'India - Bangladesh International Border',
    category: 'INTERNATIONAL',
    strokeDash: '6 3',
    strokeColor: '#f43f5e',
    coordinates: [
      [25.10, 89.85], // Mankachar / West Garo Hills
      [25.15, 90.20],
      [25.18, 90.65], // Baghmara
      [25.18, 91.15],
      [25.15, 91.60], // Cherrapunji south escarpment
      [25.18, 92.02], // Dawki / Tamabil
      [25.10, 92.40],
      [24.85, 92.35], // Karimganj / Sutarkandi
      [24.65, 92.45]
    ]
  },
  // International: India - China (Tibet) LAC
  {
    id: 'border_lac',
    name: 'India - Tibet LAC / Boundary',
    category: 'INTERNATIONAL',
    strokeDash: '8 4',
    strokeColor: '#ef4444',
    coordinates: [
      [27.75, 88.10], // North of Kanchenjunga
      [27.95, 88.25],
      [28.10, 88.55], // Gurudongmar north
      [28.00, 88.75],
      [27.80, 88.85],
      [27.40, 88.85]  // Nathu La
    ]
  },
  // State: Sikkim - West Bengal Border (along Rangpo / Rishi / Teesta)
  {
    id: 'border_sikkim_wb',
    name: 'Sikkim - West Bengal Interstate Border',
    category: 'STATE',
    strokeDash: '3 3',
    strokeColor: '#94a3b8',
    coordinates: [
      [27.15, 88.10], // Singalila ridge
      [27.12, 88.35], // Jorethang / Melli
      [27.12, 88.48], // Melli Teesta bridge
      [27.18, 88.53], // Rangpo checkpoint
      [27.17, 88.65], // Rhenock bridge
      [27.20, 88.80]
    ]
  },
  // State: Assam - Meghalaya Border
  {
    id: 'border_assam_meghalaya',
    name: 'Assam - Meghalaya Interstate Border',
    category: 'STATE',
    strokeDash: '3 3',
    strokeColor: '#94a3b8',
    coordinates: [
      [25.90, 89.90],
      [25.85, 90.50],
      [25.95, 91.20],
      [26.05, 91.75], // Byrnihat / Khanapara gate
      [26.00, 92.30],
      [25.75, 92.80],
      [25.10, 92.80]  // North Cachar / Jaintia border
    ]
  }
];

// 6. Geological Hazard Hotspots (GSI Classified Landslide & Slope Instability Zones)
export const hazardHotspots: HazardHotspot[] = [
  {
    id: 'hazard_29th_mile',
    name: '29th Mile Landslide Zone (NH-10)',
    hazardType: 'LANDSLIDE',
    severity: 'CRITICAL',
    coordinates: { lat: 26.96, lng: 88.45 },
    radiusKm: 2.5,
    description: 'Highly fractured phyllite and quartz rock mass subject to active slope toe erosion by turbulent Teesta waters.',
    triggerThresholdMm: 65,
    historicalIncidents: 42
  },
  {
    id: 'hazard_birik_dara',
    name: 'Birik Dara Sinking Zone (NH-10)',
    hazardType: 'DEBRIS_FLOW',
    severity: 'CRITICAL',
    coordinates: { lat: 26.92, lng: 88.46 },
    radiusKm: 1.8,
    description: 'Deep-seated rotational debris slide with high water saturation causing continuous subsidence.',
    triggerThresholdMm: 50,
    historicalIncidents: 38
  },
  {
    id: 'hazard_likhu_veer',
    name: 'Likhu Veer Precipice (NH-10)',
    hazardType: 'LANDSLIDE',
    severity: 'CRITICAL',
    coordinates: { lat: 27.02, lng: 88.44 },
    radiusKm: 2.0,
    description: 'Sheer vertical rock cliff prone to shooting boulders and mass rockfalls during micro-earthquakes and cloudbursts.',
    triggerThresholdMm: 55,
    historicalIncidents: 31
  },
  {
    id: 'hazard_sonapur_tunnel',
    name: 'Sonapur Mudslide Choke (NH-6 East Jaintia)',
    hazardType: 'DEBRIS_FLOW',
    severity: 'CRITICAL',
    coordinates: { lat: 25.12, lng: 92.38 },
    radiusKm: 3.0,
    description: 'Steep shale cut slope above Sonapur tunnel portal delivering massive liquid mud debris across NH-6.',
    triggerThresholdMm: 80,
    historicalIncidents: 29
  },
  {
    id: 'hazard_setijhora',
    name: 'Setijhora Flash Stream (NH-10)',
    hazardType: 'FLASH_FLOOD',
    severity: 'HIGH',
    coordinates: { lat: 26.89, lng: 88.47 },
    radiusKm: 1.5,
    description: 'High-gradient ephemeral mountain stream carrying heavy boulders that breach culverts into the Coronation Bridge approach.',
    triggerThresholdMm: 70,
    historicalIncidents: 19
  },
  {
    id: 'hazard_dima_hasao',
    name: 'Dima Hasao Hill Cut (NH-27)',
    hazardType: 'LANDSLIDE',
    severity: 'HIGH',
    coordinates: { lat: 25.18, lng: 92.85 },
    radiusKm: 4.0,
    description: 'Unstabilized highway widening cuts in fragile tertiary sedimentary strata prone to extensive slope wash.',
    triggerThresholdMm: 90,
    historicalIncidents: 15
  }
];

// 7. National Highway Corridors Specifications
export const strategicCorridors: Record<string, StrategicCorridor> = {
  'NH-10': {
    code: 'NH-10',
    name: 'Sevoke - Teesta - Gangtok Lifeline',
    description: 'Primary lifeline carrying >85% of Sikkim food, medicine, and petroleum supplies through the steep Teesta River gorge.',
    elevationProfile: { min: 180, max: 1650 },
    criticalChokepoints: ['29th Mile', 'Likhu Veer', 'Birik Dara', 'Rabi Jhora'],
    alternativeRouteCode: 'NH-717A'
  },
  'NH-717A': {
    code: 'NH-717A',
    name: 'Bagrakote - Lava - Algarah - Pakyong Alternate Corridor',
    description: 'New strategic alternate highway traversing higher ridges away from the vulnerable Teesta flood line.',
    elevationProfile: { min: 250, max: 2180 },
    criticalChokepoints: ['Lava Pass (Fog/Frost)', 'Rishi Bridge single lane'],
    alternativeRouteCode: 'NH-10'
  },
  'NH-6': {
    code: 'NH-6',
    name: 'Guwahati - Shillong - Silchar Interstate Lifeline',
    description: 'Sole surface arterial corridor linking Assam (Guwahati) through Meghalaya to the Barak Valley, Tripura, and Mizoram.',
    elevationProfile: { min: 55, max: 1550 },
    criticalChokepoints: ['Sonapur Tunnel portal', 'Umiam Lake bypass', 'Ladrymbai coal freight congestion'],
    alternativeRouteCode: 'NH-27 Haflong Corridor'
  },
  'NH-27': {
    code: 'NH-27',
    name: 'East-West High-Capacity Corridor',
    description: 'Multilane 4-lane arterial backbone connecting West Bengal across Lower Assam into Guwahati and Nagaon.',
    elevationProfile: { min: 45, max: 180 },
    criticalChokepoints: ['Saraighat Brahmaputra crossing', 'Kaziranga animal corridor speed limits'],
    alternativeRouteCode: 'NH-127B'
  }
};
