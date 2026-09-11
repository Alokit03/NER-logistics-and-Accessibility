import {
  GraphNode,
  RoadSegment,
  IMDWeatherFeed,
  ISROBhuvanFeed,
  GSISusceptibilityFeed,
  CWCFloodFeed,
  FieldReport,
  TrackedShipment,
  AlertNotification,
  BaseGraphVersion,
  DistrictAccessibilityMetric,
  InterstateCoordinationProtocol,
  DisasterAuditReport
} from '../types';

export const initialNodes: GraphNode[] = [
  {
    id: 'node_siliguri',
    name: 'Siliguri Logistics Junction',
    district: 'Darjeeling Gateway',
    state: 'West Bengal',
    lat: 26.7271,
    lng: 88.4316,
    elevationMeters: 122,
    isHub: true,
    populationServed: 700000
  },
  {
    id: 'node_sevoke',
    name: 'Sevoke Coronation Bridge',
    district: 'Darjeeling',
    state: 'West Bengal',
    lat: 26.8833,
    lng: 88.4719,
    elevationMeters: 180,
    isHub: false
  },
  {
    id: 'node_kalimpong',
    name: 'Kalimpong Sub-Div Hub',
    district: 'Kalimpong',
    state: 'West Bengal',
    lat: 27.0667,
    lng: 88.4667,
    elevationMeters: 1250,
    isHub: false
  },
  {
    id: 'node_algarah_lava',
    name: 'Algarah - Lava Junction (NH-717A)',
    district: 'Kalimpong',
    state: 'West Bengal',
    lat: 27.112,
    lng: 88.594,
    elevationMeters: 1780,
    isHub: false
  },
  {
    id: 'node_rangpo',
    name: 'Rangpo Border Checkpost',
    district: 'Pakyong',
    state: 'Sikkim',
    lat: 27.1767,
    lng: 88.5283,
    elevationMeters: 330,
    isHub: true,
    populationServed: 120000
  },
  {
    id: 'node_singtam',
    name: 'Singtam Teesta Confluence',
    district: 'East Sikkim',
    state: 'Sikkim',
    lat: 27.2344,
    lng: 88.4975,
    elevationMeters: 400,
    isHub: true
  },
  {
    id: 'node_gangtok',
    name: 'Gangtok Central Hub',
    district: 'Gangtok',
    state: 'Sikkim',
    lat: 27.3389,
    lng: 88.6065,
    elevationMeters: 1650,
    isHub: true,
    populationServed: 100000
  },
  {
    id: 'node_mangan',
    name: 'Mangan District HQ',
    district: 'Mangan',
    state: 'Sikkim',
    lat: 27.5065,
    lng: 88.5255,
    elevationMeters: 956,
    isHub: true,
    populationServed: 45000
  },
  {
    id: 'node_chungthang',
    name: 'Chungthang Confluence Hub',
    district: 'Mangan',
    state: 'Sikkim',
    lat: 27.6039,
    lng: 88.6464,
    elevationMeters: 1790,
    isHub: false,
    populationServed: 18000
  },
  {
    id: 'node_guwahati',
    name: 'Guwahati Regional Terminal',
    district: 'Kamrup Metro',
    state: 'Assam',
    lat: 26.1445,
    lng: 91.7362,
    elevationMeters: 55,
    isHub: true,
    populationServed: 1200000
  },
  {
    id: 'node_nongpoh',
    name: 'Nongpoh Ri-Bhoi Node',
    district: 'Ri-Bhoi',
    state: 'Meghalaya',
    lat: 25.9038,
    lng: 91.8797,
    elevationMeters: 485,
    isHub: false
  },
  {
    id: 'node_shillong',
    name: 'Shillong Central Hub',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.5788,
    lng: 91.8933,
    elevationMeters: 1525,
    isHub: true,
    populationServed: 350000
  },
  {
    id: 'node_cherrapunji',
    name: 'Cherrapunji (Sohra) Node',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.2986,
    lng: 91.7323,
    elevationMeters: 1484,
    isHub: false
  },
  {
    id: 'node_jowai',
    name: 'Jowai Logistics Center',
    district: 'West Jaintia Hills',
    state: 'Meghalaya',
    lat: 25.4526,
    lng: 92.2039,
    elevationMeters: 1380,
    isHub: false
  },
  {
    id: 'node_khliehriat',
    name: 'Khliehriat Junction',
    district: 'East Jaintia Hills',
    state: 'Meghalaya',
    lat: 25.3587,
    lng: 92.3614,
    elevationMeters: 1200,
    isHub: false
  },
  {
    id: 'node_silchar',
    name: 'Silchar Gateway Terminal',
    district: 'Cachar',
    state: 'Assam',
    lat: 24.8333,
    lng: 92.7789,
    elevationMeters: 25,
    isHub: true,
    populationServed: 230000
  }
];

