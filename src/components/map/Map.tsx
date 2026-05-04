'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, {
  type LngLatBoundsLike,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster from 'supercluster';
import type { BBox, Feature, Point } from 'geojson';
import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';
import { colorForEntity } from '@/lib/map/categoryColors';
import { colorForDay } from '@/lib/map/dayColors';
import { glyphForEntity } from '@/lib/map/pinIcons';
import {
  estimateTransit,
  formatSegmentLabel,
} from '@/lib/geo/transitEstimate';
import periploLight from '@/lib/map/periplo-map-style.json';
import periploDark from '@/lib/map/periplo-map-style-dark.json';
import { MapControls } from './MapControls';

const TRANSIT_LABEL_MIN_ZOOM = 12;
const CLUSTER_THRESHOLD = 6;
const ROUTE_LAYER_ID_PREFIX = 'tg-route-';
const FALLBACK_CENTER: [number, number] = [2.3522, 48.8566]; // Paris [lng, lat]

const LIGHT_STYLE = periploLight as unknown as StyleSpecification;
const DARK_STYLE = periploDark as unknown as StyleSpecification;

export interface MapPinData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  entityType?: string;
  dayIndex?: number;
  number?: number;
  selected?: boolean;
}

interface Props {
  pins: MapPinData[];
  activePinId: string | null;
  onPinHover?: (id: string | null) => void;
  onPinClick?: (id: string) => void;
  className?: string;
  connectByDay?: boolean;
  focusPin?: { lat: number; lng: number } | null;
  onFullscreenToggle?: () => void;
  fullscreen?: boolean;
}

type LngLatBounds = [[number, number], [number, number]] | null;

interface DayGroup {
  dayIndex: number;
  pins: MapPinData[];
}

// Properties stored on each supercluster point feature so we can rebuild the
// pin DOM after `getClusters()` returns aggregated features.
interface PointProps {
  pinId: string;
  pinLat: number;
  pinLng: number;
  title: string;
  entityType?: string;
  dayIndex?: number;
  number?: number;
  selected?: boolean;
}

