import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Polyline,
  InfoWindow,
  useMap,
  MapControl,
  ControlPosition
} from '@vis.gl/react-google-maps';
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
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  FileText,
  Activity,
  ExternalLink,
  Key,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Gauge,
  ShieldAlert
} from 'lucide-react';
import {
  mountainPeaks,
  mountainPasses,
  hazardHotspots
} from '../data/gisGeoData';

interface GoogleMapViewProps {
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
  onSwitchToVectorMap?: () => void;
}

import { ErrorBoundary } from './ErrorBoundary';

// Subcomponent: Traffic Layer Toggle
const TrafficLayerControl: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps || !google.maps.TrafficLayer) return;
    try {
      const traffic = new google.maps.TrafficLayer();
      if (enabled) {
        traffic.setMap(map);
      } else {
        traffic.setMap(null);
      }
      return () => {
        try {
          traffic.setMap(null);
        } catch {}
      };
    } catch (e) {
      console.warn('TrafficLayer error:', e);
    }
  }, [map, enabled]);

  return null;
};

// Subcomponent: Camera Navigation Presets
const CameraController: React.FC<{
  targetFocus: 'all' | 'sikkim' | 'meghalaya' | 'assam' | null;
  selectedSegment: RoadSegment | null;
  selectedShipment: TrackedShipment | null;
  onResetFocus: () => void;
}> = ({ targetFocus, selectedSegment, selectedShipment, onResetFocus }) => {
  const map = useMap();

  // Automatically fit camera to North Eastern Region (NER) extent on map load
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;
    try {
      const bounds = new google.maps.LatLngBounds(
        { lat: 24.8, lng: 88.2 },
        { lat: 27.8, lng: 93.5 }
      );
      map.fitBounds(bounds);
    } catch (e) {
      console.warn('Initial NER bounds error:', e);
    }
  }, [map]);

  useEffect(() => {
    if (!map || !targetFocus || typeof google === 'undefined' || !google.maps) return;

    try {
      if (targetFocus === 'sikkim') {
        map.panTo({ lat: 27.20, lng: 88.54 });
        map.setZoom(10);
      } else if (targetFocus === 'meghalaya') {
        map.panTo({ lat: 25.55, lng: 92.05 });
        map.setZoom(10);
      } else if (targetFocus === 'assam') {
        map.panTo({ lat: 26.14, lng: 91.75 });
        map.setZoom(11);
      } else if (targetFocus === 'all') {
        const bounds = new google.maps.LatLngBounds(
          { lat: 24.6, lng: 88.2 },
          { lat: 27.8, lng: 92.9 }
        );
        map.fitBounds(bounds);
      }
    } catch (e) {
      console.warn('CameraController bounds error:', e);
    }
    onResetFocus();
  }, [map, targetFocus, onResetFocus]);

  useEffect(() => {
    if (!map || !selectedSegment || !selectedSegment.coordinates.length) return;
    const midIdx = Math.floor(selectedSegment.coordinates.length / 2);
    const [lat, lng] = selectedSegment.coordinates[midIdx];
    map.panTo({ lat, lng });
  }, [map, selectedSegment]);

  useEffect(() => {
    if (!map || !selectedShipment) return;
    map.panTo({ lat: selectedShipment.currentLat, lng: selectedShipment.currentLng });
    map.setZoom(12);
  }, [map, selectedShipment]);

  return null;
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
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
  onPlanRouteForSegment,
  onSwitchToVectorMap
}) => {
  const t = translations[currentLanguage];

  // API Key management (Using user provided Google Maps Platform key)
  const DEFAULT_KEY = 'AIzaSyCKZyu_SwTcSAa5D3XEiyndyXsJyhsC4Ak';
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || (import.meta as any).env?.GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState<string>(() => {
    return envKey || localStorage.getItem('ner_gmp_api_key') || DEFAULT_KEY;
  });
  const [apiLoadError, setApiLoadError] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Catch Google Maps API authorization and billing failures (e.g. ApiProjectMapError)
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps API Authentication / Billing notice: gm_authFailure triggered');
      setApiLoadError(true);
    };
    return () => {
      delete (window as any).gm_authFailure;
    };
  }, []);

  // Map configuration state
  const [mapType, setMapType] = useState<google.maps.MapTypeId | 'terrain' | 'satellite' | 'hybrid' | 'roadmap'>('terrain');
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState<boolean>(true);
  const [showGsiOverlay, setShowGsiOverlay] = useState<boolean>(true);
  const [showFloodGauges, setShowFloodGauges] = useState<boolean>(true);
  const [showFleet, setShowFleet] = useState<boolean>(true);
  const [showFieldReports, setShowFieldReports] = useState<boolean>(true);

  // Camera presets
  const [targetFocus, setTargetFocus] = useState<'all' | 'sikkim' | 'meghalaya' | 'assam' | null>(null);

  // Active InfoWindow selection
  const [infoWindowTarget, setInfoWindowTarget] = useState<{
    type: 'segment' | 'shipment' | 'cwc' | 'weather' | 'report' | 'node' | 'peak' | 'pass' | 'hazard';
    id: string;
    position: { lat: number; lng: number };
  } | null>(null);

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId) || null;
  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId) || null;

  // Color helper for segment risk condition
  const getSegmentColor = (condition: string, isHighlighted: boolean) => {
    if (isHighlighted) return '#06b6d4'; // Cyan glowing highlight
    switch (condition) {
      case 'BLOCKED':
        return '#ef4444'; // Red
      case 'AT_RISK':
        return '#f59e0b'; // Amber
      case 'RESTRICTED':
        return '#f97316'; // Orange
      case 'OPEN':
      default:
        return '#10b981'; // Emerald
    }
  };

  const handleSaveCustomKey = (key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    setApiLoadError(false);
    localStorage.setItem('ner_gmp_api_key', trimmed);
    setShowKeyModal(false);
  };

  // Dedicated activation screen when no valid API key is present or when Google Maps API load fails
  const renderActivationView = () => {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-200 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 max-w-lg w-full bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-inner ${
            apiLoadError
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
          }`}>
            {apiLoadError ? <AlertTriangle className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
          </div>

          <div>
            <h3 className="text-base font-bold text-white">
              {apiLoadError ? 'Google Cloud Billing Required' : 'Google Maps Platform Integration'}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {apiLoadError ? (
                <>
                  The Google Maps API key you provided requires an active billing account to be enabled in your Google Cloud Console (<code className="text-amber-300 font-mono text-[10px] bg-slate-800 px-1 py-0.5 rounded">ApiProjectMapError</code>). You can link a billing account at{' '}
                  <a
                    href="https://console.cloud.google.com/project/_/billing/enable"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-medium inline-flex items-center gap-0.5"
                  >
                    Google Cloud Billing <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  , or switch to the Vector GIS Engine to view the North Eastern Region instantly.
                </>
              ) : (
                'Connect a Google Maps Platform API key or free Maps Demo Key to render photorealistic satellite imagery, 3D Himalayan terrain relief, and live highway traffic.'
              )}
            </p>
          </div>

          {onSwitchToVectorMap && (
            <div className="pt-2">
              <button
                onClick={onSwitchToVectorMap}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-emerald-900/30"
              >
                <Layers className="w-4 h-4" />
                <span>Switch to Vector GIS Engine (Active Now)</span>
              </button>
            </div>
          )}

          {/* Key input form */}
          <div className="space-y-2 text-left pt-2 border-t border-slate-800">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Enter Different Key or Maps Demo Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="AIzaSy..."
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleSaveCustomKey(customKeyInput)}
                disabled={!customKeyInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow transition-colors shrink-0"
              >
                Activate
              </button>
            </div>
          </div>

          {/* Quick links & Vector GIS switch */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
            <a
              href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>Get Free Demo Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[660px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Top Map Control Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 text-xs shadow-lg max-w-[calc(100%-24px)]">
        <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px] uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-blue-400" /> Google Map View:
        </span>

        {/* Map Type Selector */}
        <select
          value={mapType}
          onChange={(e) => setMapType(e.target.value as any)}
          aria-label="Google Map View Type"
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="terrain">Himalayan Terrain (3D Relief)</option>
          <option value="satellite">Satellite Photogrammetry</option>
          <option value="hybrid">Hybrid (Satellite + Road Labels)</option>
          <option value="roadmap">Roadmap Cartography</option>
        </select>

        {/* Live Traffic Toggle */}
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
            showTraffic
              ? 'bg-rose-950 border-rose-600 text-rose-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Google Maps Live Traffic Layer"
        >
          <Activity className="w-3 h-3" />
          <span>Live Traffic</span>
        </button>

        {/* Weather Feed Toggle */}
        <button
          onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
            showWeatherOverlay
              ? 'bg-blue-950 border-blue-600 text-blue-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle IMD Weather Radar"
        >
          <CloudRain className="w-3 h-3" />
          <span>IMD Weather</span>
        </button>

        {/* GSI Hazard Toggle */}
        <button
          onClick={() => setShowGsiOverlay(!showGsiOverlay)}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
            showGsiOverlay
              ? 'bg-amber-950 border-amber-600 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle GSI Landslide Susceptibility"
        >
          <Mountain className="w-3 h-3" />
          <span>GSI Hazard</span>
        </button>

        {/* CWC Flood Gauges */}
        <button
          onClick={() => setShowFloodGauges(!showFloodGauges)}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
            showFloodGauges
              ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle CWC River Level Gauges"
        >
          <Gauge className="w-3 h-3" />
          <span>River Gauges</span>
        </button>

        {/* Fleet Telemetry */}
        <button
          onClick={() => setShowFleet(!showFleet)}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
            showFleet
              ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Essential Life-line Fleet"
        >
          <Truck className="w-3 h-3" />
          <span>Fleet ({shipments.length})</span>
        </button>

        {/* Field Reports */}
        <button
          onClick={() => setShowFieldReports(!showFieldReports)}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
            showFieldReports
              ? 'bg-rose-950 border-rose-600 text-rose-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Ground Field Reports"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Reports ({fieldReports.length})</span>
        </button>

        {/* Engine switcher to Vector GIS */}
        {onSwitchToVectorMap && (
          <button
            onClick={onSwitchToVectorMap}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-auto"
            title="Switch to Offline Vector GIS Engine"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Vector GIS</span>
          </button>
        )}
      </div>

      {/* Quick Corridor Navigation Presets (Top Right) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 text-xs shadow-lg">
        <span className="text-[10px] text-slate-400 font-medium px-1">Focus:</span>
        <button
          onClick={() => setTargetFocus('all')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px]"
        >
          Full NER
        </button>
        <button
          onClick={() => setTargetFocus('sikkim')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium text-[11px]"
        >
          Sikkim (NH-10)
        </button>
        <button
          onClick={() => setTargetFocus('meghalaya')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium text-[11px]"
        >
          Meghalaya (NH-6)
        </button>
        <button
          onClick={() => setTargetFocus('assam')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium text-[11px]"
        >
          Guwahati
        </button>
      </div>

      {/* Primary Google Maps Canvas or Activation Screen */}
      <div className="w-full h-full">
        {!apiKey || !apiKey.trim() || apiLoadError ? (
          renderActivationView()
        ) : (
          <ErrorBoundary
            fallbackTitle="Google Maps Platform Initialization Notice"
            fallbackDescription="The Google Maps component could not initialize with this key (ApiProjectMapError / Billing required). You can switch to the Offline Vector GIS Engine."
            actionButton={
              onSwitchToVectorMap ? (
                <button
                  onClick={onSwitchToVectorMap}
                  className="px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600 text-emerald-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Switch to Vector GIS</span>
                </button>
              ) : undefined
            }
          >
            <APIProvider
              apiKey={apiKey}
              solutionChannel="GMP_aistudio"
              onError={() => {
                setApiLoadError(true);
              }}
            >
            <Map
              id="ner-gmp-map"
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={{ lat: 26.8, lng: 90.5 }}
              defaultZoom={8}
              mapTypeId={mapType}
              gestureHandling="greedy"
              disableDefaultUI={false}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Traffic Layer Subcomponent */}
              <TrafficLayerControl key="traffic_layer_ctrl" enabled={showTraffic} />

              {/* Camera Motion & Viewport Controller */}
              <CameraController
                key="camera_ctrl"
                targetFocus={targetFocus}
                selectedSegment={selectedSegment}
                selectedShipment={selectedShipment}
                onResetFocus={() => setTargetFocus(null)}
              />

              {/* 1. Road Network Polylines with Sub-pixel Precision */}
              {segments.map((seg) => {
                const path = seg.coordinates.map(([lat, lng]) => ({ lat, lng }));
                const isSelected = seg.id === selectedSegmentId;
                const isAlternative = activeRouteOption?.pathSegmentIds.includes(seg.id);
                const color = getSegmentColor(seg.currentCondition, isAlternative || false);

                return (
                  <Polyline
                    key={`seg_poly_${seg.id}`}
                    path={path}
                    strokeColor={isSelected ? '#06b6d4' : color}
                    strokeOpacity={1.0}
                    strokeWeight={isSelected ? 6 : isAlternative ? 5 : 3.5}
                    zIndex={isSelected ? 12 : 4}
                    onClick={() => {
                      onSelectSegment(seg.id);
                      const midIdx = Math.floor(path.length / 2);
                      setInfoWindowTarget({
                        type: 'segment',
                        id: seg.id,
                        position: path[midIdx]
                      });
                    }}
                  />
                );
              })}

            {/* 2. Critical Road Hazard Markers (Blockages & High Risk Zones) */}
            {segments
              .filter((seg) => seg.currentCondition === 'BLOCKED' || seg.currentCondition === 'AT_RISK')
              .map((seg) => {
                const midIdx = Math.floor(seg.coordinates.length / 2);
                const [lat, lng] = seg.coordinates[midIdx];
                const isBlocked = seg.currentCondition === 'BLOCKED';

                return (
                  <AdvancedMarker
                    key={`hazard_${seg.id}`}
                    position={{ lat, lng }}
                    title={`${seg.highwayCode}: ${seg.currentCondition}`}
                    onClick={() => {
                      onSelectSegment(seg.id);
                      setInfoWindowTarget({
                        type: 'segment',
                        id: seg.id,
                        position: { lat, lng }
                      });
                    }}
                  >
                    <div className="relative group cursor-pointer">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 ${
                          isBlocked
                            ? 'bg-rose-600 border-white text-white animate-pulse'
                            : 'bg-amber-500 border-white text-slate-950'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow">
                        {seg.highwayCode} {seg.currentCondition}
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* 3. Graph Node / Terminal Hub Markers */}
            {nodes.map((node) => (
              <AdvancedMarker
                key={node.id}
                position={{ lat: node.lat, lng: node.lng }}
                title={`${node.name} (${node.elevationMeters}m)`}
                onClick={() => {
                  setInfoWindowTarget({
                    type: 'node',
                    id: node.id,
                    position: { lat: node.lat, lng: node.lng }
                  });
                }}
              >
                <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-600 shadow-md text-white text-[10px] hover:scale-105 transition-transform">
                  <span className={`w-2 h-2 rounded-full ${node.isHub ? 'bg-blue-400' : 'bg-slate-400'}`} />
                  <span className="font-semibold">{node.name.split(' ')[0]}</span>
                  <span className="text-[8px] text-slate-400 font-mono">{node.elevationMeters}m</span>
                </div>
              </AdvancedMarker>
            ))}

            {/* 4. Live Essential Lifeline Fleet Markers */}
            {showFleet &&
              shipments.map((ship) => {
                const isSelected = ship.id === selectedShipmentId;
                const isDelayed = ship.estimatedDelayMinutes > 0;

                return (
                  <AdvancedMarker
                    key={ship.id}
                    position={{ lat: ship.currentLat, lng: ship.currentLng }}
                    title={`${ship.vehicleNumber} (${ship.commodity})`}
                    onClick={() => {
                      onSelectShipment(ship.id);
                      setInfoWindowTarget({
                        type: 'shipment',
                        id: ship.id,
                        position: { lat: ship.currentLat, lng: ship.currentLng }
                      });
                    }}
                  >
                    <div
                      className={`relative flex items-center gap-1 px-2 py-1 rounded-lg shadow-xl cursor-pointer border transition-transform ${
                        isSelected
                          ? 'bg-blue-600 border-white text-white scale-110 z-30 ring-2 ring-blue-400'
                          : isDelayed
                          ? 'bg-amber-600 border-amber-300 text-white'
                          : 'bg-emerald-700 border-emerald-300 text-white'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <div className="text-[10px] leading-tight">
                        <span className="font-bold block">{ship.commodity}</span>
                        <span className="text-[8px] opacity-80">{ship.vehicleNumber}</span>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* 5. Central Water Commission (CWC) River Flood Gauges */}
            {showFloodGauges &&
              cwcFeeds.map((gauge) => {
                const cwcCoordsMap: Record<string, { lat: number; lng: number }> = {
                  'Teesta Sevoke Bridge': { lat: 26.8833, lng: 88.4719 },
                  'Teesta Singtam Gauge': { lat: 27.2344, lng: 88.4975 },
                  'Barak Annapurna Ghat': { lat: 24.8333, lng: 92.7789 },
                  'Brahmaputra Guwahati DC Court': { lat: 26.1445, lng: 91.7362 }
                };
                const pos = cwcCoordsMap[gauge.stationName] || { lat: 26.5, lng: 90.0 };
                const isDanger = gauge.status === 'ABOVE_DANGER';
                return (
                  <AdvancedMarker
                    key={`cwc_${gauge.stationName}`}
                    position={pos}
                    title={`${gauge.stationName}: ${gauge.currentWaterLevelM}m`}
                    onClick={() => {
                      setInfoWindowTarget({
                        type: 'cwc',
                        id: gauge.stationName,
                        position: pos
                      });
                    }}
                  >
                    <div
                      className={`p-1.5 rounded-full border-2 shadow-md cursor-pointer ${
                        isDanger
                          ? 'bg-rose-600 border-white text-white animate-bounce'
                          : 'bg-cyan-600 border-white text-white'
                      }`}
                    >
                      <Gauge className="w-3 h-3" />
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* 6. Ground Field Reports (Verified Landslides / Floods) */}
            {showFieldReports &&
              fieldReports.map((report) => (
                <AdvancedMarker
                  key={report.id}
                  position={{ lat: report.coordinates.lat, lng: report.coordinates.lng }}
                  title={`${report.category}: ${report.description}`}
                  onClick={() => {
                    setInfoWindowTarget({
                      type: 'report',
                      id: report.id,
                      position: { lat: report.coordinates.lat, lng: report.coordinates.lng }
                    });
                  }}
                >
                  <div className="p-1 rounded-md bg-purple-700 border border-purple-300 text-white shadow-lg cursor-pointer">
                    <FileText className="w-3 h-3" />
                  </div>
                </AdvancedMarker>
              ))}

            {/* 7. Mountain Peaks & High Summits */}
            {mountainPeaks.map((peak) => (
              <AdvancedMarker
                key={`peak_${peak.id}`}
                position={{ lat: peak.coordinates.lat, lng: peak.coordinates.lng }}
                title={`${peak.name} (${peak.elevationMeters}m)`}
                onClick={() => {
                  setInfoWindowTarget({
                    type: 'peak',
                    id: peak.id,
                    position: { lat: peak.coordinates.lat, lng: peak.coordinates.lng }
                  });
                }}
              >
                <div className="p-1 rounded-full bg-slate-900/90 border border-slate-400 text-white shadow-lg cursor-pointer flex items-center gap-1 px-1.5 py-0.5">
                  <Mountain className="w-3 h-3 text-slate-200" />
                  <span className="text-[9px] font-bold text-slate-100">{peak.name} ({peak.elevationMeters}m)</span>
                </div>
              </AdvancedMarker>
            ))}

            {/* 8. Strategic Mountain Passes */}
            {mountainPasses.map((pass) => (
              <AdvancedMarker
                key={`pass_${pass.id}`}
                position={{ lat: pass.coordinates.lat, lng: pass.coordinates.lng }}
                title={`${pass.name} (${pass.elevationMeters}m)`}
                onClick={() => {
                  setInfoWindowTarget({
                    type: 'pass',
                    id: pass.id,
                    position: { lat: pass.coordinates.lat, lng: pass.coordinates.lng }
                  });
                }}
              >
                <div className="p-1 rounded bg-amber-900/90 border border-amber-500 text-amber-200 shadow-lg cursor-pointer flex items-center gap-1 px-1.5 py-0.5">
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span className="text-[9px] font-bold">{pass.name} ({pass.elevationMeters}m)</span>
                </div>
              </AdvancedMarker>
            ))}

            {/* 9. GSI Geohazard Hotspots */}
            {hazardHotspots.map((hazard) => (
              <AdvancedMarker
                key={`gsi_hazard_${hazard.id}`}
                position={{ lat: hazard.coordinates.lat, lng: hazard.coordinates.lng }}
                title={`${hazard.name}: ${hazard.hazardType}`}
                onClick={() => {
                  setInfoWindowTarget({
                    type: 'hazard',
                    id: hazard.id,
                    position: { lat: hazard.coordinates.lat, lng: hazard.coordinates.lng }
                  });
                }}
              >
                <div className="p-1 rounded-full bg-rose-600 border border-white text-white shadow-lg cursor-pointer flex items-center gap-1 px-1.5 py-0.5 animate-pulse">
                  <ShieldAlert className="w-3 h-3" />
                  <span className="text-[9px] font-bold">{hazard.name}</span>
                </div>
              </AdvancedMarker>
            ))}

            {/* Interactive InfoWindow for Inspected Items */}
            {infoWindowTarget && (
              <InfoWindow
                key={`infowin_${infoWindowTarget.type}_${infoWindowTarget.id}`}
                position={infoWindowTarget.position}
                onCloseClick={() => setInfoWindowTarget(null)}
              >
                <div className="p-1 max-w-[280px] text-slate-900 text-xs font-sans">
                  {infoWindowTarget.type === 'segment' && (() => {
                    const seg = segments.find((s) => s.id === infoWindowTarget.id);
                    if (!seg) return null;
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 border-b pb-1">
                          <span className="font-bold text-sm text-slate-900">{seg.highwayCode}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              seg.currentCondition === 'BLOCKED'
                                ? 'bg-red-100 text-red-700'
                                : seg.currentCondition === 'AT_RISK'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {seg.currentCondition}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800">{seg.name}</p>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                          <div>Risk Score: <strong className="text-slate-900">{seg.riskScore}/100</strong></div>
                          <div>Elevation: <strong className="text-slate-900">{seg.averageElevationMeters}m</strong></div>
                          <div>Slope: <strong className="text-slate-900">{seg.slopeAngleDeg}&deg;</strong></div>
                          <div>River Dist: <strong className="text-slate-900">{seg.riverProximityMeters}m</strong></div>
                        </div>

                        {seg.riskFactors?.primaryCause && (
                          <div className="p-1.5 bg-slate-100 rounded text-[10px] text-slate-700">
                            <strong>Cause:</strong> {seg.riskFactors.primaryCause}
                          </div>
                        )}

                        {seg.authorityOverride?.isOverridden && (
                          <div className="p-1.5 bg-red-50 border border-red-200 rounded text-[10px] text-red-800">
                            <strong>Order:</strong> {seg.authorityOverride.orderNumber}
                            <div className="text-[9px] text-red-600">{seg.authorityOverride.officialName} ({seg.authorityOverride.department})</div>
                          </div>
                        )}

                        {onPlanRouteForSegment && seg.currentCondition !== 'OPEN' && (
                          <button
                            onClick={() => onPlanRouteForSegment(seg)}
                            className="w-full mt-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] flex items-center justify-center gap-1"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Calculate Bypass Diversion</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {infoWindowTarget.type === 'shipment' && (() => {
                    const ship = shipments.find((s) => s.id === infoWindowTarget.id);
                    if (!ship) return null;
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between border-b pb-1">
                          <span className="font-bold text-sm text-slate-900">{ship.vehicleNumber}</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                            {ship.commodity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700 space-y-0.5">
                          <div><strong>Cargo:</strong> {ship.cargoDescription} ({ship.cargoWeightTonnes} MT)</div>
                          <div><strong>Driver:</strong> {ship.driverName} ({ship.driverPhone})</div>
                          <div><strong>Planned ETA:</strong> {ship.plannedEta}</div>
                          {ship.estimatedDelayMinutes > 0 ? (
                            <div className="text-red-600 font-semibold">
                              Delay: +{ship.estimatedDelayMinutes} mins due to corridor disruption
                            </div>
                          ) : (
                            <div className="text-emerald-600 font-semibold">Transit On Schedule</div>
                          )}
                          {ship.isTemperatureSensitive && (
                            <div><strong>Cold-Chain:</strong> Monitoring Active (2-8&deg;C)</div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {infoWindowTarget.type === 'cwc' && (() => {
                    const gauge = cwcFeeds.find((g) => g.stationName === infoWindowTarget.id);
                    if (!gauge) return null;
                    return (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 border-b pb-0.5 flex items-center justify-between">
                          <span>{gauge.stationName}</span>
                          <span className={gauge.status === 'ABOVE_DANGER' ? 'text-red-600 font-bold' : 'text-cyan-700 font-semibold'}>
                            {gauge.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700">
                          <div>River: <strong>{gauge.river}</strong></div>
                          <div>Water Level: <strong>{gauge.currentWaterLevelM}m</strong> (Danger: {gauge.dangerLevelM}m)</div>
                          <div>Trend: <strong>{gauge.trend}</strong></div>
                          <div>Warning Level: {gauge.warningLevelM}m</div>
                        </div>
                      </div>
                    );
                  })()}

                  {infoWindowTarget.type === 'report' && (() => {
                    const report = fieldReports.find((r) => r.id === infoWindowTarget.id);
                    if (!report) return null;
                    return (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 border-b pb-0.5 flex items-center justify-between">
                          <span>Ground Field Report</span>
                          <span className="text-purple-700 font-bold">{report.category}</span>
                        </div>
                        <p className="text-[11px] text-slate-700">{report.description}</p>
                        <div className="text-[10px] text-slate-500">
                          By: {report.authorName} ({report.role}) &bull; {report.timestamp}
                        </div>
                      </div>
                    );
                  })()}

                  {infoWindowTarget.type === 'node' && (() => {
                    const node = nodes.find((n) => n.id === infoWindowTarget.id);
                    if (!node) return null;
                    return (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 border-b pb-0.5">{node.name}</div>
                        <div className="text-[11px] text-slate-700">
                          <div>District: {node.district}, {node.state}</div>
                          <div>Elevation: <strong>{node.elevationMeters}m AMSL</strong></div>
                          {node.populationServed && (
                            <div>Population Served: <strong>{node.populationServed.toLocaleString()}</strong></div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {infoWindowTarget.type === 'peak' && (() => {
                    const peak = mountainPeaks.find((p) => p.id === infoWindowTarget.id);
                    if (!peak) return null;
                    return (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 border-b pb-0.5 flex items-center justify-between">
                          <span>{peak.name}</span>
                          <span className="text-amber-700 font-bold">{peak.elevationMeters}m MSL</span>
                        </div>
                        <div className="text-[11px] text-slate-700">
                          <div>Range: <strong>{peak.range}</strong></div>
                          <p className="mt-1 text-[10px] text-slate-600 leading-snug">{peak.description}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {infoWindowTarget.type === 'pass' && (() => {
                    const pass = mountainPasses.find((p) => p.id === infoWindowTarget.id);
                    if (!pass) return null;
                    return (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 border-b pb-0.5 flex items-center justify-between">
                          <span>{pass.name}</span>
                          <span className="text-amber-700 font-bold">{pass.elevationMeters}m MSL</span>
                        </div>
                        <div className="text-[11px] text-slate-700">
                          <div>Status: <span className="font-bold text-amber-600">{pass.status}</span></div>
                          <p className="mt-1 text-[10px] text-slate-600 leading-snug">{pass.significance}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {infoWindowTarget.type === 'hazard' && (() => {
                    const hazard = hazardHotspots.find((h) => h.id === infoWindowTarget.id);
                    if (!hazard) return null;
                    return (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 border-b pb-0.5 flex items-center justify-between">
                          <span className="text-rose-700">{hazard.name}</span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                            {hazard.severity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700">
                          <div>Hazard: <strong>{hazard.hazardType}</strong></div>
                          <div>Rainfall Trigger: <strong>{hazard.triggerThresholdMm} mm / 24h</strong></div>
                          <div>Historical Incidents: <strong>{hazard.historicalIncidents} slides</strong></div>
                          <p className="mt-1 text-[10px] text-slate-600 leading-snug">{hazard.description}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
        </ErrorBoundary>
      )}
      </div>

      {/* Manual API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                <Key className="w-4 h-4 text-blue-400" />
                Configure Google Maps Platform Key
              </h4>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your Google Maps Platform API key or a Maps Demo Key. It will be loaded securely in your active session.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-medium block">
                API Key (or Demo Key)
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Need a key?</div>
              <div>
                1. Visit the{' '}
                <a
                  href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline font-medium"
                >
                  Google Maps Demo Key Quickstart
                </a>{' '}
                (no billing required).
              </div>
              <div>2. Generate your prototyping key and paste it above.</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveCustomKey(customKeyInput)}
                disabled={!customKeyInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium shadow"
              >
                Save &amp; Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
