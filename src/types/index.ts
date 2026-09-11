export type PersonaType =
  | 'sdma_ndma'
  | 'pwd_official'
  | 'transporter'
  | 'field_officer'
  | 'citizen'
  | 'logistics_coord';

export type SupportedLanguage = 'en' | 'as' | 'bn' | 'hi' | 'kha';

export type NavigationTab =
  | 'gis-map'
  | 'phase1-graph'
  | 'phase2-reports'
  | 'phase3-predictive'
  | 'phase4-routing'
  | 'phase5-fleet'
  | 'phase6-command';

export type RoadCondition = 'OPEN' | 'AT_RISK' | 'RESTRICTED' | 'BLOCKED';

export type SurfaceType = 'BITUMINOUS' | 'CONCRETE' | 'GRAVEL' | 'EARTHEN';

export type CommodityCategory = 'MEDICINE' | 'FOOD' | 'CONSTRUCTION' | 'AGRICULTURE';
export type CommodityType = CommodityCategory;

export type GeofenceStatus = 'DEPARTED' | 'IN_TRANSIT' | 'DELAYED' | 'ARRIVED';
export type ShipmentStatus = GeofenceStatus;

export type ReportCategory =
  | 'LANDSLIDE'
  | 'FLASH_FLOOD'
  | 'ROAD_SUBSIDENCE'
  | 'BRIDGE_DAMAGE'
  | 'SEVERE_CONGESTION';

export interface GeoCoordinate {
  lat: number;
  lng: number;
  label?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  isHub: boolean;
  populationServed?: number;
}

export interface RiskFactorBreakdown {
  rainfallContribution: number; // 0-100 normalized pts
  slopeContribution: number;
  gsiSusceptibilityContribution: number;
  historicalDisruptionContribution: number;
  fieldReportContribution: number;
  totalScore: number;
  primaryCause: string;
}

export interface AuthorityOverride {
  isOverridden: boolean;
  overriddenStatus: RoadCondition;
  officialName: string;
  department: string;
  orderNumber: string;
  reason: string;
  timestamp: string;
}

export interface RoadSegment {
  id: string;
  name: string; // e.g., "NH-10 (Sevoke to Rangpo Km 14-38)"
  highwayCode: string; // "NH-10", "NH-717A", "NH-6", etc.
  fromNodeId: string;
  toNodeId: string;
  lengthKm: number;
  surfaceType: SurfaceType;
  widthMeters: number;
  averageElevationMeters: number;
  slopeAngleDeg: number;
  riverProximityMeters: number;
  historicalDisruptionCount: number;
  currentCondition: RoadCondition;
  riskScore: number; // 0-100
  riskFactors: RiskFactorBreakdown;
  authorityOverride?: AuthorityOverride;
  coordinates: [number, number][]; // polyline [lat, lng]
  lastUpdated: string;
  isEmergencyCorridor: boolean;
  estimatedClearanceTimeHours?: number;
}

export interface IMDWeatherFeed {
  stationId: string;
  location: string;
  rainfall6hMm: number;
  alertLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  forecast24h: string;
  windSpeedKmh: number;
  cloudburstRisk: boolean;
  lastSync: string;
}

export interface ISROBhuvanFeed {
  district: string;
  soilMoisturePercent: number;
  terrainStabilityScore: number; // 0-100
  detectedScarsCount: number;
  satellitePassTime: string;
}

export interface GSISusceptibilityFeed {
  zoneId: string;
  corridor: string;
  hazardClass: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  lithologyType: string;
  activeFaultProximityKm: number;
}

export interface CWCFloodFeed {
  stationName: string;
  river: string;
  currentWaterLevelM: number;
  warningLevelM: number;
  dangerLevelM: number;
  status: 'NORMAL' | 'ABOVE_WARNING' | 'ABOVE_DANGER';
  trend: 'RISING' | 'STEADY' | 'FALLING';
}

export interface FieldReport {
  id: string;
  timestamp: string;
  authorName: string;
  authorPhone?: string;
  role: 'FIELD_OFFICER' | 'CITIZEN' | 'TRANSPORTER';
  category: ReportCategory;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  coordinates: { lat: number; lng: number };
  nearestSegmentId: string;
  photoUrl?: string;
  audioNoteDurationSec?: number;
  status: 'PENDING_MODERATION' | 'VERIFIED' | 'DISMISSED';
  confidenceScore: number; // 0-100
  isDuplicateFlagged: boolean;
  verifiedBy?: string;
  offlineSynced: boolean;
}

export interface RouteOption {
  id: string;
  title: string; // e.g. "Direct via NH-10 (High Risk)", "Alternate via NH-717A (Recommended)"
  isRecommended: boolean;
  isBlocked: boolean;
  pathSegmentIds: string[];
  totalDistanceKm: number;
  standardDurationMin: number;
  estimatedDelayMin: number;
  totalEstimatedTimeMin: number;
  averageRiskScore: number;
  maxSegmentRisk: number;
  criticalSegments: string[];
  safetyMarginPercentage: number;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'DANGER';
  channels: ('PUSH' | 'SMS' | 'IVR')[];
  targetCorridor: string;
  affectedShipmentCount: number;
  deliverySuccessRate: number;
}

export interface TrackedShipment {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  commodity: CommodityCategory;
  cargoDescription: string;
  cargoWeightTonnes: number;
  isTemperatureSensitive?: boolean;
  originNodeId: string;
  destinationNodeId: string;
  currentLat: number;
  currentLng: number;
  headingDeg: number;
  speedKmh: number;
  status: GeofenceStatus;
  departedAt: string;
  plannedEta: string;
  estimatedDelayMinutes: number;
  assignedRouteTitle?: string;
  currentSegmentId: string;
  recentPings: { lat: number; lng: number; time: string }[];
}

export interface BaseGraphVersion {
  version: string;
  date: string;
  author: string;
  totalSegments: number;
  changeDescription: string;
}

export interface DistrictAccessibilityMetric {
  districtId: string;
  districtName: string;
  state: string;
  connectivityIndexPercent: number; // 0-100
  disruptedPopulation: number;
  averageDelayToEssentialSuppliesHours: number;
  isolatedVillagesCount: number;
  criticalMedicineStockDays: number;
  foodGrainStockDays: number;
  activeReliefCamps: number;
}

export interface InterstateCoordinationProtocol {
  id: string;
  corridorName: string;
  participatingStates: string[];
  jointTaskForceAgency: string;
  designatedNodalOfficer: string;
  agreedSOP: string;
  lastSyncTimestamp: string;
  status: 'ACTIVE' | 'MUTUAL_ACKNOWLEDGED' | 'ESCALATED';
}

export interface DisasterAuditReport {
  id: string;
  date: string;
  title: string;
  corridorAffected: string;
  disruptionDurationHours: number;
  delayedShipmentsCount: number;
  estimatedDelayHoursTotal: number;
  timeline: { time: string; event: string }[];
  keyLearnings: string;
}