export const initialRoadSegments: RoadSegment[] = [
  {
    id: 'seg_nh10_sevoke_rangpo',
    name: 'NH-10 (Sevoke - 29th Mile - Rangpo)',
    highwayCode: 'NH-10',
    fromNodeId: 'node_sevoke',
    toNodeId: 'node_rangpo',
    lengthKm: 42,
    surfaceType: 'BITUMINOUS',
    widthMeters: 7.5,
    averageElevationMeters: 280,
    slopeAngleDeg: 42,
    riverProximityMeters: 15,
    historicalDisruptionCount: 38,
    currentCondition: 'BLOCKED',
    riskScore: 94,
    riskFactors: {
      rainfallContribution: 35,
      slopeContribution: 25,
      gsiSusceptibilityContribution: 20,
      historicalDisruptionContribution: 10,
      fieldReportContribution: 4,
      totalScore: 94,
      primaryCause: 'Massive landslide at 29th Mile & river erosion by Teesta'
    },
    authorityOverride: {
      isOverridden: true,
      overriddenStatus: 'BLOCKED',
      officialName: 'Er. P. K. Pradhan',
      department: 'NHIDCL Project Unit 4',
      orderNumber: 'NHIDCL/SKM/EMERG/2026/88',
      reason: 'Teesta water level above danger mark; debris flow active over 120m stretch',
      timestamp: '2026-09-11 08:30 IST'
    },
    coordinates: [
      [26.8833, 88.4719], // Sevoke (Coronation Bridge)
      [26.9015, 88.4735], // Sevoke Railway crossing
      [26.9242, 88.4795], // Kalijhora Teesta Low Dam
      [26.9410, 88.4842], // Coronation approach bend
      [26.9531, 88.4892], // Birik Dara
      [26.9745, 88.4981], // 27th Mile
      [26.9912, 88.5042], // 29th Mile (Seti Jhora Landslide Zone)
      [27.0125, 88.5110], // Rambi Bazar
      [27.0251, 88.5134], // Likhu Bhir sheer rockface
      [27.0544, 88.4988], // Teesta Bazaar / Chitrey confluence
      [27.0721, 88.4790], // Melli gorge entry
      [27.0872, 88.4611], // Melli Bazar & Bridge
      [27.1120, 88.4780], // Kirney
      [27.1356, 88.4965], // Tarkhola checkpost
      [27.1580, 88.5140], // Mamring
      [27.1767, 88.5283]  // Rangpo Border Checkpost
    ],
    lastUpdated: '12 mins ago',
    isEmergencyCorridor: true,
    estimatedClearanceTimeHours: 6.5
  },
  {
    id: 'seg_nh717a_sevoke_lava_rangpo',
    name: 'NH-717A (Sevoke - Lava - Algarah - Rangpo)',
    highwayCode: 'NH-717A',
    fromNodeId: 'node_sevoke',
    toNodeId: 'node_rangpo',
    lengthKm: 64,
    surfaceType: 'BITUMINOUS',
    widthMeters: 10.0,
    averageElevationMeters: 1350,
    slopeAngleDeg: 24,
    riverProximityMeters: 450,
    historicalDisruptionCount: 4,
    currentCondition: 'OPEN',
    riskScore: 28,
    riskFactors: {
      rainfallContribution: 12,
      slopeContribution: 8,
      gsiSusceptibilityContribution: 5,
      historicalDisruptionContribution: 2,
      fieldReportContribution: 1,
      totalScore: 28,
      primaryCause: 'High-elevation ridge alignment; stable rock slopes'
    },
    coordinates: [
      [26.8833, 88.4719], // Sevoke
      [26.8778, 88.5412], // Bagrakote Tea Gardens
      [26.8845, 88.5912], // Damdim Bypass
      [26.9120, 88.6410], // Chel River Valley
      [26.9691, 88.6948], // Gorubathan Foothills
      [27.0150, 88.6820], // Paparkheti hairpin loops
      [27.0540, 88.6710], // Kolakham Ridge
      [27.0864, 88.6601], // Lava Forest Reserve (2100m)
      [27.1120, 88.5940], // Algarah Ridge Junction
      [27.1350, 88.6050], // Pedong Hill Station
      [27.1580, 88.6210], // Rishi Valley Descent
      [27.1712, 88.6274], // Reshi Khola River Border
      [27.1895, 88.6133], // Rorathang Junction
      [27.2010, 88.5810], // Mining - Kumrek
      [27.1767, 88.5283]  // Rangpo Checkpost
    ],
    lastUpdated: '5 mins ago',
    isEmergencyCorridor: true
  },
  {
    id: 'seg_nh10_siliguri_sevoke',
    name: 'NH-10 (Siliguri to Sevoke)',
    highwayCode: 'NH-10',
    fromNodeId: 'node_siliguri',
    toNodeId: 'node_sevoke',
    lengthKm: 22,
    surfaceType: 'BITUMINOUS',
    widthMeters: 12.0,
    averageElevationMeters: 150,
    slopeAngleDeg: 8,
    riverProximityMeters: 120,
    historicalDisruptionCount: 3,
    currentCondition: 'OPEN',
    riskScore: 16,
    riskFactors: {
      rainfallContribution: 8,
      slopeContribution: 2,
      gsiSusceptibilityContribution: 2,
      historicalDisruptionContribution: 2,
      fieldReportContribution: 2,
      totalScore: 16,
      primaryCause: 'Plains approach road, minor water pooling'
    },
    coordinates: [
      [26.7271, 88.4316], // Siliguri Logistics Junction
      [26.7580, 88.4390], // Bhaktinagar
      [26.7920, 88.4480], // Salugara Military Camp
      [26.8250, 88.4550], // Sukna Forest Entry
      [26.8580, 88.4630], // Mahananda Wildlife Sanctuary Road
      [26.8833, 88.4719]  // Sevoke Coronation Bridge
    ],
    lastUpdated: '18 mins ago',
    isEmergencyCorridor: true
  },
  {
    id: 'seg_nh10_rangpo_singtam',
    name: 'NH-10 (Rangpo - Singtam)',
    highwayCode: 'NH-10',
    fromNodeId: 'node_rangpo',
    toNodeId: 'node_singtam',
    lengthKm: 14,
    surfaceType: 'BITUMINOUS',
    widthMeters: 8.5,
    averageElevationMeters: 380,
    slopeAngleDeg: 31,
    riverProximityMeters: 25,
    historicalDisruptionCount: 19,
    currentCondition: 'AT_RISK',
    riskScore: 71,
    riskFactors: {
      rainfallContribution: 28,
      slopeContribution: 18,
      gsiSusceptibilityContribution: 15,
      historicalDisruptionContribution: 8,
      fieldReportContribution: 2,
      totalScore: 71,
      primaryCause: 'Active rock-fall near Bagey Khola; single lane traffic'
    },
    coordinates: [
      [27.1767, 88.5283], // Rangpo Checkpost
      [27.1850, 88.5240], // Rangpo Industrial Zone
      [27.1950, 88.5180], // Mining Ghat
      [27.2080, 88.5110], // Bagey Khola Rockfall Zone
      [27.2210, 88.5040], // Majhitar Bridge
      [27.2344, 88.4975]  // Singtam Teesta Confluence
    ],
    lastUpdated: '25 mins ago',
    isEmergencyCorridor: true
  },
  {
    id: 'seg_nh10_singtam_gangtok',
    name: 'NH-10 (Singtam - Ranipool - Gangtok)',
    highwayCode: 'NH-10',
    fromNodeId: 'node_singtam',
    toNodeId: 'node_gangtok',
    lengthKm: 28,
    surfaceType: 'BITUMINOUS',
    widthMeters: 9.0,
    averageElevationMeters: 980,
    slopeAngleDeg: 28,
    riverProximityMeters: 120,
    historicalDisruptionCount: 12,
    currentCondition: 'OPEN',
    riskScore: 42,
    riskFactors: {
      rainfallContribution: 18,
      slopeContribution: 12,
      gsiSusceptibilityContribution: 8,
      historicalDisruptionContribution: 4,
      fieldReportContribution: 0,
      totalScore: 42,
      primaryCause: 'Moderate fog and drizzle, road clear'
    },
    coordinates: [
      [27.2344, 88.4975], // Singtam
      [27.2510, 88.5120], // Martam Loop
      [27.2720, 88.5410], // 32nd Mile
      [27.2912, 88.5714], // Ranipool Bridge & Market
      [27.3110, 88.5890], // 6th Mile / Tadong College
      [27.3250, 88.5990], // Deorali Ropeway Station
      [27.3389, 88.6065]  // Gangtok Central Hub
    ],
    lastUpdated: '30 mins ago',
    isEmergencyCorridor: true
  },
  {
    id: 'seg_sh31_singtam_mangan',
    name: 'State Highway (Singtam - Dikchu - Mangan)',
    highwayCode: 'SH-31',
    fromNodeId: 'node_singtam',
    toNodeId: 'node_mangan',
    lengthKm: 48,
    surfaceType: 'GRAVEL',
    widthMeters: 6.0,
    averageElevationMeters: 850,
    slopeAngleDeg: 46,
    riverProximityMeters: 30,
    historicalDisruptionCount: 42,
    currentCondition: 'RESTRICTED',
    riskScore: 82,
    riskFactors: {
      rainfallContribution: 32,
      slopeContribution: 26,
      gsiSusceptibilityContribution: 16,
      historicalDisruptionContribution: 6,
      fieldReportContribution: 2,
      totalScore: 82,
      primaryCause: 'Severe mud slump at Dikchu bridge approach; restricted to 4x4 & relief vehicles'
    },
    coordinates: [
      [27.2344, 88.4975], // Singtam
      [27.2650, 88.5020], // Makha Valley
      [27.3010, 88.5110], // Samdong
      [27.3480, 88.5190], // Dikchu Hydel Dam Approach
      [27.3820, 88.5140], // Dikchu Teesta Bridge
      [27.4210, 88.5090], // Rangrang Slide Area
      [27.4650, 88.5180], // Tingda Village
      [27.5065, 88.5255]  // Mangan District HQ
    ],
    lastUpdated: '14 mins ago',
    isEmergencyCorridor: true
  },
  {
    id: 'seg_nh310a_mangan_chungthang',
    name: 'NH-310A (Mangan - Chungthang Lifeline)',
    highwayCode: 'NH-310A',
    fromNodeId: 'node_mangan',
    toNodeId: 'node_chungthang',
    lengthKm: 26,
    surfaceType: 'BITUMINOUS',
    widthMeters: 6.5,
    averageElevationMeters: 1420,
    slopeAngleDeg: 52,
    riverProximityMeters: 10,
    historicalDisruptionCount: 51,
    currentCondition: 'BLOCKED',
    riskScore: 98,
    riskFactors: {
      rainfallContribution: 38,
      slopeContribution: 30,
      gsiSusceptibilityContribution: 22,
      historicalDisruptionContribution: 6,
      fieldReportContribution: 2,
      totalScore: 98,
      primaryCause: 'Flash-flood breached culvert at Pegong; high Teesta velocity'
    },
    authorityOverride: {
      isOverridden: true,
      overriddenStatus: 'BLOCKED',
      officialName: 'District Magistrate Mangan',
      department: 'District Disaster Management Authority (DDMA)',
      orderNumber: 'DDMA/NG/2026/LND-09',
      reason: 'All civilian & transport transit halted till water recedes and BRO deploys bailey unit',
      timestamp: '2026-09-11 06:15 IST'
    },
    coordinates: [
      [27.5065, 88.5255], // Mangan HQ
      [27.5245, 88.5398], // Singhik Viewpoint
      [27.5450, 88.5620], // Toong Checkpost
      [27.5612, 88.5841], // Pegong Flash-Flood Breached Stretch
      [27.5812, 88.6190], // Naga Waterfalls
      [27.5950, 88.6340], // Bop Military Camp
      [27.6039, 88.6464]  // Chungthang Confluence
    ],
    lastUpdated: '8 mins ago',
    isEmergencyCorridor: true,
    estimatedClearanceTimeHours: 14.0
  },
  {
    id: 'seg_nh27_guwahati_nongpoh',
    name: 'NH-27 / NH-6 (Guwahati - Khanapara - Nongpoh)',
    highwayCode: 'NH-6',
    fromNodeId: 'node_guwahati',
    toNodeId: 'node_nongpoh',
    lengthKm: 46,
    surfaceType: 'CONCRETE',
    widthMeters: 14.0,
    averageElevationMeters: 260,
    slopeAngleDeg: 14,
    riverProximityMeters: 300,
    historicalDisruptionCount: 5,
    currentCondition: 'OPEN',
    riskScore: 22,
    riskFactors: {
      rainfallContribution: 10,
      slopeContribution: 4,
      gsiSusceptibilityContribution: 4,
      historicalDisruptionContribution: 2,
      fieldReportContribution: 2,
      totalScore: 22,
      primaryCause: 'Four-lane expressway corridor; well engineered slopes'
    },
    coordinates: [
      [26.1445, 91.7362], // Guwahati Regional Terminal
      [26.1280, 91.7820], // Beltola Chariali
      [26.1154, 91.8211], // Khanapara Inter-State Terminus
      [26.1032, 91.8791], // Jorabat Junction (Assam-Meghalaya Border)
      [26.0710, 91.8750], // 13th Mile Hill Section
      [26.0456, 91.8712], // Burnihat Industrial Area
      [25.9810, 91.8740], // Byrnihat Valley
      [25.9420, 91.8765], // Umsamlem
      [25.9038, 91.8797]  // Nongpoh Ri-Bhoi Node
    ],
    lastUpdated: '10 mins ago',
    isEmergencyCorridor: true
  },
  {
    id: 'seg_nh6_nongpoh_shillong',
    name: 'NH-6 (Nongpoh - Umiam - Shillong Bypass)',
    highwayCode: 'NH-6',
    fromNodeId: 'node_nongpoh',
    toNodeId: 'node_shillong',
    lengthKm: 52,
    surfaceType: 'BITUMINOUS',
    widthMeters: 12.0,
    averageElevationMeters: 1050,
    slopeAngleDeg: 22,
    riverProximityMeters: 150,
    historicalDisruptionCount: 8,
    currentCondition: 'OPEN',
    riskScore: 34,
    riskFactors: {
      rainfallContribution: 16,
      slopeContribution: 8,
      gsiSusceptibilityContribution: 6,
      historicalDisruptionContribution: 2,
      fieldReportContribution: 2,
      totalScore: 34,
      primaryCause: 'Heavy mist around Umiam Lake; smooth traffic flow'
    },
    coordinates: [
      [25.9038, 91.8797], // Nongpoh
      [25.8610, 91.8840], // Umsning Bypass Entry
      [25.8120, 91.8910], // Sumer High Elevation
      [25.7512, 91.8943], // Umsning Main Hub
      [25.6980, 91.9020], // Barapani Hill descent
      [25.6631, 91.9082], // Umiam Barapani Lake
      [25.6210, 91.9010], // Umiam Dam Overlook
      [25.5987, 91.8894], // Mawlai Gateway
      [25.5788, 91.8933]  // Shillong Central Hub (Police Bazar)
    ],
    lastUpdated: '15 mins ago',
    isEmergencyCorridor: true
  },
  {
    id: 'seg_sh5_shillong_cherrapunji',
    name: 'SH-5 (Shillong - Mawphlang - Sohra)',
    highwayCode: 'SH-5',
    fromNodeId: 'node_shillong',
    toNodeId: 'node_cherrapunji',
    lengthKm: 54,
    surfaceType: 'BITUMINOUS',
    widthMeters: 7.0,
    averageElevationMeters: 1450,
    slopeAngleDeg: 36,
    riverProximityMeters: 80,
    historicalDisruptionCount: 22,
    currentCondition: 'AT_RISK',
    riskScore: 68,
    riskFactors: {
      rainfallContribution: 34,
      slopeContribution: 16,
      gsiSusceptibilityContribution: 10,
      historicalDisruptionContribution: 6,
      fieldReportContribution: 2,
      totalScore: 68,
      primaryCause: 'Intense rain (142mm in 24h); surface water overflowing near Wahkaba Falls'
    },
    coordinates: [
      [25.5788, 91.8933], // Shillong Central
      [25.5410, 91.8640], // Upper Shillong Peak Road
      [25.4981, 91.8312], // Mylliem Pine Belt
      [25.4690, 91.7920], // Mawphlang Sacred Grove turnoff
      [25.4512, 91.7589], // Laitlyngkot Escarpment
      [25.4212, 91.7391], // Mawkdok Dympep Valley View Bridge
      [25.3810, 91.7410], // Sohrarim Tableland
      [25.3420, 91.7380], // Wahkaba Falls Overflow Area
      [25.2986, 91.7323]  // Cherrapunji (Sohra) Node
    ],
    lastUpdated: '18 mins ago',
    isEmergencyCorridor: false
  },
  {
    id: 'seg_nh6_shillong_jowai',
    name: 'NH-6 (Shillong - Mawryngkneng - Jowai)',
    highwayCode: 'NH-6',
    fromNodeId: 'node_shillong',
    toNodeId: 'node_jowai',
    lengthKm: 60,
    surfaceType: 'BITUMINOUS',
    widthMeters: 9.0,
    averageElevationMeters: 1400,
    slopeAngleDeg: 25,
    riverProximityMeters: 90,
    historicalDisruptionCount: 11,
    currentCondition: 'OPEN',
    riskScore: 38,
    riskFactors: {
      rainfallContribution: 18,
      slopeContribution: 10,
      gsiSusceptibilityContribution: 6,
      historicalDisruptionContribution: 4,
      fieldReportContribution: 0,
      totalScore: 38,
      primaryCause: 'Continuous rainfall, potholes under control'
    },
    coordinates: [
      [25.5788, 91.8933], // Shillong Central
      [25.5680, 91.9540], // Mawryngkneng Bypass
      [25.5512, 92.0543], // Puriang Village
      [25.5121, 92.1245], // Thadlaskein Lake View
      [25.4820, 92.1640], // Mihmyntdu Valley
      [25.4526, 92.2039]  // Jowai Logistics Center
    ],
    lastUpdated: '22 mins ago',
    isEmergencyCorridor: true
  },
  {
    id: 'seg_nh6_jowai_khliehriat_silchar',
    name: 'NH-6 (Jowai - Khliehriat - Sonapur Tunnel - Silchar)',
    highwayCode: 'NH-6',
    fromNodeId: 'node_jowai',
    toNodeId: 'node_silchar',
    lengthKm: 135,
    surfaceType: 'BITUMINOUS',
    widthMeters: 8.0,
    averageElevationMeters: 650,
    slopeAngleDeg: 44,
    riverProximityMeters: 20,
    historicalDisruptionCount: 47,
    currentCondition: 'AT_RISK',
    riskScore: 79,
    riskFactors: {
      rainfallContribution: 32,
      slopeContribution: 24,
      gsiSusceptibilityContribution: 15,
      historicalDisruptionContribution: 6,
      fieldReportContribution: 2,
      totalScore: 79,
      primaryCause: 'Heavy sludge run-off at Sonapur Tunnel mouth; alternate 1-way convoy moving'
    },
    coordinates: [
      [25.4526, 92.2039], // Jowai
      [25.4120, 92.2640], // Lad Rymbai Coal Junction
      [25.3587, 92.3614], // Khliehriat Junction
      [25.2840, 92.3810], // Lumshnong Cement Corridor
      [25.2120, 92.3910], // Wahiajer
      [25.1580, 92.3840], // Lukha River Bridge
      [25.1121, 92.3687], // Sonapur Landslide Tunnel
      [25.0710, 92.3740], // Ratacherra Meghalaya Checkpost
      [25.0412, 92.3812], // Umkiang Ghats
      [24.9781, 92.4512], // Malidor Assam Border
      [24.9310, 92.5240], // Kalain Tea Estate
      [24.8954, 92.6041], // Badarpur River Terminal
      [24.8540, 92.7020], // Ramnagar Bypass
      [24.8333, 92.7789]  // Silchar Gateway Terminal
    ],
    lastUpdated: '9 mins ago',
    isEmergencyCorridor: true,
    estimatedClearanceTimeHours: 3.0
  }
];

