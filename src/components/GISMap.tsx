import React, { useState, useRef, useEffect } from 'react';
import { GoogleMapView } from './GoogleMapView';
import {
  GraphNode,
  RoadSegment,
  TrackedShipment,
  FieldReport,
  CWCFloodFeed,
  IMDWeatherFeed,
  RouteOption,
  PersonaType,
  SupportedLanguage
} from '../types';
import { translations } from '../services/i18n';
import {
  AlertTriangle,
  CloudRain,
  Mountain,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Truck,
  Compass,
  FileText,
  Clock,
  Droplets,
  ShieldAlert,
  Crosshair,
  Activity,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

import { ErrorBoundary } from './ErrorBoundary';
import {
  mountainPeaks,
  mountainPasses,
  riverSystems,
  waterBodies,
  regionBoundaries,
  hazardHotspots,
  strategicCorridors,
  MountainPeak,
  MountainPass,
  HazardHotspot,
  WaterBody
} from '../data/gisGeoData';

interface GISMapProps {
  nodes: GraphNode[];
  segments: RoadSegment[];
  shipments: TrackedShipment[];
  fieldReports: FieldReport[];
  cwcFeeds: CWCFloodFeed[];
  weatherFeeds: IMDWeatherFeed[];
  activeRouteOption: RouteOption | null;
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string | null) => void;
  selectedShipmentId: string | null;
  onSelectShipment: (shipmentId: string | null) => void;
  currentPersona: PersonaType;
  currentLanguage: SupportedLanguage;
  onPlanRouteForSegment?: (seg: RoadSegment) => void;
}