export default function MapComponent({
  pins,
  activePinId,
  onPinHover,
  onPinClick,
  className,
  connectByDay = false,
  focusPin,
  onFullscreenToggle,
  fullscreen,
}: Props) {
  const { mode, systemMode } = useColorScheme();
  const theme: 'light' | 'dark' =
    (mode === 'system' ? systemMode : mode) === 'dark' ? 'dark' : 'light';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  // Markers indexed by id (`pin-<id>` for points, `cluster-<id>` for clusters).
  // Reused across re-renders so we only churn the DOM that actually changed.
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const transitMarkersRef = useRef<maplibregl.Marker[]>([]);
  // Maps `cluster-<id>` → set of pin IDs the cluster contains. Lets the
  // hover highlight effect light up a collapsed cluster when its leaf
  // is the activePinId, without re-running supercluster.
  const clusterLeavesRef = useRef<Map<string, Set<string>>>(new Map());

  // Latest props mirrored into refs so the moveend listener (set up once)
  // always reads fresh values without re-attaching.
  const handlerRef = useRef({ onPinHover, onPinClick, activePinId, theme });
  handlerRef.current = { onPinHover, onPinClick, activePinId, theme };

  const bounds = useMemo<LngLatBounds>(() => {
    if (pins.length === 0) return null;
    let minLat = pins[0].lat;
    let maxLat = pins[0].lat;
    let minLng = pins[0].lng;
    let maxLng = pins[0].lng;
    for (const p of pins) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }
    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ];
  }, [pins]);

  const dayGroups = useMemo(() => groupPinsByDay(pins), [pins]);
  const useClustering = pins.length >= CLUSTER_THRESHOLD;

  // ───────────────────────────────────────────────────── Map lifecycle ──
  // Single-shot init. Style swap on theme change happens in a separate
  // effect via `map.setStyle()`, which keeps the GL context alive and
  // markers attached.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = pins.length
      ? [pins[0].lng, pins[0].lat]
      : FALLBACK_CENTER;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: theme === 'dark' ? DARK_STYLE : LIGHT_STYLE,
      center: initialCenter,
      zoom: pins.length ? 12 : 3,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution:
          '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a> <a href="https://openfreemap.org/" target="_blank" rel="noreferrer">© OpenFreeMap</a>',
      }),
      'bottom-right',
    );

    mapRef.current = map;
    setMapInstance(map);

    // Container resize → tell GL canvas to re-measure. Replaces Leaflet's
    // invalidateSize().
    const ro = new ResizeObserver(() => {
      map.resize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      for (const marker of markersRef.current.values()) marker.remove();
      markersRef.current.clear();
      for (const marker of transitMarkersRef.current) marker.remove();
      transitMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
    };
    // Initial center / zoom only matter on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────── Theme swap ──
  // setStyle preserves the canvas + markers (markers live in the DOM, not
  // GL), but layers and sources we own (route lines) get nuked. We
  // re-add them after the new style finishes loading via the routes
  // effect — its dep array includes `theme` so it fires after a swap.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(theme === 'dark' ? DARK_STYLE : LIGHT_STYLE);
  }, [theme]);

  // ─────────────────────────────────────────────────── Bounds fit ──
  const didInitialFit = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !bounds) return;
    map.fitBounds(bounds as LngLatBoundsLike, {
      padding: { top: 60, right: 80, bottom: 60, left: 80 },
      maxZoom: 15,
      duration: didInitialFit.current ? 500 : 0,
    });
    didInitialFit.current = true;
  }, [bounds]);

  // ─────────────────────────────────────────────────── Focus pin ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusPin) return;
    const targetZoom = Math.max(map.getZoom(), 14);
    map.flyTo({
      center: [focusPin.lng, focusPin.lat],
      zoom: targetZoom,
      duration: 600,
      essential: true,
    });
  }, [focusPin]);

  // ─────────────────────────────────────────────────── Routes ──
  // Day-route GeoJSON line layers. Re-added on every theme change because
  // setStyle wipes our custom layers; gated on style.load.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      // Remove stale route layers/sources from previous day-group sets
      // or from the discarded pre-setStyle state.
      const style = map.getStyle();
      if (style && style.layers) {
        for (const layer of style.layers) {
          if (layer.id.startsWith(ROUTE_LAYER_ID_PREFIX)) {
            if (map.getLayer(layer.id)) map.removeLayer(layer.id);
            if (map.getSource(layer.id)) map.removeSource(layer.id);
          }
        }
      }
      if (!connectByDay) return;
      for (const group of dayGroups) {
        if (group.pins.length < 2) continue;
        const id = `${ROUTE_LAYER_ID_PREFIX}${group.dayIndex}`;
        const data: Feature<{ type: 'LineString'; coordinates: [number, number][] }> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: group.pins.map((p) => [p.lng, p.lat] as [number, number]),
          },
        } as unknown as Feature<{
          type: 'LineString';
          coordinates: [number, number][];
        }>;
        map.addSource(id, { type: 'geojson', data: data as never });
        map.addLayer({
          id,
          type: 'line',
          source: id,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': colorForDay(group.dayIndex),
            'line-width': 3,
            'line-opacity': 0.7,
            'line-dasharray': [2, 1.25],
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      apply();
    } else {
      const onLoad = () => apply();
      map.once('style.load', onLoad);
      return () => {
        map.off('style.load', onLoad);
      };
    }
  }, [dayGroups, connectByDay, theme]);

  // ─────────────────────────────────────────────────── Pin markers ──
  // Cluster mode: rebuild on every moveend/zoomend. Non-cluster mode:
  // build once per pin set, then mutate `tg-pin--selected` class on
  // highlight change in a sibling effect (cheaper than re-creating DOM
  // for every hover frame).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (useClustering) {
      const clusterIndex = new Supercluster<PointProps, { point_count: number }>({
        radius: 48,
        minPoints: 3,
        maxZoom: 16,
      });
      clusterIndex.load(
        pins.map(
          (p): Feature<Point, PointProps> => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            properties: {
              pinId: p.id,
              pinLat: p.lat,
              pinLng: p.lng,
              title: p.title,
              entityType: p.entityType,
              dayIndex: p.dayIndex,
              number: p.number,
              selected: p.selected,
            },
          }),
        ),
      );

      const renderClusters = () => {
        const b = map.getBounds();
        const bbox: BBox = [
          b.getWest(),
          b.getSouth(),
          b.getEast(),
          b.getNorth(),
        ];
        const zoom = Math.round(map.getZoom());
        const features = clusterIndex.getClusters(bbox, zoom);
        const nextIds = new Set<string>();
        const { activePinId: activeId, theme: t } = handlerRef.current;
        // Refresh the cluster→leaves index from scratch each render. Stale
        // cluster ids drop out automatically.
        clusterLeavesRef.current.clear();

        for (const f of features) {
          const props = f.properties as
            | (PointProps & { cluster?: false })
            | { cluster: true; cluster_id: number; point_count: number };
          const [lng, lat] = (f.geometry as Point).coordinates as [number, number];

          if ('cluster' in props && props.cluster) {
            const id = `cluster-${props.cluster_id}`;
            nextIds.add(id);
            const leaves = clusterIndex.getLeaves(
              props.cluster_id,
              Infinity,
              0,
            );
            const leafIds = new Set(
              leaves.map((l) => (l.properties as PointProps).pinId),
            );
            clusterLeavesRef.current.set(id, leafIds);
            const containsActive =
              activeId != null && leafIds.has(activeId);
            const existing = markersRef.current.get(id);
            if (existing) {
              existing.setLngLat([lng, lat]);
              applyClusterActiveClass(existing.getElement(), containsActive);
              continue;
            }
            const el = buildClusterEl(props.point_count, t);
            applyClusterActiveClass(el, containsActive);
            el.addEventListener('click', (e) => {
              e.stopPropagation();
              const expansion = clusterIndex.getClusterExpansionZoom(
                props.cluster_id,
              );
              map.easeTo({
                center: [lng, lat],
                zoom: Math.min(expansion + 0.01, 18),
                duration: 350,
              });
            });
            const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
              .setLngLat([lng, lat])
              .addTo(map);
            markersRef.current.set(id, marker);
          } else {
            const p = props as PointProps;
            const id = `pin-${p.pinId}`;
            nextIds.add(id);
            const isActive = activeId === p.pinId || p.selected === true;
            const existing = markersRef.current.get(id);
            if (existing) {
              existing.setLngLat([lng, lat]);
              applySelectedClass(existing.getElement(), isActive);
              continue;
            }
            const el = buildPinEl(p, isActive, t);
            attachPinHandlers(el, p.pinId);
            const marker = new maplibregl.Marker({
              element: el,
              anchor: 'bottom',
            })
              .setLngLat([lng, lat])
              .addTo(map);
            markersRef.current.set(id, marker);
          }
        }

        for (const [id, marker] of markersRef.current) {
          if (!nextIds.has(id)) {
            marker.remove();
            markersRef.current.delete(id);
          }
        }
      };

      renderClusters();
      map.on('moveend', renderClusters);
      map.on('zoomend', renderClusters);

      return () => {
        map.off('moveend', renderClusters);
        map.off('zoomend', renderClusters);
        for (const marker of markersRef.current.values()) marker.remove();
        markersRef.current.clear();
      };
    }

    // Non-cluster mode: 1 marker per pin, kept until the pin set changes.
    const nextIds = new Set<string>();
    const { activePinId: activeId, theme: t } = handlerRef.current;
    for (const p of pins) {
      const id = `pin-${p.id}`;
      nextIds.add(id);
      const isActive = activeId === p.id || p.selected === true;
      const existing = markersRef.current.get(id);
      if (existing) {
        existing.setLngLat([p.lng, p.lat]);
        applySelectedClass(existing.getElement(), isActive);
        continue;
      }
      const el = buildPinEl(
        {
          pinId: p.id,
          pinLat: p.lat,
          pinLng: p.lng,
          title: p.title,
          entityType: p.entityType,
          dayIndex: p.dayIndex,
          number: p.number,
          selected: p.selected,
        },
        isActive,
        t,
      );
      attachPinHandlers(el, p.id);
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
      markersRef.current.set(id, marker);
    }
    for (const [id, marker] of markersRef.current) {
      if (!nextIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
    // No moveend listener in non-cluster mode — markers are static.

    function attachPinHandlers(el: HTMLElement, pinId: string) {
      el.addEventListener('mouseenter', () => {
        handlerRef.current.onPinHover?.(pinId);
      });
      el.addEventListener('mouseleave', () => {
        handlerRef.current.onPinHover?.(null);
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        handlerRef.current.onPinClick?.(pinId);
      });
    }
  }, [pins, useClustering]);

  // ─────────────────────────────────────────────────── Highlight ──
  // Pure DOM class toggle on existing markers — avoid rebuilding pins
  // for hover/select changes.
  // Non-cluster mode: flip `tg-pin--selected` on the matching pin.
  // Cluster mode: pins not currently visible because they're inside a
  // cluster bubble can't show their highlight; light up the *cluster*
  // instead so the user sees the affordance.
  useEffect(() => {
    if (useClustering) {
      for (const [clusterId, leafIds] of clusterLeavesRef.current) {
        const marker = markersRef.current.get(clusterId);
        if (!marker) continue;
        const contains =
          activePinId != null && leafIds.has(activePinId);
        applyClusterActiveClass(marker.getElement(), contains);
      }
      // Visible (un-clustered) leaves still get the pin-level highlight.
      for (const p of pins) {
        const marker = markersRef.current.get(`pin-${p.id}`);
        if (!marker) continue;
        const isActive = activePinId === p.id || p.selected === true;
        applySelectedClass(marker.getElement(), isActive);
      }
      return;
    }
    for (const p of pins) {
      const marker = markersRef.current.get(`pin-${p.id}`);
      if (!marker) continue;
      const isActive = activePinId === p.id || p.selected === true;
      applySelectedClass(marker.getElement(), isActive);
    }
  }, [activePinId, pins, useClustering]);

  // ─────────────────────────────────────────────────── Transit labels ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      // Tear down whatever was there.
      for (const m of transitMarkersRef.current) m.remove();
      transitMarkersRef.current = [];
      if (!connectByDay) return;
      if (map.getZoom() < TRANSIT_LABEL_MIN_ZOOM) return;
      for (const group of dayGroups) {
        for (let i = 0; i < group.pins.length - 1; i += 1) {
          const a = group.pins[i];
          const b = group.pins[i + 1];
          const estimate = estimateTransit(
            { lat: a.lat, lng: a.lng },
            { lat: b.lat, lng: b.lng },
          );
          const labelText = formatSegmentLabel(estimate);
          const el = document.createElement('div');
          el.className = 'tg-transit-label';
          el.textContent = labelText;
          const marker = new maplibregl.Marker({
            element: el,
            anchor: 'center',
          })
            .setLngLat([(a.lng + b.lng) / 2, (a.lat + b.lat) / 2])
            .addTo(map);
          transitMarkersRef.current.push(marker);
        }
      }
    };

    apply();
    map.on('zoomend', apply);
    return () => {
      map.off('zoomend', apply);
      for (const m of transitMarkersRef.current) m.remove();
      transitMarkersRef.current = [];
    };
  }, [dayGroups, connectByDay]);

  return (
    <Box
      className={className}
      sx={{
        height: '100%',
        width: '100%',
        position: 'relative',
        '& .maplibregl-canvas': { outline: 'none' },
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          height: '100%',
          width: '100%',
          background: (t) => t.palette.background.paper,
        }}
      />
      <MapControls
        map={mapInstance}
        bounds={bounds}
        onFullscreenToggle={onFullscreenToggle}
        fullscreen={fullscreen}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────── helpers ──

function buildPinEl(
  pin: PointProps,
  selected: boolean,
  theme: 'light' | 'dark',
): HTMLDivElement {
  const color =
    pin.number != null
      ? colorForDay(pin.dayIndex ?? 0)
      : colorForEntity(pin.entityType, theme);
  const inner =
    pin.number != null
      ? `<span class="tg-pin__number">${pin.number}</span>`
      : `<span class="tg-pin__glyph">${glyphForEntity(pin.entityType)}</span>`;
  const el = document.createElement('div');
  el.className = selected ? 'tg-pin tg-pin--selected' : 'tg-pin';
  el.style.setProperty('--tg-pin-color', color);
  el.title = pin.title;
  el.innerHTML =
    `<span class="tg-pin__halo" aria-hidden="true"></span>` +
    `<span class="tg-pin__core">${inner}</span>` +
    `<span class="tg-pin__tail" aria-hidden="true"></span>`;
  return el;
}

function buildClusterEl(count: number, theme: 'light' | 'dark'): HTMLDivElement {
  const size = count < 10 ? 36 : count < 50 ? 42 : 50;
  const fontSize = count < 10 ? 13 : count < 50 ? 14 : 15;
  const el = document.createElement('div');
  el.className = 'tg-cluster';
  el.dataset.tgClusterTheme = theme;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.fontSize = `${fontSize}px`;
  el.innerHTML = `<span class="tg-cluster__count">${count}</span>`;
  return el;
}

function applySelectedClass(el: HTMLElement, selected: boolean): void {
  if (selected) el.classList.add('tg-pin--selected');
  else el.classList.remove('tg-pin--selected');
}

function applyClusterActiveClass(el: HTMLElement, active: boolean): void {
  if (active) el.classList.add('tg-cluster--active');
  else el.classList.remove('tg-cluster--active');
}

function groupPinsByDay(pins: MapPinData[]): DayGroup[] {
  const groups: Record<number, MapPinData[]> = {};
  for (const pin of pins) {
    if (pin.dayIndex == null || pin.number == null) continue;
    const list = groups[pin.dayIndex];
    if (list) list.push(pin);
    else groups[pin.dayIndex] = [pin];
  }
  const result: DayGroup[] = [];
  for (const key of Object.keys(groups)) {
    const dayIndex = Number(key);
    const list = groups[dayIndex];
    if (list.length < 2) continue;
    list.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    result.push({ dayIndex, pins: list });
  }
  result.sort((a, b) => a.dayIndex - b.dayIndex);
  return result;
}