export const initialIMDFeeds: IMDWeatherFeed[] = [
  {
    stationId: 'IMD-SKM-01',
    location: 'Gangtok Met Station',
    rainfall6hMm: 62.4,
    alertLevel: 'ORANGE',
    forecast24h: 'Heavy to very heavy showers expected over Himalayan foothills',
    windSpeedKmh: 24,
    cloudburstRisk: true,
    lastSync: '10 mins ago'
  },
  {
    stationId: 'IMD-SKM-02',
    location: 'Mangan North Sikkim',
    rainfall6hMm: 84.8,
    alertLevel: 'RED',
    forecast24h: 'Extremely heavy rainfall. High risk of debris flow in Upper Teesta basin',
    windSpeedKmh: 36,
    cloudburstRisk: true,
    lastSync: '5 mins ago'
  },
  {
    stationId: 'IMD-MEG-01',
    location: 'Cherrapunji (Sohra)',
    rainfall6hMm: 142.0,
    alertLevel: 'RED',
    forecast24h: 'Intense orographic downpour. Escarpment runoff exceeding drainage capacity',
    windSpeedKmh: 42,
    cloudburstRisk: false,
    lastSync: '8 mins ago'
  },
  {
    stationId: 'IMD-MEG-02',
    location: 'Shillong Peak Met',
    rainfall6hMm: 38.5,
    alertLevel: 'YELLOW',
    forecast24h: 'Intermittent moderate showers with dense fog',
    windSpeedKmh: 18,
    cloudburstRisk: false,
    lastSync: '15 mins ago'
  },
  {
    stationId: 'IMD-ASM-01',
    location: 'Guwahati Borjhar Met',
    rainfall6hMm: 19.2,
    alertLevel: 'GREEN',
    forecast24h: 'Partly cloudy with brief light showers',
    windSpeedKmh: 12,
    cloudburstRisk: false,
    lastSync: '20 mins ago'
  }
];

