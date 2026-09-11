import React, { useState } from 'react';
import {
  TrackedShipment,
  RoadSegment,
  CommodityType,
  ShipmentStatus,
  SupportedLanguage
} from '../types';
import { translations } from '../services/i18n';
import {
  Truck,
  Thermometer,
  Clock,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface FleetLogisticsViewProps {
  shipments: TrackedShipment[];
  segments: RoadSegment[];
  currentLanguage: SupportedLanguage;
  onUpdateShipment: (updated: TrackedShipment) => void;
  onSelectShipmentToMap?: (shipmentId: string) => void;
}

export const FleetLogisticsView: React.FC<FleetLogisticsViewProps> = ({
  shipments,
  segments,
  currentLanguage,
  onUpdateShipment,
  onSelectShipmentToMap
}) => {
  const t = translations[currentLanguage];

  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(shipments[0]?.id || '');
  const [filterCommodity, setFilterCommodity] = useState<string>('ALL');
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeShipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];

  // Quick Action: Push Alternate Route Diversion
  const handlePushDiversion = (shipment: TrackedShipment) => {
    const updated: TrackedShipment = {
      ...shipment,
      assignedRouteTitle: 'Diverted via NH-717A (Lava-Algarah Safe By-pass)',
      estimatedDelayMinutes: Math.max(0, shipment.estimatedDelayMinutes - 45),
      status: 'IN_TRANSIT',
      speedKmh: 35
    };

    onUpdateShipment(updated);
    setActionNotice(
      `Emergency diversion instructions sent via SMS to Driver ${shipment.driverName} (${shipment.driverPhone}). Route switched to NH-717A.`
    );
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Quick Action: Prioritize Convoy Clearance (Green Corridor)
  const handleRequestGreenCorridor = (shipment: TrackedShipment) => {
    setActionNotice(
      `Police Traffic Escort & Green Corridor requested from Gangtok Traffic HQ for ${shipment.vehicleNumber} carrying ${shipment.cargoDescription}.`
    );
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Filtered shipments
  const filteredShipments = shipments.filter((s) => {
    if (filterCommodity === 'ALL') return true;
    return s.commodity === filterCommodity;
  });

  const totalTonnage = shipments.reduce((acc, curr) => acc + curr.cargoWeightTonnes, 0);
  const delayedCount = shipments.filter((s) => s.status === 'DELAYED').length;
  const coldChainCount = shipments.filter((s) => s.isTemperatureSensitive).length;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-950 text-blue-400 border border-blue-700/60 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              PRD Phase 5
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" /> Essential Logistics & Fleet Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end GPS telemetry tracking, priority dispatch for life-saving medicine/food, and dynamic in-transit re-routing.
          </p>
        </div>

        {/* Commodity filters */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
          {(['ALL', 'MEDICINE', 'FOOD', 'CONSTRUCTION', 'AGRICULTURE'] as const).map((comm) => (
            <button
              key={comm}
              onClick={() => setFilterCommodity(comm)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterCommodity === comm
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {comm === 'ALL' ? 'All Convoys' : comm}
            </button>
          ))}
        </div>
      </div>

      {actionNotice && (
        <div className="bg-blue-950/80 border border-blue-700 text-blue-200 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Fleet Overview Metrics (FR5.1 & FR5.4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Active Convoys</span>
          <p className="text-lg font-extrabold text-white font-mono mt-0.5">
            {shipments.length} Vehicles
          </p>
          <span className="text-[10px] text-emerald-400">100% Cellular/GPS Pinging</span>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Essential Cargo Tonnage</span>
          <p className="text-lg font-extrabold text-blue-400 font-mono mt-0.5">
            {totalTonnage.toFixed(1)} MT
          </p>
          <span className="text-[10px] text-slate-400">Medicines, Foodgrain, Fuel</span>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Cold-Chain Vaccines</span>
          <p className="text-lg font-extrabold text-cyan-400 font-mono mt-0.5">
            {coldChainCount} Active
          </p>
          <span className="text-[10px] text-cyan-300 flex items-center gap-1">
            <Thermometer className="w-3 h-3" /> 2°C - 8°C Monitored
          </span>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Disruption Impact</span>
          <p className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">
            {delayedCount} Delayed
          </p>
          <span className="text-[10px] text-slate-400">Re-route Detours Assigned</span>
        </div>
      </div>

      {/* Main Fleet Workspace: List of Vehicles + Selected Vehicle Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shipment List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Active Convoys in NER Transit</h3>
            <span className="text-xs text-slate-400">
              Showing {filteredShipments.length} of {shipments.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredShipments.map((shipment) => {
              const isSelected = shipment.id === selectedShipmentId;

              return (
                <div
                  key={shipment.id}
                  onClick={() => {
                    setSelectedShipmentId(shipment.id);
                    if (onSelectShipmentToMap) onSelectShipmentToMap(shipment.id);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                      : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            shipment.commodity === 'MEDICINE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : shipment.commodity === 'FOOD'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                          }`}
                        >
                          {shipment.commodity}
                        </span>
                        <h4 className="font-bold text-xs text-white">{shipment.vehicleNumber}</h4>
                        {shipment.isTemperatureSensitive && (
                          <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center gap-0.5">
                            <Thermometer className="w-2.5 h-2.5" /> Cold-Chain
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 mt-1 font-medium">
                        {shipment.cargoDescription} ({shipment.cargoWeightTonnes} MT)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Route: {shipment.originNodeId} &rarr; {shipment.destinationNodeId}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded block ${
                          shipment.status === 'DELAYED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}
                      >
                        {shipment.status} ({shipment.speedKmh} km/h)
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 mt-1 block">
                        ETA: {shipment.plannedEta}
                      </span>
                      {shipment.estimatedDelayMinutes > 0 && (
                        <span className="text-[10px] font-mono text-rose-400 font-bold block">
                          +{shipment.estimatedDelayMinutes}m delay
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Shipment Cockpit (FR5.2 & FR5.3) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-400">
                  Vehicle Telemetry Cockpit
                </span>
                <h3 className="font-bold text-sm text-white">{activeShipment.vehicleNumber}</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeShipment.currentLat.toFixed(4)}°N, {activeShipment.currentLng.toFixed(4)}°E
              </span>
            </div>

            {/* Cargo & Driver Summary */}
            <div className="space-y-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cargo:</span>
                  <span className="font-semibold text-white">{activeShipment.cargoDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver:</span>
                  <span className="font-semibold text-slate-200">
                    {activeShipment.driverName} ({activeShipment.driverPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Path:</span>
                  <span className="font-semibold text-blue-300 text-right truncate max-w-[200px]">
                    {activeShipment.assignedRouteTitle}
                  </span>
                </div>
              </div>

              {/* Cold-Chain sensor widget if temperature sensitive */}
              {activeShipment.isTemperatureSensitive && (
                <div className="bg-cyan-950/40 border border-cyan-800/70 p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-cyan-200">
                    <span className="font-bold flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> Active Cold-Chain Telemetry
                    </span>
                    <span className="font-mono font-bold bg-cyan-900/60 px-2 py-0.5 rounded text-cyan-300">
                      +4.2°C
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-300/80">
                    Reefer temperature compliant with WHO vaccine storage guidelines (2°C to 8°C).
                  </p>
                </div>
              )}

              {/* Delay Warning if affected */}
              {activeShipment.estimatedDelayMinutes > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Route Disruption Ahead
                    </span>
                    <span className="font-mono">+{activeShipment.estimatedDelayMinutes} mins</span>
                  </div>
                  <p className="text-[10px] text-amber-200/80">
                    Current trajectory passes through at-risk or blocked corridor segment. Re-routing recommended.
                  </p>
                </div>
              )}

              {/* Control Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handlePushDiversion(activeShipment)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Navigation className="w-3.5 h-3.5" /> Push Safe Alternate Route Diversion
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRequestGreenCorridor(activeShipment)}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded text-[11px] flex items-center justify-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3 text-amber-400" /> Green Corridor
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionNotice(`Calling Driver ${activeShipment.driverName} at ${activeShipment.driverPhone}...`);
                      setTimeout(() => setActionNotice(null), 3000);
                    }}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded text-[11px] flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" /> Call Driver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
