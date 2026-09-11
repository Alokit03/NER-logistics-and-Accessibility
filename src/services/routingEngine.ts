import { GraphNode, RoadSegment, RouteOption } from '../types';

interface GraphEdge {
  segment: RoadSegment;
  targetNodeId: string;
}

export function buildAdjacencyList(segments: RoadSegment[]): Map<string, GraphEdge[]> {
  const adj = new Map<string, GraphEdge[]>();

  segments.forEach((seg) => {
    // Bidirectional roads
    if (!adj.has(seg.fromNodeId)) adj.set(seg.fromNodeId, []);
    if (!adj.has(seg.toNodeId)) adj.set(seg.toNodeId, []);

    adj.get(seg.fromNodeId)!.push({ segment: seg, targetNodeId: seg.toNodeId });
    adj.get(seg.toNodeId)!.push({ segment: seg, targetNodeId: seg.fromNodeId });
  });

  return adj;
}

/**
 * Calculates Dijkstra paths: both shortest standard path and risk-minimized safe alternate path.
 */
export function calculateRoutes(
  originNodeId: string,
  destinationNodeId: string,
  nodes: GraphNode[],
  segments: RoadSegment[]
): RouteOption[] {
  if (originNodeId === destinationNodeId) return [];

  const adj = buildAdjacencyList(segments);
  const segmentMap = new Map<string, RoadSegment>();
  segments.forEach((s) => segmentMap.set(s.id, s));

  // Helper to run Dijkstra with specific cost evaluator
  function findPath(
    costEvaluator: (seg: RoadSegment) => { edgeCost: number; isTraversable: boolean }
  ): { segments: RoadSegment[]; totalCost: number } | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, { nodeId: string; segment: RoadSegment }>();
    const unvisited = new Set<string>();

    nodes.forEach((n) => {
      distances.set(n.id, Infinity);
      unvisited.add(n.id);
    });

    distances.set(originNodeId, 0);

    while (unvisited.size > 0) {
      let currentMinNode: string | null = null;
      let minDistance = Infinity;

      unvisited.forEach((nodeId) => {
        const dist = distances.get(nodeId) || Infinity;
        if (dist < minDistance) {
          minDistance = dist;
          currentMinNode = nodeId;
        }
      });

      if (!currentMinNode || minDistance === Infinity) break;
      if (currentMinNode === destinationNodeId) break;

      unvisited.delete(currentMinNode);

      const neighbors = adj.get(currentMinNode) || [];
      for (const edge of neighbors) {
        if (!unvisited.has(edge.targetNodeId)) continue;

        const { edgeCost, isTraversable } = costEvaluator(edge.segment);
        if (!isTraversable) continue;

        const newDist = minDistance + edgeCost;
        if (newDist < (distances.get(edge.targetNodeId) || Infinity)) {
          distances.set(edge.targetNodeId, newDist);
          previous.set(edge.targetNodeId, { nodeId: currentMinNode, segment: edge.segment });
        }
      }
    }

    if (!previous.has(destinationNodeId) && originNodeId !== destinationNodeId) {
      return null;
    }

    // Reconstruct path
    const path: RoadSegment[] = [];
    let curr = destinationNodeId;
    while (curr !== originNodeId) {
      const step = previous.get(curr);
      if (!step) break;
      path.unshift(step.segment);
      curr = step.nodeId;
    }

    return { segments: path, totalCost: distances.get(destinationNodeId) || 0 };
  }

  // 1. Direct standard shortest path (ignoring blockage to show what the standard GPS would give)
  const standardResult = findPath((seg) => {
    return { edgeCost: seg.lengthKm, isTraversable: true };
  });

  // 2. Safe Alternate Path: strictly avoids BLOCKED roads and adds high penalty for high risk
  const safeResult = findPath((seg) => {
    if (seg.currentCondition === 'BLOCKED') {
      return { edgeCost: 999999, isTraversable: false };
    }
    // Risk penalty multiplier: risk 0-100 gives 1.0x to 4.0x cost
    const penalty = 1 + Math.pow(seg.riskScore / 50, 2);
    return { edgeCost: seg.lengthKm * penalty, isTraversable: true };
  });

  const routes: RouteOption[] = [];

  // Construct Safe Alternate Route
  if (safeResult && safeResult.segments.length > 0) {
    const totalDist = safeResult.segments.reduce((sum, s) => sum + s.lengthKm, 0);
    const avgRisk = Math.round(
      safeResult.segments.reduce((sum, s) => sum + s.riskScore, 0) / safeResult.segments.length
    );
    const maxRisk = Math.max(...safeResult.segments.map((s) => s.riskScore));
    // Base speed ~35 km/h in hill terrain
    const standardDuration = Math.round((totalDist / 35) * 60);
    // Delay derived from road conditions
    const delay = safeResult.segments.reduce((d, s) => {
      if (s.currentCondition === 'AT_RISK') return d + 20;
      if (s.currentCondition === 'RESTRICTED') return d + 35;
      return d;
    }, 0);

    routes.push({
      id: 'route_safe_recommended',
      title: 'Recommended Safe Alternate Route',
      isRecommended: true,
      isBlocked: false,
      pathSegmentIds: safeResult.segments.map((s) => s.id),
      totalDistanceKm: totalDist,
      standardDurationMin: standardDuration,
      estimatedDelayMin: delay,
      totalEstimatedTimeMin: standardDuration + delay,
      averageRiskScore: avgRisk,
      maxSegmentRisk: maxRisk,
      criticalSegments: safeResult.segments.filter((s) => s.riskScore > 65).map((s) => s.name),
      safetyMarginPercentage: Math.max(10, 100 - avgRisk)
    });
  }

  // Construct Standard Direct Route (to compare)
  if (standardResult && standardResult.segments.length > 0) {
    const totalDist = standardResult.segments.reduce((sum, s) => sum + s.lengthKm, 0);
    const isBlocked = standardResult.segments.some((s) => s.currentCondition === 'BLOCKED');
    const avgRisk = Math.round(
      standardResult.segments.reduce((sum, s) => sum + s.riskScore, 0) / standardResult.segments.length
    );
    const maxRisk = Math.max(...standardResult.segments.map((s) => s.riskScore));
    const standardDuration = Math.round((totalDist / 40) * 60);
    const delay = isBlocked ? 240 : 45;

    // Only add as second route if it differs from safe route
    const isSameAsSafe =
      routes.length > 0 &&
      routes[0].pathSegmentIds.join(',') === standardResult.segments.map((s) => s.id).join(',');

    if (!isSameAsSafe) {
      routes.push({
        id: 'route_direct_standard',
        title: isBlocked ? 'Direct Corridor (BLOCKED / IMPASSABLE)' : 'Direct Highway Alignment',
        isRecommended: !isBlocked && avgRisk < 50,
        isBlocked,
        pathSegmentIds: standardResult.segments.map((s) => s.id),
        totalDistanceKm: totalDist,
        standardDurationMin: standardDuration,
        estimatedDelayMin: delay,
        totalEstimatedTimeMin: standardDuration + delay,
        averageRiskScore: avgRisk,
        maxSegmentRisk: maxRisk,
        criticalSegments: standardResult.segments
          .filter((s) => s.currentCondition === 'BLOCKED' || s.riskScore > 75)
          .map((s) => s.name),
        safetyMarginPercentage: Math.max(5, 100 - avgRisk)
      });
    }
  }

  return routes;
}