export const initialBhuvanFeeds: ISROBhuvanFeed[] = [
  {
    district: 'Mangan & Upper Teesta',
    soilMoisturePercent: 94,
    terrainStabilityScore: 32,
    detectedScarsCount: 14,
    satellitePassTime: '2026-09-11 05:40 IST (Cartosat-3)'
  },
  {
    district: 'East Sikkim (NH-10 Corridor)',
    soilMoisturePercent: 88,
    terrainStabilityScore: 41,
    detectedScarsCount: 9,
    satellitePassTime: '2026-09-11 05:40 IST (Cartosat-3)'
  },
  {
    district: 'East Jaintia Hills (NH-6)',
    soilMoisturePercent: 85,
    terrainStabilityScore: 48,
    detectedScarsCount: 6,
    satellitePassTime: '2026-09-11 06:12 IST (RISAT-1A)'
  },
  {
    district: 'East Khasi Hills (Shillong)',
    soilMoisturePercent: 74,
    terrainStabilityScore: 78,
    detectedScarsCount: 2,
    satellitePassTime: '2026-09-11 06:12 IST (RISAT-1A)'
  }
];

export const initialGSISusceptibility: GSISusceptibilityFeed[] = [
  {
    zoneId: 'GSI-SKM-Z1',
    corridor: 'NH-10 (Sevoke to Rangpo)',
    hazardClass: 'VERY_HIGH',
    lithologyType: 'Daling Phyllite & Schist (Highly Fractured)',
    activeFaultProximityKm: 1.8
  },
  {
    zoneId: 'GSI-SKM-Z2',
    corridor: 'NH-310A (Mangan - Chungthang)',
    hazardClass: 'VERY_HIGH',
    lithologyType: 'Chungthang Gneissic Colluvium',
    activeFaultProximityKm: 0.9
  },
  {
    zoneId: 'GSI-MEG-Z1',
    corridor: 'NH-6 (Sonapur Tunnel Section)',
    hazardClass: 'HIGH',
    lithologyType: 'Shale & Sandstone Interbedded (Water Sensitive)',
    activeFaultProximityKm: 3.4
  },
  {
    zoneId: 'GSI-MEG-Z2',
    corridor: 'NH-6 (Guwahati to Shillong)',
    hazardClass: 'LOW',
    lithologyType: 'Granite Pluton / Stable Bedrock',
    activeFaultProximityKm: 18.2
  }
];