export const GISMap: React.FC<GISMapProps> = ({
  nodes,
  segments,
  shipments,
  fieldReports,
  cwcFeeds,
  weatherFeeds,
  activeRouteOption,
  selectedSegmentId,
  onSelectSegment,
  selectedShipmentId,
  onSelectShipment,
  currentPersona,
  currentLanguage,
  onPlanRouteForSegment
}) => {
  const t = translations[currentLanguage];

  // Engine Mode: 'vector' (Offline High-Detail Vector GIS) or 'google' (Google Maps Platform)
  const [engineMode, setEngineMode] = useState<'google' | 'vector'>('vector');

  // Floating Layer Control Panel State
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);

  // Map layer toggles - specifically requested: 'Disaster Risk', 'Weather Feeds', and 'Active Shipments'
  const [showDisasterRisk, setShowDisasterRisk] = useState(true);
  const [showWeatherFeeds, setShowWeatherFeeds] = useState(true);
  const [showActiveShipments, setShowActiveShipments] = useState(true);

  // Additional Operational & Cartographic Layers
  const [showFloodGauges, setShowFloodGauges] = useState(true);
  const [showRoadCorridors, setShowRoadCorridors] = useState(true);
  const [showFieldReports, setShowFieldReports] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showPeaksAndPasses, setShowPeaksAndPasses] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showGraticule, setShowGraticule] = useState(true);

  // Map visual style: 'topo' | 'satellite' | 'dark' | 'carto'
  const [mapStyle, setMapStyle] = useState<'topo' | 'satellite' | 'dark' | 'carto'>('topo');

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Real-time cursor coordinates and geography telemetry
  const [cursorGeo, setCursorGeo] = useState<{
    lat: number;
    lng: number;
    elevationEstimate: number;
    regionName: string;
  } | null>(null);

  // Selected feature inspector states (aside from segment & shipment)
  const [selectedPeak, setSelectedPeak] = useState<MountainPeak | null>(null);
  const [selectedPass, setSelectedPass] = useState<MountainPass | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<HazardHotspot | null>(null);
  const [selectedGauge, setSelectedGauge] = useState<CWCFloodFeed | null>(null);
  const [selectedWaterBody, setSelectedWaterBody] = useState<WaterBody | null>(null);
  const [selectedWeatherStation, setSelectedWeatherStation] = useState<IMDWeatherFeed | null>(null);

  // Geographic coordinates for IMD Meteorological Stations
  const imdStationLocations: Record<string, { lat: number; lng: number }> = {
    'IMD-SKM-01': { lat: 27.3314, lng: 88.6138 }, // Gangtok Met Station
    'IMD-SKM-02': { lat: 27.5050, lng: 88.5280 }, // Mangan North Sikkim
    'IMD-MEG-01': { lat: 25.2702, lng: 91.7323 }, // Cherrapunji (Sohra)
    'IMD-MEG-02': { lat: 25.5450, lng: 91.8820 }, // Shillong Peak Met
    'IMD-ASM-01': { lat: 26.1061, lng: 91.5859 }, // Guwahati Borjhar Met
    'IMD-BAR-01': { lat: 24.9128, lng: 92.9790 }  // Silchar Airport Met
  };

  // Structured layers list for the floating control panel
  const layersConfig = [
    {
      id: 'disaster-risk',
      name: 'Disaster Risk',
      description: 'GSI Landslide hotspots, sinking zones & hazard impact radii',
      category: 'operational',
      enabled: showDisasterRisk,
      toggle: () => setShowDisasterRisk((prev) => !prev),
      icon: ShieldAlert,
      activeColor: 'bg-rose-500',
      tagColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      count: `${hazardHotspots.length} Zones`
    },
    {
      id: 'weather-feeds',
      name: 'Weather Feeds',
      description: 'IMD Doppler precipitation radar & live Met station observations',
      category: 'operational',
      enabled: showWeatherFeeds,
      toggle: () => setShowWeatherFeeds((prev) => !prev),
      icon: CloudRain,
      activeColor: 'bg-sky-500',
      tagColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
      count: `${weatherFeeds.length} Stations`
    },
    {
      id: 'active-shipments',
      name: 'Active Shipments',
      description: 'GPS telematics, essential supply convoys & speeds',
      category: 'operational',
      enabled: showActiveShipments,
      toggle: () => setShowActiveShipments((prev) => !prev),
      icon: Truck,
      activeColor: 'bg-emerald-500',
      tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      count: `${shipments.length} Convoys`
    },
    {
      id: 'flood-gauges',
      name: 'Flood Feeds (CWC)',
      description: 'River water levels & danger mark telemetry stations',
      category: 'operational',
      enabled: showFloodGauges,
      toggle: () => setShowFloodGauges((prev) => !prev),
      icon: Activity,
      activeColor: 'bg-blue-500',
      tagColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
      count: `${cwcFeeds.length} Gauges`
    },
    {
      id: 'road-corridors',
      name: 'Road Corridors',
      description: 'Highways NH-10, NH-6, NH-717A & detour bypass routes',
      category: 'infrastructure',
      enabled: showRoadCorridors,
      toggle: () => setShowRoadCorridors((prev) => !prev),
      icon: Navigation,
      activeColor: 'bg-teal-500',
      tagColor: 'text-teal-400 bg-teal-950/60 border-teal-800/60',
      count: `${segments.length} Segments`
    },
    {
      id: 'field-reports',
      name: 'Field Reports',
      description: 'Ground obstacle verifications by crowd & police units',
      category: 'infrastructure',
      enabled: showFieldReports,
      toggle: () => setShowFieldReports((prev) => !prev),
      icon: AlertTriangle,
      activeColor: 'bg-amber-500',
      tagColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      count: `${fieldReports.length} Reports`
    },
    {
      id: 'topography-contours',
      name: 'Topography & Elevation',
      description: 'Hypsometric elevation & Great Himalayan glaciated zone',
      category: 'geography',
      enabled: showContours,
      toggle: () => setShowContours((prev) => !prev),
      icon: Mountain,
      activeColor: 'bg-amber-600',
      tagColor: 'text-amber-300 bg-amber-950/60 border-amber-800/60',
      count: '4,000m+ Relief'
    },
    {
      id: 'summits-passes',
      name: 'Summits & Passes',
      description: 'Kangchenjunga (8,586m), Nathu La, Sela Pass',
      category: 'geography',
      enabled: showPeaksAndPasses,
      toggle: () => setShowPeaksAndPasses((prev) => !prev),
      icon: Compass,
      activeColor: 'bg-yellow-500',
      tagColor: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/60',
      count: `${mountainPeaks.length + mountainPasses.length} Landmarks`
    },
    {
      id: 'rivers-lakes',
      name: 'Rivers & Water Bodies',
      description: 'Teesta, Brahmaputra, Barak systems & reservoirs',
      category: 'geography',
      enabled: showRivers,
      toggle: () => setShowRivers((prev) => !prev),
      icon: Droplets,
      activeColor: 'bg-cyan-500',
      tagColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
      count: `${riverSystems.length + waterBodies.length} Hydrologic`
    },
    {
      id: 'boundaries-grid',
      name: 'Boundaries & Graticule',
      description: 'State borders, international boundaries & lat/lng grid',
      category: 'geography',
      enabled: showBoundaries,
      toggle: () => {
        const next = !showBoundaries;
        setShowBoundaries(next);
        setShowGraticule(next);
      },
      icon: Layers,
      activeColor: 'bg-purple-500',
      tagColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
      count: 'Admin / Grid'
    }
  ];

  const activeLayersCount = layersConfig.filter((l) => l.enabled).length;

  const handleToggleAll = (enable: boolean) => {
    setShowDisasterRisk(enable);
    setShowWeatherFeeds(enable);
    setShowActiveShipments(enable);
    setShowFloodGauges(enable);
    setShowRoadCorridors(enable);
    setShowFieldReports(enable);
    setShowContours(enable);
    setShowRivers(enable);
    setShowPeaksAndPasses(enable);
    setShowBoundaries(enable);
    setShowGraticule(enable);
  };

  const handleOperationalPreset = () => {
    setShowDisasterRisk(true);
    setShowWeatherFeeds(true);
    setShowActiveShipments(true);
    setShowFloodGauges(true);
    setShowRoadCorridors(true);
    setShowFieldReports(true);
    setShowContours(false);
    setShowRivers(true);
    setShowPeaksAndPasses(false);
    setShowBoundaries(true);
    setShowGraticule(false);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // Map coordinate bounds for NER (North Eastern Region of India)
  // Coverage: 88.0°E to 93.2°E longitude, 24.5°N to 28.2°N latitude
  const minLng = 88.0;
  const maxLng = 93.2;
  const minLat = 24.5;
  const maxLat = 28.2;

  // SVG viewBox dimensions
  const svgWidth = 980;
  const svgHeight = 640;

  // Geographic projection helper (lat/lng to SVG x/y)
  const project = (lat: number, lng: number): [number, number] => {
    const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
    const y = ((maxLat - lat) / (maxLat - minLat)) * svgHeight;
    return [x, y];
  };

  // Inverse projection (SVG x/y to lat/lng)
  const unproject = (x: number, y: number): [number, number] => {
    const lng = minLng + (x / svgWidth) * (maxLng - minLng);
    const lat = maxLat - (y / svgHeight) * (maxLat - minLat);
    return [lat, lng];
  };

  // Quick corridor zoom presets
  const focusCorridor = (preset: 'all' | 'sikkim' | 'meghalaya' | 'assam' | 'silchar') => {
    // Clear selections
    setSelectedPeak(null);
    setSelectedPass(null);
    setSelectedHazard(null);
    setSelectedGauge(null);

    if (preset === 'all') {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    } else if (preset === 'sikkim') {
      setZoomLevel(2.5);
      setPanOffset({ x: 380, y: 320 });
    } else if (preset === 'meghalaya') {
      setZoomLevel(2.4);
      setPanOffset({ x: -280, y: -40 });
    } else if (preset === 'assam') {
      setZoomLevel(2.2);
      setPanOffset({ x: -240, y: 150 });
    } else if (preset === 'silchar') {
      setZoomLevel(2.6);
      setPanOffset({ x: -480, y: -190 });
    }
  };

  // Handlers for mouse drag panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    // Update real-time cursor coordinate telemetry
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      // Inverse map from screen coordinates through panOffset and zoomLevel
      const svgX = (mouseScreenX - panOffset.x) / zoomLevel;
      const svgY = (mouseScreenY - panOffset.y) / zoomLevel;

      if (svgX >= 0 && svgX <= svgWidth && svgY >= 0 && svgY <= svgHeight) {
        const [lat, lng] = unproject(svgX, svgY);

        // Estimate elevation & geographical zone from coordinates
        let elevationEstimate = 120;
        let regionName = 'Brahmaputra Valley (Assam)';

        if (lat > 27.0 && lng < 89.0) {
          regionName = 'Sikkim Himalaya (Teesta Basin)';
          elevationEstimate = Math.round(500 + (lat - 27.0) * 3500 + (88.5 - Math.abs(lng - 88.5)) * 1200);
        } else if (lat >= 25.1 && lat <= 26.0 && lng >= 90.0 && lng <= 92.8) {
          regionName = 'Meghalaya Plateau (Khasi & Jaintia Hills)';
          elevationEstimate = Math.round(900 + (lat - 25.1) * 600);
        } else if (lat < 25.0 && lng >= 92.2) {
          regionName = 'Barak Valley (Cachar / Silchar)';
          elevationEstimate = 45;
        } else if (lat > 27.2 && lng > 91.5) {
          regionName = 'Arunachal Sub-Himalaya (Kameng)';
          elevationEstimate = 2200;
        }

        setCursorGeo({
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
          elevationEstimate: Math.max(30, elevationEstimate),
          regionName
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel-based zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoomLevel((prev) => Math.max(0.75, Math.min(4.8, prev * zoomFactor)));
  };

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId);
  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId);

  // Approximate distance scale calculation (approx 105 km per deg long at 26°N)
  const currentKmPer100Px = Math.round(((100 / (svgWidth * zoomLevel)) * (maxLng - minLng) * 105) / 5) * 5;

  if (engineMode === 'google') {
    return (
      <ErrorBoundary
        fallbackTitle="Google Maps Platform Notice"
        fallbackDescription="The Google Maps component encountered an error or billing limitation (ApiProjectMapError). You can return to the Vector GIS Engine."
        actionButton={
          <button
            onClick={() => setEngineMode('vector')}
            className="px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600 text-emerald-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Switch to Vector GIS</span>
          </button>
        }
        onReset={() => setEngineMode('vector')}
      >
        <GoogleMapView
          nodes={nodes}
          segments={segments}
          shipments={shipments}
          fieldReports={fieldReports}
          cwcFeeds={cwcFeeds}
          weatherFeeds={weatherFeeds}
          activeRouteOption={activeRouteOption}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={onSelectSegment}
          selectedShipmentId={selectedShipmentId}
          onSelectShipment={onSelectShipment}
          currentPersona={currentPersona}
          currentLanguage={currentLanguage}
          onPlanRouteForSegment={onPlanRouteForSegment}
          onSwitchToVectorMap={() => setEngineMode('vector')}
        />
      </ErrorBoundary>
    );
  }

  // Color schemes based on mapStyle
  const bgFill =
    mapStyle === 'topo'
      ? 'url(#topographicShading)'
      : mapStyle === 'satellite'
      ? 'url(#satelliteEarthShading)'
      : mapStyle === 'carto'
      ? '#0f172a'
      : '#030712';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[650px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none"
    >
      {/* Top Map Control Toolbar (Compact & Focused) */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-xs shadow-xl">
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700/80">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200 text-[11px] tracking-wide">VECTOR GIS</span>
        </div>

        {/* Map Style Dropdown */}
        <select
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value as any)}
          aria-label="Map Style"
          className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
        >
          <option value="topo">⛰️ Topographic Relief</option>
          <option value="satellite">🛰️ Satellite Terrain</option>
          <option value="dark">🎯 Tactical Ops</option>
          <option value="carto">📐 Survey Carto</option>
        </select>

        {/* Floating Layer Panel Toggle Button */}
        <button
          id="toggle-floating-layers-btn"
          onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
            isLayersPanelOpen
              ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-sm'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          title="Toggle Floating Data Layers Control Panel"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Data Layers</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
            {activeLayersCount} Active
          </span>
          {isLayersPanelOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </button>

        {/* Engine Switcher to Google Maps */}
        <button
          onClick={() => setEngineMode('google')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] shadow transition-colors"
          title="Switch to Google Maps Platform View"
        >
          <Compass className="w-3 h-3" />
          <span>Google Maps</span>
        </button>
      </div>

      {/* Floating Layer Control Panel (Movable/Docked Overlay) */}
      {isLayersPanelOpen ? (
        <div
          id="gis-floating-layer-panel"
          className="absolute top-14 left-3 z-30 w-72 sm:w-80 max-h-[500px] flex flex-col bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/90 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
        >
          {/* Panel Header */}
          <div className="px-3.5 py-2.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  Layer Control Panel
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-slate-400">Toggle GIS & Operational Feeds</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {activeLayersCount}/{layersConfig.length} Active
              </span>
              <button
                id="close-layers-panel-btn"
                onClick={() => setIsLayersPanelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                title="Minimize Layer Panel"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Presets:</span>
            <div className="flex items-center gap-1">
              <button
                id="preset-ops-focus-btn"
                onClick={handleOperationalPreset}
                className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-medium transition-colors"
                title="Enable Disaster Risk, Weather Feeds, Active Shipments & Corridors"
              >
                Ops Focus
              </button>
              <button
                id="preset-all-on-btn"
                onClick={() => handleToggleAll(true)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
              >
                All On
              </button>
              <button
                id="preset-all-off-btn"
                onClick={() => handleToggleAll(false)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 font-medium transition-colors"
              >
                Hide All
              </button>
            </div>
          </div>

          {/* Layer Items List (Scrollable) */}
          <div className="p-2 space-y-1 overflow-y-auto max-h-[380px]">
            {layersConfig.map((layer) => {
              const IconComp = layer.icon;
              return (
                <div
                  key={layer.id}
                  id={`layer-toggle-card-${layer.id}`}
                  onClick={layer.toggle}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    layer.enabled
                      ? 'bg-slate-800/70 border-slate-700/70 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        layer.enabled ? 'bg-slate-950 border border-slate-700 text-slate-200' : 'bg-slate-950/50 text-slate-500'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-semibold truncate ${layer.enabled ? 'text-slate-100' : 'text-slate-400'}`}>
                          {layer.name}
                        </span>
                        {layer.count && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${layer.tagColor}`}>
                            {layer.count}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                        {layer.description}
                      </p>
                    </div>
                  </div>

                  {/* Switch Toggle Button */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={layer.enabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      layer.toggle();
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      layer.enabled ? layer.activeColor : 'bg-slate-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        layer.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Minimized Floating Pill */
        <button
          id="floating-layers-toggle-pill"
          onClick={() => setIsLayersPanelOpen(true)}
          className="absolute top-14 left-3 z-30 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-xs font-semibold text-slate-200 shadow-xl hover:bg-slate-800 hover:border-emerald-500/60 transition-all group"
          title="Open Data Layers Control Panel"
        >
          <Layers className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>Data Layers</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold">
            {activeLayersCount} Active
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
        </button>
      )}

      {/* Quick Strategic Corridor Presets (Right Top) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 text-xs shadow-xl">
        <span className="text-[10px] text-slate-400 font-semibold px-1 uppercase tracking-wider">
          Corridor Focus:
        </span>
        <button
          onClick={() => focusCorridor('all')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] transition-colors"
        >
          Full NER
        </button>
        <button
          onClick={() => focusCorridor('sikkim')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium text-[11px] transition-colors"
          title="Zoom to NH-10 & NH-717A Sikkim Corridor"
        >
          Sikkim (NH-10)
        </button>
        <button
          onClick={() => focusCorridor('meghalaya')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium text-[11px] transition-colors"
          title="Zoom to NH-6 Shillong & Sonapur Tunnel"
        >
          Meghalaya (NH-6)
        </button>
        <button
          onClick={() => focusCorridor('assam')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium text-[11px] transition-colors"
          title="Zoom to Guwahati Hub & Brahmaputra Corridor"
        >
          Guwahati Hub
        </button>
        <button
          onClick={() => focusCorridor('silchar')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-400 font-medium text-[11px] transition-colors"
          title="Zoom to Barak Valley & Silchar Gateway"
        >
          Barak (Silchar)
        </button>
      </div>

      {/* Zoom / Navigation Controls (Right Middle-Bottom) */}
      <div className="absolute bottom-12 right-4 z-20 flex flex-col gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl text-slate-200">
        <button
          onClick={() => setZoomLevel((z) => Math.min(4.8, z + 0.35))}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.35))}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => focusCorridor('all')}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Full NER View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-800 my-0.5" />
        <button
          onClick={() => setShowGraticule(!showGraticule)}
          className={`p-2 rounded-lg transition-colors ${
            showGraticule ? 'text-emerald-400 bg-emerald-950/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle Lat/Lng Graticule Grid"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend & Scale Bar (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/80 text-[11px] shadow-xl text-slate-300 flex flex-col gap-1.5 max-w-[300px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-slate-200">
          <span>Corridor Status & Relief</span>
          <span className="text-[10px] text-emerald-400 font-mono">Zoom: {zoomLevel.toFixed(1)}x</span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-emerald-500 rounded-sm"></span>
            <span>Open (NH Clear)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-amber-400 rounded-sm"></span>
            <span>At Risk (Score &gt; 60)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-orange-500 rounded-sm"></span>
            <span>Restricted (4x4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-rose-600 rounded-sm"></span>
            <span>Blocked / Divert</span>
          </div>
        </div>

        {activeRouteOption && (
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[10px] pt-1 border-t border-slate-800">
            <span className="w-3 h-1.5 bg-cyan-400 border border-white rounded-sm animate-pulse"></span>
            <span>Active Alternate Route Overlay</span>
          </div>
        )}

        {/* Dynamic Distance Scale Bar */}
        <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Scale:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1 bg-slate-400 rounded-full relative">
              <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-white"></div>
            </div>
            <span>~{currentKmPer100Px} km</span>
          </div>
        </div>
      </div>

      {/* Real-time Cursor Coordinates HUD (Bottom Center) */}
      {cursorGeo && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/80 text-[10px] text-slate-300 font-mono shadow-lg flex items-center gap-2 pointer-events-none">
          <span className="text-emerald-400 flex items-center gap-1">
            <Crosshair className="w-3 h-3" />
            {cursorGeo.lat}°N, {cursorGeo.lng}°E
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-amber-400">~{cursorGeo.elevationEstimate}m MSL</span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-200">{cursorGeo.regionName}</span>
        </div>
      )}

      {/* Main Interactive SVG Map Canvas */}
      <div
        className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Topographic & Environmental Defs */}
          <defs>
            {/* Topographic Relief Shading */}
            <radialGradient id="topographicShading" cx="20%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="35%" stopColor="#0f172a" />
              <stop offset="70%" stopColor="#09101d" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Satellite Earth Shading */}
            <radialGradient id="satelliteEarthShading" cx="25%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#1c2826" />
              <stop offset="40%" stopColor="#0c1e1c" />
              <stop offset="70%" stopColor="#071518" />
              <stop offset="100%" stopColor="#02080a" />
            </radialGradient>

            {/* River Shading Gradients */}
            <linearGradient id="teestaGrad" x1="0%" y1="0%" x2="40%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.7" />
            </linearGradient>

            <linearGradient id="brahmaputraGrad" x1="0%" y1="0%" x2="100%" y2="40%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0369a1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0.7" />
            </linearGradient>

            <linearGradient id="barakGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.7" />
            </linearGradient>

            {/* Glowing Effect for Active Alternatives */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Landslide Hazard Hatching Pattern */}
            <pattern id="hazardStripe" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#f43f5e" strokeWidth="2.5" opacity="0.4" />
            </pattern>
          </defs>

          {/* Base Background Rectangle */}
          <rect width={svgWidth} height={svgHeight} fill={bgFill} />

          {/* 1. Graticule Grid (Latitude / Longitude Coordinates) */}
          {showGraticule && (
            <g opacity="0.18">
              {[25.0, 26.0, 27.0, 28.0].map((lat) => {
                const [, y] = project(lat, minLng);
                return (
                  <g key={`lat_${lat}`}>
                    <line x1="0" y1={y} x2={svgWidth} y2={y} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 5" />
                    <text x="12" y={y - 4} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                      {lat.toFixed(1)}°N
                    </text>
                  </g>
                );
              })}
              {[88.5, 89.5, 90.5, 91.5, 92.5].map((lng) => {
                const [x] = project(minLat, lng);
                return (
                  <g key={`lng_${lng}`}>
                    <line x1={x} y1="0" x2={x} y2={svgHeight} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 5" />
                    <text x={x + 4} y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                      {lng.toFixed(1)}°E
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 2. Topographic Elevation Ridges & Contours (Sikkim, Shillong, Kameng) */}
          {showContours && (
            <g className="transition-opacity">
              {/* Alpine Himalayan Zone (4,000m+ Kangchenjunga Massif & North Sikkim) */}
              <path
                d={`M ${project(28.1, 88.0)[0]} ${project(28.1, 88.0)[1]}
                   Q ${project(27.9, 88.3)[0]} ${project(27.9, 88.3)[1]} ${project(27.7, 88.6)[0]} ${project(27.7, 88.6)[1]}
                   T ${project(27.8, 88.9)[0]} ${project(27.8, 88.9)[1]}
                   L ${project(27.4, 88.9)[0]} ${project(27.4, 88.9)[1]}
                   Q ${project(27.3, 88.5)[0]} ${project(27.3, 88.5)[1]} ${project(27.5, 88.1)[0]} ${project(27.5, 88.1)[1]} Z`}
                fill={mapStyle === 'satellite' ? '#e2e8f0' : '#475569'}
                fillOpacity={mapStyle === 'satellite' ? '0.2' : '0.12'}
                stroke="#64748b"
                strokeWidth="0.8"
                strokeDasharray="2 3"
              />
              <text
                x={project(27.78, 88.35)[0]}
                y={project(27.78, 88.35)[1]}
                fill="#cbd5e1"
                fontSize="8"
                fontWeight="bold"
                letterSpacing="1px"
                opacity="0.6"
              >
                GREAT HIMALAYA &bull; 4,000m+ GLACIATED ZONE
              </text>

              {/* Sub-Alpine Montane Ridge (1,500m - 2,500m Gangtok, Kalimpong, Singalila) */}
              <path
                d={`M ${project(27.45, 88.2)[0]} ${project(27.45, 88.2)[1]}
                   Q ${project(27.35, 88.6)[0]} ${project(27.35, 88.6)[1]} ${project(27.15, 88.7)[0]} ${project(27.15, 88.7)[1]}
                   T ${project(26.9, 88.5)[0]} ${project(26.9, 88.5)[1]}
                   L ${project(26.95, 88.2)[0]} ${project(26.95, 88.2)[1]} Z`}
                fill="#334155"
                fillOpacity="0.14"
                stroke="#475569"
                strokeWidth="0.6"
              />

              {/* Meghalaya Plateau Escarpment (Shillong, Cherrapunji, Jowai 1,200m - 1,900m) */}
              <path
                d={`M ${project(25.85, 90.2)[0]} ${project(25.85, 90.2)[1]}
                   Q ${project(25.9, 91.5)[0]} ${project(25.9, 91.5)[1]} ${project(25.8, 92.5)[0]} ${project(25.8, 92.5)[1]}
                   L ${project(25.2, 92.6)[0]} ${project(25.2, 92.6)[1]}
                   Q ${project(25.15, 91.5)[0]} ${project(25.15, 91.5)[1]} ${project(25.15, 90.2)[0]} ${project(25.15, 90.2)[1]} Z`}
                fill={mapStyle === 'satellite' ? '#14532d' : '#1e293b'}
                fillOpacity={mapStyle === 'satellite' ? '0.25' : '0.18'}
                stroke="#334155"
                strokeWidth="0.7"
              />
              <text
                x={project(25.55, 91.2)[0]}
                y={project(25.55, 91.2)[1]}
                fill="#94a3b8"
                fontSize="8"
                fontWeight="bold"
                letterSpacing="1px"
                opacity="0.5"
              >
                MEGHALAYA HIGHLANDS ESCARPMENT
              </text>
            </g>
          )}

          {/* 3. State & International Border Lines */}
          {showBoundaries && (
            <g className="transition-opacity">
              {regionBoundaries.map((b) => {
                const pathData = b.coordinates
                  .map((coord, idx) => {
                    const [px, py] = project(coord[0], coord[1]);
                    return `${idx === 0 ? 'M' : 'L'} ${px} ${py}`;
                  })
                  .join(' ');

                const isIntl = b.category === 'INTERNATIONAL';

                return (
                  <g key={b.id}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={b.strokeColor || (isIntl ? '#f59e0b' : '#64748b')}
                      strokeWidth={isIntl ? '2.0' : '1.2'}
                      strokeDasharray={b.strokeDash || '4 4'}
                      opacity={isIntl ? 0.75 : 0.45}
                    />
                    {/* Border Name Badge at mid-point */}
                    {b.coordinates.length > 2 && (
                      <text
                        x={project(b.coordinates[Math.floor(b.coordinates.length / 2)][0], b.coordinates[Math.floor(b.coordinates.length / 2)][1])[0]}
                        y={project(b.coordinates[Math.floor(b.coordinates.length / 2)][0], b.coordinates[Math.floor(b.coordinates.length / 2)][1])[1] - 5}
                        fill={b.strokeColor || '#f59e0b'}
                        fontSize="7"
                        fontWeight="600"
                        letterSpacing="0.5px"
                        opacity="0.8"
                        textAnchor="middle"
                      >
                        {b.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* 4. Hydrological Network (Rivers & Lakes) */}
          {showRivers && (
            <g className="transition-opacity">
              {/* Lakes & Water Bodies */}
              {waterBodies.map((wb) => {
                const [lx, ly] = project(wb.coordinates.lat, wb.coordinates.lng);
                return (
                  <g
                    key={wb.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWaterBody(wb);
                    }}
                  >
                    <ellipse
                      cx={lx}
                      cy={ly}
                      rx={wb.type === 'RESERVOIR' ? 14 : 7}
                      ry={wb.type === 'RESERVOIR' ? 9 : 5}
                      fill="#0284c7"
                      fillOpacity="0.6"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                    />
                    <text
                      x={lx + 10}
                      y={ly + 3}
                      fill="#38bdf8"
                      fontSize="7"
                      fontWeight="600"
                      className="group-hover:opacity-100 opacity-80"
                    >
                      {wb.name} ({wb.elevationMeters}m)
                    </text>
                  </g>
                );
              })}

              {/* Major Rivers */}
              {riverSystems.map((river) => {
                const pathData = river.coordinates
                  .map((coord, idx) => {
                    const [rx, ry] = project(coord[0], coord[1]);
                    return `${idx === 0 ? 'M' : 'L'} ${rx} ${ry}`;
                  })
                  .join(' ');

                let strokeGradient = 'url(#teestaGrad)';
                let strokeWidth = river.isMainCorridor ? 3.5 : 2.0;

                if (river.id === 'river_brahmaputra') {
                  strokeGradient = 'url(#brahmaputraGrad)';
                  strokeWidth = 5.5;
                } else if (river.id === 'river_barak') {
                  strokeGradient = 'url(#barakGrad)';
                  strokeWidth = 3.2;
                }

                const midIdx = Math.floor(river.coordinates.length / 2);
                const [tx, ty] = project(river.coordinates[midIdx][0], river.coordinates[midIdx][1]);

                return (
                  <g key={river.id}>
                    {/* River Casing */}
                    <path d={pathData} fill="none" stroke="#0369a1" strokeWidth={strokeWidth + 1.5} opacity="0.3" strokeLinecap="round" />
                    {/* River Main Line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={strokeGradient}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* River Title Label */}
                    <text
                      x={tx + 6}
                      y={ty - 4}
                      fill="#38bdf8"
                      fontSize="8"
                      fontWeight="700"
                      letterSpacing="0.5px"
                      opacity="0.85"
                    >
                      {river.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 5. GSI Landslide & Geohazard Hotspots (Interactive) */}
          {showDisasterRisk && (
            <g className="transition-opacity">
              {hazardHotspots.map((hazard) => {
                const [hx, hy] = project(hazard.coordinates.lat, hazard.coordinates.lng);
                const isSelected = selectedHazard?.id === hazard.id;

                return (
                  <g
                    key={hazard.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHazard(hazard);
                    }}
                  >
                    {/* Pulsing warning aura */}
                    <circle cx={hx} cy={hy} r="18" fill="none" stroke="#f43f5e" strokeWidth="1" className="animate-ping" opacity="0.4" />
                    {/* Hazard Impact Radius Circle */}
                    <circle
                      cx={hx}
                      cy={hy}
                      r="14"
                      fill="url(#hazardStripe)"
                      stroke="#f43f5e"
                      strokeWidth={isSelected ? '2' : '1.2'}
                      strokeDasharray="3 2"
                      opacity="0.8"
                    />
                    {/* Hazard Center Badge */}
                    <circle cx={hx} cy={hy} r="6" fill="#be123c" stroke="#fff" strokeWidth="1" />
                    <text x={hx} y={hy + 2.5} fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle">
                      !
                    </text>
                    {/* Hazard Label */}
                    <text
                      x={hx + 14}
                      y={hy + 3}
                      fill="#fda4af"
                      fontSize="7"
                      fontWeight="700"
                      className="group-hover:text-rose-200"
                    >
                      {hazard.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 6. IMD Weather Radar Precipitation Clouds & Live Met Telemetry */}
          {showWeatherFeeds && (
            <g className="transition-opacity">
              {/* Radar Doppler Precipitation Echoes */}
              <g opacity="0.22">
                <ellipse cx={project(27.4, 88.5)[0]} cy={project(27.4, 88.5)[1]} rx="70" ry="48" fill="#0284c7" />
                <ellipse cx={project(25.2, 91.6)[0]} cy={project(25.2, 91.6)[1]} rx="85" ry="55" fill="#2563eb" />
                <ellipse cx={project(24.8, 92.8)[0]} cy={project(24.8, 92.8)[1]} rx="60" ry="42" fill="#0ea5e9" />
              </g>

              {/* IMD Ground Met Stations */}
              {weatherFeeds.map((station) => {
                const loc = imdStationLocations[station.stationId] || { lat: 26.5, lng: 90.5 };
                const [wx, wy] = project(loc.lat, loc.lng);
                const isSelected = selectedWeatherStation?.stationId === station.stationId;

                let alertColor = '#38bdf8';
                if (station.alertLevel === 'RED') alertColor = '#ef4444';
                else if (station.alertLevel === 'ORANGE') alertColor = '#f97316';
                else if (station.alertLevel === 'YELLOW') alertColor = '#eab308';

                return (
                  <g
                    key={station.stationId}
                    transform={`translate(${wx}, ${wy})`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWeatherStation(station);
                    }}
                  >
                    {/* Pulsing warning aura for Red/Orange alerts */}
                    {(station.alertLevel === 'RED' || station.alertLevel === 'ORANGE') && (
                      <circle r="16" fill="none" stroke={alertColor} strokeWidth="1.2" className="animate-ping" opacity="0.5" />
                    )}

                    {/* Outer marker ring */}
                    <circle
                      r={isSelected ? '10' : '7'}
                      fill="#020617"
                      stroke={alertColor}
                      strokeWidth={isSelected ? '2' : '1.5'}
                    />

                    {/* Center Dot */}
                    <circle r="3" fill={alertColor} />

                    {/* Weather Metric Tag */}
                    <rect
                      x="10"
                      y="-12"
                      width="58"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity="0.85"
                      stroke={alertColor}
                      strokeWidth="0.8"
                    />
                    <text x="14" y="-4" fill="#ffffff" fontSize="6.5" fontWeight="bold">
                      {station.location.split(' ')[0]}
                    </text>
                    <text x="14" y="3" fill={alertColor} fontSize="5.5" fontWeight="600">
                      {station.rainfall6hMm}mm/6h &bull; {station.windSpeedKmh}km/h
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 7. Road Network Segments (High-Detail Vector Tracks) */}
          {showRoadCorridors && (
            <g className="transition-opacity">
              {segments.map((segment) => {
              const isSelected = segment.id === selectedSegmentId;
              const isInActiveRoute = activeRouteOption?.pathSegmentIds.includes(segment.id);

              // Build SVG path data
              const pathData = segment.coordinates
                .map((coord, idx) => {
                  const [x, y] = project(coord[0], coord[1]);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ');

              // Color coding based on risk and condition
              let strokeColor = '#10b981'; // OPEN
              if (segment.currentCondition === 'BLOCKED') strokeColor = '#e11d48';
              else if (segment.currentCondition === 'RESTRICTED') strokeColor = '#f97316';
              else if (segment.currentCondition === 'AT_RISK') strokeColor = '#f59e0b';

              if (isInActiveRoute) {
                strokeColor = '#38bdf8'; // Highlight alternate path
              }

              // Highway corridor classification
              const isNH10 = segment.name.includes('NH-10');
              const isNH6 = segment.name.includes('NH-6');
              const isNH717A = segment.name.includes('NH-717A');

              return (
                <g
                  key={segment.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSegment(segment.id);
                  }}
                >
                  {/* Invisible broad click target */}
                  <path d={pathData} fill="none" stroke="transparent" strokeWidth="18" />

                  {/* Road Casing (Base Bed) */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#020617"
                    strokeWidth={isSelected ? '7' : isInActiveRoute ? '6' : isNH10 || isNH6 ? '5' : '4'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Active Route Glow Effect */}
                  {isInActiveRoute && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="9"
                      strokeOpacity="0.4"
                      filter="url(#routeGlow)"
                    />
                  )}

                  {/* Main Road Surface Stroke */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSelected ? '4' : isInActiveRoute ? '3.5' : isNH10 || isNH6 ? '3.0' : '2.2'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={segment.currentCondition === 'BLOCKED' ? 'animate-pulse' : ''}
                  />

                  {/* Animated Centerline Dash for Open Traffic Flow */}
                  {segment.currentCondition === 'OPEN' && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                      strokeDasharray="4 8"
                      opacity="0.6"
                    />
                  )}

                  {/* Highway Corridor Shield Markers (rendered once per major segment) */}
                  {(isNH10 || isNH6 || isNH717A) && segment.coordinates.length > 2 && (
                    <g
                      transform={`translate(${
                        project(segment.coordinates[Math.floor(segment.coordinates.length / 2)][0], segment.coordinates[Math.floor(segment.coordinates.length / 2)][1])[0]
                      }, ${
                        project(segment.coordinates[Math.floor(segment.coordinates.length / 2)][0], segment.coordinates[Math.floor(segment.coordinates.length / 2)][1])[1]
                      })`}
                    >
                      <rect x="-14" y="-7" width="28" height="13" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                      <text x="0" y="2.5" fill="#38bdf8" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                        {isNH10 ? 'NH-10' : isNH6 ? 'NH-6' : '717A'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            </g>
          )}

          {/* 8. Mountain Summits & Strategic Passes */}
          {showPeaksAndPasses && (
            <g className="transition-opacity">
              {/* Mountain Passes (Nathu La, Sela Pass) */}
              {mountainPasses.map((pass) => {
                const [px, py] = project(pass.coordinates.lat, pass.coordinates.lng);
                const isSelected = selectedPass?.id === pass.id;

                return (
                  <g
                    key={pass.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPass(pass);
                    }}
                  >
                    <polygon points={`${px},${py - 7} ${px + 6},${py + 4} ${px - 6},${py + 4}`} fill="#eab308" stroke="#000" strokeWidth="1" />
                    <text x={px + 8} y={py + 2} fill="#fde047" fontSize="7" fontWeight="bold">
                      {pass.name} ({pass.elevationMeters}m)
                    </text>
                  </g>
                );
              })}

              {/* High Summits (Kangchenjunga, Shillong Peak) */}
              {mountainPeaks.map((peak) => {
                const [px, py] = project(peak.coordinates.lat, peak.coordinates.lng);
                const isKanchenjunga = peak.id === 'peak_kanchenjunga';

                return (
                  <g
                    key={peak.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPeak(peak);
                    }}
                  >
                    {/* Mountain Summit Icon */}
                    <polygon
                      points={`${px},${py - (isKanchenjunga ? 12 : 8)} ${px + (isKanchenjunga ? 9 : 6)},${py + (isKanchenjunga ? 6 : 4)} ${px - (isKanchenjunga ? 9 : 6)},${py + (isKanchenjunga ? 6 : 4)}`}
                      fill={isKanchenjunga ? '#f8fafc' : '#94a3b8'}
                      stroke="#0f172a"
                      strokeWidth="1.2"
                    />
                    <text
                      x={px}
                      y={py + (isKanchenjunga ? 15 : 12)}
                      fill={isKanchenjunga ? '#f8fafc' : '#cbd5e1'}
                      fontSize={isKanchenjunga ? '8' : '6.5'}
                      fontWeight="bold"
                      textAnchor="middle"
                      className="drop-shadow-md"
                    >
                      ▲ {peak.name} ({peak.elevationMeters}m)
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 9. Central Water Commission (CWC) River Flood Gauges */}
          {showFloodGauges && (
            <g className="transition-opacity">
              {cwcFeeds.map((gauge) => {
                const cwcCoordsMap: Record<string, [number, number]> = {
                  'Teesta Sevoke Bridge': [26.8833, 88.4719],
                  'Teesta Singtam Gauge': [27.2344, 88.4975],
                  'Barak Annapurna Ghat': [24.8333, 92.7789],
                  'Brahmaputra Guwahati DC Court': [26.1445, 91.7362]
                };
                const coords = cwcCoordsMap[gauge.stationName] || [26.5, 90.0];
                const [gx, gy] = project(coords[0], coords[1]);
                const isDanger = gauge.status === 'ABOVE_DANGER';

                return (
                  <g
                    key={gauge.stationName}
                    transform={`translate(${gx + 8}, ${gy + 8})`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGauge(gauge);
                    }}
                  >
                    {isDanger && (
                      <circle r="14" fill="none" stroke="#e11d48" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                    )}
                    <circle r="8" fill={isDanger ? '#e11d48' : '#0284c7'} stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="2.5" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                      ~
                    </text>
                    <text x="11" y="3" fill="#38bdf8" fontSize="7" fontWeight="bold" className="group-hover:underline">
                      {gauge.stationName}: {gauge.currentWaterLevelM}m {isDanger ? '(ALERT)' : ''}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 10. Logistics Network Hub Nodes & Transit Junctions */}
          <g>
            {nodes.map((node) => {
              const [nx, ny] = project(node.lat, node.lng);
              return (
                <g key={node.id} className="cursor-pointer group">
                  {/* Outer ring for major logistics hubs */}
                  {node.isHub && (
                    <circle cx={nx} cy={ny} r="10" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.6" />
                  )}

                  {/* Node marker center dot */}
                  <circle
                    cx={nx}
                    cy={ny}
                    r={node.isHub ? 5.5 : 3.5}
                    fill={node.isHub ? '#10b981' : '#cbd5e1'}
                    stroke="#020617"
                    strokeWidth="1.5"
                  />

                  {/* Node label text with background contrast */}
                  <text
                    x={nx + 8}
                    y={ny + 3}
                    fill={node.isHub ? '#f8fafc' : '#94a3b8'}
                    fontSize={node.isHub ? '8.5' : '7'}
                    fontWeight={node.isHub ? 'bold' : 'normal'}
                    className="pointer-events-none drop-shadow-md"
                  >
                    {node.name.replace(' Central Hub', '').replace(' District HQ', '').replace(' Logistics Junction', '')}
                    {node.elevationMeters && ` (${node.elevationMeters}m)`}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 11. Ground Field Verification Reports */}
          {showFieldReports && (
            <g className="transition-opacity">
              {fieldReports.map((report) => {
                const [rx, ry] = project(report.coordinates.lat, report.coordinates.lng);
                return (
                  <g key={report.id} transform={`translate(${rx}, ${ry})`} className="cursor-pointer">
                    <polygon points="0,-8 7,5 -7,5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
                    <text x="0" y="2" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                      !
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 12. Essential Freight & Humanitarian Fleet Convoys */}
          {showActiveShipments && (
            <g className="transition-opacity">
              {shipments.map((shipment) => {
                const [fx, fy] = project(shipment.currentLat, shipment.currentLng);
                const isSelected = shipment.id === selectedShipmentId;

                let commColor = '#3b82f6';
                if (shipment.commodity === 'MEDICINE') commColor = '#ef4444';
                else if (shipment.commodity === 'FOOD') commColor = '#f59e0b';
                else if (shipment.commodity === 'AGRICULTURE') commColor = '#10b981';
                else if (shipment.commodity === 'CONSTRUCTION') commColor = '#f97316';

                return (
                  <g
                    key={shipment.id}
                    transform={`translate(${fx}, ${fy})`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectShipment(shipment.id);
                    }}
                  >
                    {/* Pulsing ring */}
                    <circle r={isSelected ? '12' : '8'} fill="none" stroke={commColor} strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                    <rect x="-6" y="-6" width="12" height="12" rx="3" fill={commColor} stroke="#020617" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#020617" fontSize="6.5" fontWeight="900" textAnchor="middle">
                      {shipment.commodity === 'MEDICINE'
                        ? 'Rx'
                        : shipment.commodity === 'FOOD'
                        ? 'Fd'
                        : shipment.commodity === 'AGRICULTURE'
                        ? 'Ag'
                        : 'Cs'}
                    </text>
                    <text x="8" y="-5" fill="#f8fafc" fontSize="7" fontWeight="bold" className="drop-shadow-md">
                      {shipment.vehicleNumber} ({shipment.speedKmh} km/h)
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE INSPECTOR DRAWERS (Multi-Element Telemetry Cards) */}
      {/* ========================================================================= */}

      {/* 1. Road Segment Inspector Drawer */}
      {selectedSegment && (
        <div className="absolute top-16 right-3 z-30 w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Segment Telemetry
              </span>
              <h4 className="font-bold text-sm text-white">{selectedSegment.name}</h4>
            </div>
            <button
              onClick={() => onSelectSegment(null)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              &times;
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  selectedSegment.currentCondition === 'BLOCKED'
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : selectedSegment.currentCondition === 'RESTRICTED'
                    ? 'bg-orange-950 text-orange-300 border border-orange-700'
                    : selectedSegment.currentCondition === 'AT_RISK'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}
              >
                {selectedSegment.currentCondition}
              </span>
              <span className="font-mono text-xs text-slate-300">
                Risk Index:{' '}
                <strong
                  className={
                    selectedSegment.riskScore > 80
                      ? 'text-rose-400'
                      : selectedSegment.riskScore > 50
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }
                >
                  {selectedSegment.riskScore}/100
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2 rounded-lg text-[11px]">
              <div>
                <span className="text-slate-400">Length & Width:</span>
                <p className="font-semibold text-slate-200">
                  {selectedSegment.lengthKm} km &bull; {selectedSegment.widthMeters}m
                </p>
              </div>
              <div>
                <span className="text-slate-400">Slope Gradient:</span>
                <p className="font-semibold text-slate-200">{selectedSegment.slopeAngleDeg}° incline</p>
              </div>
              <div>
                <span className="text-slate-400">Elevation:</span>
                <p className="font-semibold text-slate-200">{selectedSegment.averageElevationMeters}m MSL</p>
              </div>
              <div>
                <span className="text-slate-400">Surface Type:</span>
                <p className="font-semibold text-slate-200">{selectedSegment.surfaceType}</p>
              </div>
            </div>

            <div className="bg-slate-800/40 p-2 rounded border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Risk Assessment:</span>
              <p className="text-slate-300 text-[11px] mt-0.5">{selectedSegment.riskFactors.primaryCause}</p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {onPlanRouteForSegment && (
                <button
                  onClick={() => onPlanRouteForSegment(selectedSegment)}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1 shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Compute Detour</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. GSI Geological Hazard Inspector */}
      {selectedHazard && (
        <div className="absolute top-16 right-3 z-30 w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-rose-800/80 shadow-2xl p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  GSI Geological Hazard Hotspot
                </span>
                <h4 className="font-bold text-sm text-white">{selectedHazard.name}</h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedHazard(null)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              &times;
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-rose-950 text-rose-300 border border-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">
                {selectedHazard.hazardType} &bull; {selectedHazard.severity}
              </span>
              <span className="text-slate-300 text-[11px]">
                Radius: <strong>{selectedHazard.radiusKm} km</strong>
              </span>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
              {selectedHazard.description}
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2 rounded-lg text-[11px]">
              <div>
                <span className="text-slate-400">24h Rain Threshold:</span>
                <p className="font-bold text-amber-400">{selectedHazard.triggerThresholdMm} mm</p>
              </div>
              <div>
                <span className="text-slate-400">Historical Failures:</span>
                <p className="font-bold text-rose-400">{selectedHazard.historicalIncidents} major slides</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mountain Peak / Pass Inspector */}
      {(selectedPeak || selectedPass) && (
        <div className="absolute top-16 right-3 z-30 w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-amber-800/80 shadow-2xl p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {selectedPeak ? 'Himalayan Summit' : 'Strategic Mountain Pass'}
                </span>
                <h4 className="font-bold text-sm text-white">
                  {selectedPeak ? selectedPeak.name : selectedPass?.name}
                </h4>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPeak(null);
                setSelectedPass(null);
              }}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              &times;
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="bg-slate-800/60 p-2 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Altitude:</span>
                <span className="font-bold text-amber-300 text-sm">
                  {selectedPeak ? selectedPeak.elevationMeters : selectedPass?.elevationMeters}m MSL
                </span>
              </div>
              {selectedPeak && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mountain Range:</span>
                  <span className="font-medium text-slate-200">{selectedPeak.range}</span>
                </div>
              )}
              {selectedPass && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pass Status:</span>
                  <span className="px-2 py-0.5 bg-amber-950 border border-amber-700 rounded text-amber-300 text-[10px] font-bold">
                    {selectedPass.status}
                  </span>
                </div>
              )}
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
              {selectedPeak ? selectedPeak.description : selectedPass?.significance}
            </p>
          </div>
        </div>
      )}

      {/* 4. CWC River Flood Gauge Inspector */}
      {selectedGauge && (
        <div className="absolute top-16 right-3 z-30 w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-cyan-800/80 shadow-2xl p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Central Water Commission Telemetry
                </span>
                <h4 className="font-bold text-sm text-white">{selectedGauge.stationName}</h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedGauge(null)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              &times;
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedGauge.status === 'ABOVE_DANGER'
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                }`}
              >
                {selectedGauge.status.replace('_', ' ')}
              </span>
              <span className="text-slate-300">
                River: <strong>{selectedGauge.river}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2 rounded-lg text-[11px]">
              <div>
                <span className="text-slate-400">Current Level:</span>
                <p className="font-bold text-cyan-300 text-sm">{selectedGauge.currentWaterLevelM}m</p>
              </div>
              <div>
                <span className="text-slate-400">Danger Mark:</span>
                <p className="font-bold text-rose-400 text-sm">{selectedGauge.dangerLevelM}m</p>
              </div>
              <div>
                <span className="text-slate-400">Warning Mark:</span>
                <p className="text-slate-200">{selectedGauge.warningLevelM}m</p>
              </div>
              <div>
                <span className="text-slate-400">Water Trend:</span>
                <p className="text-slate-200 font-semibold">{selectedGauge.trend}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Essential Shipment Telemetry Inspector */}
      {selectedShipment && (
        <div className="absolute top-16 right-3 z-30 w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-blue-800 shadow-2xl p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Essential Shipment Telemetry
              </span>
              <h4 className="font-bold text-sm text-white">{selectedShipment.vehicleNumber}</h4>
            </div>
            <button
              onClick={() => onSelectShipment(null)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              &times;
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-blue-950 text-blue-300 border border-blue-700 px-2 py-0.5 rounded text-[11px] font-bold">
                {selectedShipment.commodity}
              </span>
              <span
                className={`font-bold text-[11px] ${
                  selectedShipment.status === 'DELAYED' ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {selectedShipment.status} ({shipmentSpeedKmh(selectedShipment.speedKmh)})
              </span>
            </div>

            <div className="bg-slate-800/60 p-2 rounded-lg space-y-1">
              <p className="text-slate-300">
                <strong>Cargo:</strong> {selectedShipment.cargoDescription}
              </p>
              <p className="text-slate-400 text-[10px]">
                Driver: {selectedShipment.driverName} &bull; {selectedShipment.driverPhone}
              </p>
              <p className="text-slate-400 text-[10px]">
                Weight: {selectedShipment.cargoWeightTonnes} Tonnes{' '}
                {selectedShipment.isTemperatureSensitive && '(Cold Chain 2-8°C Active)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Selected Weather Station Inspector */}
      {selectedWeatherStation && (
        <div
          id="weather-station-inspector-card"
          className="absolute bottom-3 left-3 z-30 max-w-sm bg-slate-900/95 backdrop-blur-md rounded-xl border border-sky-500/50 p-3 text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/80 mb-2">
            <div className="flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-sky-400" />
              <div>
                <h4 className="font-bold text-white text-xs leading-tight">
                  {selectedWeatherStation.location}
                </h4>
                <p className="text-[10px] text-sky-300 font-medium">
                  IMD Doppler Observation &bull; Station {selectedWeatherStation.stationId}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedWeatherStation(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              title="Close Panel"
            >
              &times;
            </button>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Precipitation Alert:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  selectedWeatherStation.alertLevel === 'RED'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : selectedWeatherStation.alertLevel === 'ORANGE'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : selectedWeatherStation.alertLevel === 'YELLOW'
                    ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {selectedWeatherStation.alertLevel} ALERT
              </span>
            </div>

            {selectedWeatherStation.cloudburstRisk && (
              <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-200 text-[10px] font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>CLOUDBURST RISK: Runoff velocity exceeds drainage capacity!</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5 bg-slate-800/60 p-2 rounded-lg">
              <div>
                <p className="text-slate-400 text-[10px]">Rainfall (6-Hour Accum):</p>
                <p className="font-bold text-sky-300">
                  {selectedWeatherStation.rainfall6hMm} mm
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Wind Speed / Sync:</p>
                <p className="font-medium text-slate-200">
                  {selectedWeatherStation.windSpeedKmh} km/h &bull; {selectedWeatherStation.lastSync}
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-[10px] italic">
              &ldquo;{selectedWeatherStation.forecast24h}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for shipment speed
function shipmentSpeedKmh(speed: number) {
  return `${speed} km/h`;
}