export const initialCWCFeeds: CWCFloodFeed[] = [
  {
    stationName: 'Teesta Sevoke Bridge',
    river: 'Teesta River',
    currentWaterLevelM: 114.8,
    warningLevelM: 113.5,
    dangerLevelM: 114.2,
    status: 'ABOVE_DANGER',
    trend: 'RISING'
  },
  {
    stationName: 'Teesta Singtam Gauge',
    river: 'Teesta River',
    currentWaterLevelM: 352.4,
    warningLevelM: 351.0,
    dangerLevelM: 352.0,
    status: 'ABOVE_DANGER',
    trend: 'RISING'
  },
  {
    stationName: 'Barak Annapurna Ghat',
    river: 'Barak River (Silchar)',
    currentWaterLevelM: 19.45,
    warningLevelM: 19.8,
    dangerLevelM: 20.3,
    status: 'NORMAL',
    trend: 'STEADY'
  },
  {
    stationName: 'Brahmaputra Guwahati DC Court',
    river: 'Brahmaputra River',
    currentWaterLevelM: 48.9,
    warningLevelM: 49.68,
    dangerLevelM: 50.5,
    status: 'NORMAL',
    trend: 'STEADY'
  }
];

export const initialFieldReports: FieldReport[] = [
  {
    id: 'rep_001',
    timestamp: '2026-09-11 08:45 IST',
    authorName: 'Sonam Dorjee Bhutia',
    authorPhone: '+91 94340 XXXXX',
    role: 'FIELD_OFFICER',
    category: 'LANDSLIDE',
    severity: 'CRITICAL',
    description: 'Fresh slide active at 29th Mile. Large boulders blocking entire carriage-way. Teesta bank erosion encroaching road foundation.',
    coordinates: { lat: 26.985, lng: 88.502 },
    nearestSegmentId: 'seg_nh10_sevoke_rangpo',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    audioNoteDurationSec: 24,
    status: 'VERIFIED',
    confidenceScore: 96,
    isDuplicateFlagged: false,
    verifiedBy: 'Er. R. Sharma (PWD Inspection Cell)',
    offlineSynced: true
  },
  {
    id: 'rep_002',
    timestamp: '2026-09-11 07:15 IST',
    authorName: 'Mukul Kalita',
    authorPhone: '+91 98640 XXXXX',
    role: 'TRANSPORTER',
    category: 'ROAD_SUBSIDENCE',
    severity: 'HIGH',
    description: 'Road sinking 1.5 feet near Dikchu bend. Heavy trucks cannot pass without scraping chassis. Single light vehicle queue.',
    coordinates: { lat: 27.362, lng: 88.519 },
    nearestSegmentId: 'seg_sh31_singtam_mangan',
    photoUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=600&auto=format&fit=crop&q=80',
    status: 'VERIFIED',
    confidenceScore: 89,
    isDuplicateFlagged: false,
    verifiedBy: 'Sikkim Police Traffic Control',
    offlineSynced: true
  },
  {
    id: 'rep_003',
    timestamp: '2026-09-11 09:10 IST',
    authorName: 'Banrishisha Marbaniang',
    authorPhone: '+91 97740 XXXXX',
    role: 'CITIZEN',
    category: 'FLASH_FLOOD',
    severity: 'MEDIUM',
    description: 'Mud and water pouring down hillside before Sonapur tunnel. Visibility under 20 meters. Vehicles crawling at 5 km/h.',
    coordinates: { lat: 25.135, lng: 92.485 },
    nearestSegmentId: 'seg_nh6_jowai_khliehriat_silchar',
    status: 'PENDING_MODERATION',
    confidenceScore: 78,
    isDuplicateFlagged: false,
    offlineSynced: false
  },
  {
    id: 'rep_004',
    timestamp: '2026-09-11 09:25 IST',
    authorName: 'Citizen Volunteer 04',
    role: 'CITIZEN',
    category: 'LANDSLIDE',
    severity: 'HIGH',
    description: 'Rocks rolling on road near 29th mile again. Traffic halted.',
    coordinates: { lat: 26.983, lng: 88.504 },
    nearestSegmentId: 'seg_nh10_sevoke_rangpo',
    status: 'PENDING_MODERATION',
    confidenceScore: 65,
    isDuplicateFlagged: true, // flagged duplicate of rep_001
    offlineSynced: true
  }
];

export const initialTrackedShipments: TrackedShipment[] = [
  {
    id: 'ship_01',
    vehicleNumber: 'SK-01-D-4412',
    driverName: 'Tashi Tshering Lepcha',
    driverPhone: '+91 98320 11982',
    commodity: 'MEDICINE',
    cargoDescription: 'Emergency Insulin, Rabies Vaccines & Anti-Venom Vials (Cold Chain)',
    cargoWeightTonnes: 3.2,
    isTemperatureSensitive: true,
    originNodeId: 'node_siliguri',
    destinationNodeId: 'node_gangtok',
    currentLat: 27.112,
    currentLng: 88.594,
    headingDeg: 340,
    speedKmh: 34,
    status: 'IN_TRANSIT',
    departedAt: '06:30 IST',
    plannedEta: '10:45 IST (Rerouted via NH-717A)',
    estimatedDelayMinutes: 35,
    currentSegmentId: 'seg_nh717a_sevoke_lava_rangpo',
    recentPings: [
      { lat: 26.8833, lng: 88.4719, time: '07:05 IST' },
      { lat: 27.01, lng: 88.55, time: '07:50 IST' },
      { lat: 27.112, lng: 88.594, time: '08:40 IST' }
    ]
  },
  {
    id: 'ship_02',
    vehicleNumber: 'AS-01-LC-9102',
    driverName: 'Bipul Borah',
    driverPhone: '+91 94350 44211',
    commodity: 'FOOD',
    cargoDescription: 'PDS Rice & Fortified Wheat Flour for Mangan Sub-Division',
    cargoWeightTonnes: 12.0,
    originNodeId: 'node_siliguri',
    destinationNodeId: 'node_mangan',
    currentLat: 27.2344,
    currentLng: 88.4975,
    headingDeg: 20,
    speedKmh: 0,
    status: 'DELAYED',
    departedAt: '05:00 IST',
    plannedEta: '10:00 IST',
    estimatedDelayMinutes: 110,
    currentSegmentId: 'seg_sh31_singtam_mangan',
    recentPings: [
      { lat: 26.7271, lng: 88.4316, time: '05:00 IST' },
      { lat: 27.1767, lng: 88.5283, time: '07:45 IST' },
      { lat: 27.2344, lng: 88.4975, time: '08:30 IST' }
    ]
  },
  {
    id: 'ship_03',
    vehicleNumber: 'ML-05-G-8219',
    driverName: 'Ksanborlang Nongrum',
    driverPhone: '+91 98630 77312',
    commodity: 'CONSTRUCTION',
    cargoDescription: 'Prefab Bailey Bridge steel transoms & wire rope coils',
    cargoWeightTonnes: 16.5,
    originNodeId: 'node_guwahati',
    destinationNodeId: 'node_shillong',
    currentLat: 25.75,
    currentLng: 91.9,
    headingDeg: 195,
    speedKmh: 48,
    status: 'IN_TRANSIT',
    departedAt: '07:45 IST',
    plannedEta: '10:30 IST',
    estimatedDelayMinutes: 0,
    currentSegmentId: 'seg_nh6_nongpoh_shillong',
    recentPings: [
      { lat: 26.1445, lng: 91.7362, time: '07:45 IST' },
      { lat: 25.9038, lng: 91.8797, time: '08:35 IST' },
      { lat: 25.75, lng: 91.9, time: '09:05 IST' }
    ]
  },
  {
    id: 'ship_04',
    vehicleNumber: 'AS-11-BC-6301',
    driverName: 'Nurul Islam Laskar',
    driverPhone: '+91 94351 90812',
    commodity: 'AGRICULTURE',
    cargoDescription: 'Perishable Pineapples & Arecanut consignment for Guwahati Wholesale Mandi',
    cargoWeightTonnes: 7.8,
    originNodeId: 'node_silchar',
    destinationNodeId: 'node_guwahati',
    currentLat: 25.3587,
    currentLng: 92.3614,
    headingDeg: 310,
    speedKmh: 18,
    status: 'DELAYED',
    departedAt: '04:30 IST',
    plannedEta: '12:00 IST',
    estimatedDelayMinutes: 75,
    currentSegmentId: 'seg_nh6_jowai_khliehriat_silchar',
    recentPings: [
      { lat: 24.8333, lng: 92.7789, time: '04:30 IST' },
      { lat: 25.12, lng: 92.48, time: '06:50 IST' },
      { lat: 25.3587, lng: 92.3614, time: '08:55 IST' }
    ]
  },
  {
    id: 'ship_05',
    vehicleNumber: 'ML-04-E-1049',
    driverName: 'Phrangki Dkhar',
    driverPhone: '+91 97741 23091',
    commodity: 'MEDICINE',
    cargoDescription: 'Pediatric Antibiotics & ORS Cartons for Cherrapunji CHC',
    cargoWeightTonnes: 2.1,
    originNodeId: 'node_shillong',
    destinationNodeId: 'node_cherrapunji',
    currentLat: 25.45,
    currentLng: 91.8,
    headingDeg: 215,
    speedKmh: 28,
    status: 'IN_TRANSIT',
    departedAt: '08:15 IST',
    plannedEta: '10:15 IST',
    estimatedDelayMinutes: 20,
    currentSegmentId: 'seg_sh5_shillong_cherrapunji',
    recentPings: [
      { lat: 25.5788, lng: 91.8933, time: '08:15 IST' },
      { lat: 25.45, lng: 91.8, time: '09:00 IST' }
    ]
  }
];

export const initialAlerts: AlertNotification[] = [
  {
    id: 'alt_01',
    timestamp: '08:35 IST',
    title: 'EMERGENCY: NH-10 Closed at 29th Mile',
    message: 'Active landslide & Teesta river surge. All Siliguri-Gangtok traffic strictly diverted via NH-717A (Lava-Algarah). Heavy delays expected.',
    severity: 'DANGER',
    channels: ['PUSH', 'SMS', 'IVR'],
    targetCorridor: 'NH-10 (Sevoke-Rangpo)',
    affectedShipmentCount: 6,
    deliverySuccessRate: 98.4
  },
  {
    id: 'alt_02',
    timestamp: '07:20 IST',
    title: 'CAUTION: NH-6 Sonapur Sludge Hazard',
    message: 'Heavy rain causing mud run-off at Sonapur Tunnel mouth. Single lane movement with 45-60 min transit delay.',
    severity: 'WARNING',
    channels: ['PUSH', 'SMS'],
    targetCorridor: 'NH-6 (Jowai-Silchar)',
    affectedShipmentCount: 4,
    deliverySuccessRate: 95.8
  },
  {
    id: 'alt_03',
    timestamp: '06:30 IST',
    title: 'WEATHER: Red Alert for Mangan & Cherrapunji',
    message: 'IMD forecasts extremely heavy rainfall >100mm. Essential cargo convoys advised to transit before 14:00 IST.',
    severity: 'WARNING',
    channels: ['PUSH', 'SMS', 'IVR'],
    targetCorridor: 'Sikkim & East Khasi Hills',
    affectedShipmentCount: 9,
    deliverySuccessRate: 99.1
  }
];

export const initialGraphVersions: BaseGraphVersion[] = [
  {
    version: 'v1.2-Monsoon-Active',
    date: '2026-09-10 18:00 IST',
    author: 'Chief Engineer (GIS), PWD Gangtok',
    totalSegments: 12,
    changeDescription: 'Added NH-717A bypass connector node at Algarah-Lava; revised slope angles from updated LiDAR survey.'
  },
  {
    version: 'v1.1-Pre-Monsoon',
    date: '2026-05-15 11:30 IST',
    author: 'GIS Cell, NEC Shillong',
    totalSegments: 10,
    changeDescription: 'Incorporated GSI 2026 landslide susceptibility index layers for Teesta & Barak river basins.'
  },
  {
    version: 'v1.0-Baseline',
    date: '2026-01-20 10:00 IST',
    author: 'National Informatics Centre (NIC) NER',
    totalSegments: 8,
    changeDescription: 'Initial base graph digitization of 3 pilot districts (East Sikkim, North Sikkim, East Khasi Hills).'
  }
];

export const mockDistrictMetrics: DistrictAccessibilityMetric[] = [
  {
    districtId: 'dist_mangan',
    districtName: 'Mangan (North Sikkim)',
    state: 'Sikkim',
    connectivityIndexPercent: 42,
    disruptedPopulation: 38500,
    averageDelayToEssentialSuppliesHours: 5.5,
    isolatedVillagesCount: 9,
    criticalMedicineStockDays: 4,
    foodGrainStockDays: 9,
    activeReliefCamps: 3
  },
  {
    districtId: 'dist_east_sikkim',
    districtName: 'Gangtok & Pakyong',
    state: 'Sikkim',
    connectivityIndexPercent: 78,
    disruptedPopulation: 14200,
    averageDelayToEssentialSuppliesHours: 2.1,
    isolatedVillagesCount: 2,
    criticalMedicineStockDays: 14,
    foodGrainStockDays: 21,
    activeReliefCamps: 1
  },
  {
    districtId: 'dist_east_khasi',
    districtName: 'East Khasi Hills (Shillong)',
    state: 'Meghalaya',
    connectivityIndexPercent: 88,
    disruptedPopulation: 5600,
    averageDelayToEssentialSuppliesHours: 0.8,
    isolatedVillagesCount: 1,
    criticalMedicineStockDays: 28,
    foodGrainStockDays: 35,
    activeReliefCamps: 0
  },
  {
    districtId: 'dist_east_jaintia',
    districtName: 'East Jaintia Hills (Khliehriat)',
    state: 'Meghalaya',
    connectivityIndexPercent: 63,
    disruptedPopulation: 22000,
    averageDelayToEssentialSuppliesHours: 3.2,
    isolatedVillagesCount: 4,
    criticalMedicineStockDays: 7,
    foodGrainStockDays: 12,
    activeReliefCamps: 2
  },
  {
    districtId: 'dist_cachar',
    districtName: 'Cachar (Barak Valley Gateway)',
    state: 'Assam',
    connectivityIndexPercent: 71,
    disruptedPopulation: 18400,
    averageDelayToEssentialSuppliesHours: 2.8,
    isolatedVillagesCount: 3,
    criticalMedicineStockDays: 11,
    foodGrainStockDays: 16,
    activeReliefCamps: 1
  }
];

export const mockInterstateProtocols: InterstateCoordinationProtocol[] = [
  {
    id: 'proto_wb_skm_01',
    corridorName: 'NH-10 Siliguri - Sevoke - Rangpo - Gangtok',
    participatingStates: ['West Bengal', 'Sikkim'],
    jointTaskForceAgency: 'Border Roads Organisation (BRO Project Swastik) & PWD NH Division',
    designatedNodalOfficer: 'Superintending Engineer, PWD Kalimpong / Gangtok SE',
    agreedSOP: 'Automated reciprocal transit clearance; during NH-10 closures at 29th Mile, Kalimpong district administration diverts heavy freight via NH-717A (Lava-Reshi). Single window convoy management.',
    lastSyncTimestamp: '2026-09-11 08:30 IST',
    status: 'ACTIVE'
  },
  {
    id: 'proto_asm_meg_02',
    corridorName: 'NH-6 Guwahati - Shillong - Jowai - Silchar',
    participatingStates: ['Assam', 'Meghalaya'],
    jointTaskForceAgency: 'NHIDCL Regional Office Guwahati & Meghalaya State Police Traffic Cell',
    designatedNodalOfficer: 'Deputy Commissioner, East Jaintia Hills & DC Cachar',
    agreedSOP: 'Heavy multi-axle freight restrictions during heavy rainfall (>60mm/6h) at Sonapur Tunnel. 24/7 dedicated heavy recovery crane stationed at Umkiang border outpost with shared emergency fuel reserves.',
    lastSyncTimestamp: '2026-09-11 07:15 IST',
    status: 'MUTUAL_ACKNOWLEDGED'
  }
];

export const mockDisasterAuditReports: DisasterAuditReport[] = [
  {
    id: 'AUDIT-2026-SKM-04',
    date: '2026-08-28',
    title: 'Teesta Surge & 29th Mile Road Bed Collapse Post-Mortem',
    corridorAffected: 'NH-10 (Sevoke - Rangpo Km 29)',
    disruptionDurationHours: 72,
    delayedShipmentsCount: 34,
    estimatedDelayHoursTotal: 186,
    timeline: [
      { time: 'Day 1 02:30 IST', event: 'IMD red alert issued for Upper Teesta basin (>110mm rainfall in 6h).' },
      { time: 'Day 1 04:15 IST', event: 'Model predicted 96/100 risk score on NH-10; early warning SMS sent to 12 registered fleet convoys.' },
      { time: 'Day 1 05:40 IST', event: 'Landslide breached 120 meters of carriageway at 29th Mile. Field report geo-verified by PWD junior engineer.' },
      { time: 'Day 1 06:10 IST', event: 'Joint Interstate Protocol activated; all traffic diverted to NH-717A before Sevoke bottleneck.' },
      { time: 'Day 3 14:00 IST', event: 'BRO Swastik completed bench cutting and opened single lane regulated traffic.' }
    ],
    keyLearnings: 'Early routing diversion via NH-717A averted severe congestion of 80+ vehicles at Sevoke bottleneck. Cold-chain medicine shipment SK-01-D-4412 reached STNM Hospital Gangtok without vaccine spoilage.'
  },
  {
    id: 'AUDIT-2026-MEG-02',
    date: '2026-07-14',
    title: 'Sonapur Mudslide Flash Closure on NH-6',
    corridorAffected: 'NH-6 (Jowai - Silchar Lifeline)',
    disruptionDurationHours: 18,
    delayedShipmentsCount: 19,
    estimatedDelayHoursTotal: 58,
    timeline: [
      { time: '14:00 IST', event: 'Mud-flow inundated Sonapur Tunnel bypass approach.' },
      { time: '14:20 IST', event: 'Automated CWC water level alert triggered route warning on driver dashboards.' },
      { time: '18:45 IST', event: 'Emergency earthmover deployed by NHIDCL cleared 400 cubic meters of sludge.' },
      { time: '08:00 IST', event: 'Corridor restored to normal traffic under restricted speed.' }
    ],
    keyLearnings: 'Stationing excavator teams at Sonapur tunnel during June-September reduced clearance downtime from 48 hours to 18 hours.'
  }
];

// Aliases for seamless imports
export const mockNodes = initialNodes;
export const mockSegments = initialRoadSegments;
export const mockShipments = initialTrackedShipments;
export const mockFieldReports = initialFieldReports;
export const mockWeatherFeeds = initialIMDFeeds;
export const mockBhuvanFeeds = initialBhuvanFeeds;
export const mockGsiFeeds = initialGSISusceptibility;
export const mockCwcFeeds = initialCWCFeeds;
export const mockBaseGraphVersions = initialGraphVersions;

