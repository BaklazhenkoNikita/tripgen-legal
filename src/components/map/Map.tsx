'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L, { type LatLngBoundsLiteral } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import Box from '@mui/material/Box';
import { colorForEntity } from '@/lib/map/categoryColors';
import { colorForDay } from '@/lib/map/dayColors';
import { glyphForEntity } from '@/lib/map/pinIcons';
import {
  estimateTransit,
  formatSegmentLabel,
} from '@/lib/geo/transitEstimate';
import { useColorScheme } from '@mui/material/styles';
import { MapControls } from './MapControls';

const TRANSIT_LABEL_MIN_ZOOM = 12;

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

const TILE_LIGHT = {
  url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openstreetmap.org" target="_blank">OSM</a>',
};

const TILE_DARK = {
  url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openstreetmap.org" target="_blank">OSM</a>',
};

const CLUSTER_THRESHOLD = 6;

export default function Map({
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
  const theme = (mode === 'system' ? systemMode : mode) ?? 'light';
  const tile = theme === 'dark' ? TILE_DARK : TILE_LIGHT;

  const bounds = useMemo<LatLngBoundsLiteral | null>(() => {
    if (pins.length === 0) return null;
    const lats = pins.map((p) => p.lat);
    const lngs = pins.map((p) => p.lng);
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }, [pins]);

  const dayGroups = useMemo(() => groupPinsByDay(pins), [pins]);

  const fallbackCenter: [number, number] = [48.8566, 2.3522];
  const useClustering = pins.length >= CLUSTER_THRESHOLD;

  const markers = pins.map((pin) => renderMarker(pin, activePinId, theme, onPinHover, onPinClick));

  return (
    <Box
      className={className}
      sx={{
        height: '100%',
        width: '100%',
        position: 'relative',
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
          background: (t) => t.palette.background.paper,
        },
      }}
    >
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={bounds ? undefined : fallbackCenter}
        bounds={bounds ?? undefined}
        zoom={bounds ? undefined : 3}
        scrollWheelZoom
        zoomControl={false}
        attributionControl
      >
        <TileLayer key={theme} attribution={tile.attribution} url={tile.url} />
        <ResizeInvalidator />
        <BoundsSync bounds={bounds} />
        <FocusSync focusPin={focusPin ?? null} />
        <MapControls
          bounds={bounds}
          onFullscreenToggle={onFullscreenToggle}
          fullscreen={fullscreen}
        />
        {connectByDay && dayGroups.length > 0 ? (
          <RouteLayer groups={dayGroups} />
        ) : null}
        {useClustering ? (
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom
            maxClusterRadius={48}
            iconCreateFunction={createClusterIcon(theme)}
          >
            {markers}
          </MarkerClusterGroup>
        ) : (
          markers
        )}
      </MapContainer>
    </Box>
  );
}

function renderMarker(
  pin: MapPinData,
  activePinId: string | null,
  theme: 'light' | 'dark',
  onPinHover?: (id: string | null) => void,
  onPinClick?: (id: string) => void,
) {
  const isActive = activePinId === pin.id || pin.selected === true;
  const color =
    pin.number != null
      ? colorForDay(pin.dayIndex ?? 0)
      : colorForEntity(pin.entityType, theme);
  const inner =
    pin.number != null
      ? `<span class="tg-pin__number">${pin.number}</span>`
      : `<span class="tg-pin__glyph">${glyphForEntity(pin.entityType)}</span>`;

  const icon = L.divIcon({
    className: '',
    html: buildPinHtml(color, inner, isActive),
    iconSize: [36, 44],
    iconAnchor: [18, 40],
    popupAnchor: [0, -36],
  });

  return (
    <Marker
      key={pin.id}
      position={[pin.lat, pin.lng]}
      icon={icon}
      eventHandlers={{
        mouseover: () => onPinHover?.(pin.id),
        mouseout: () => onPinHover?.(null),
        click: () => onPinClick?.(pin.id),
      }}
    >
      <Popup>{pin.title}</Popup>
    </Marker>
  );
}

function buildPinHtml(color: string, inner: string, selected: boolean): string {
  const classes = ['tg-pin'];
  if (selected) classes.push('tg-pin--selected');
  return (
    `<div class="${classes.join(' ')}" style="--tg-pin-color:${color}">` +
    `<span class="tg-pin__halo" aria-hidden="true"></span>` +
    `<span class="tg-pin__core">${inner}</span>` +
    `<span class="tg-pin__tail" aria-hidden="true"></span>` +
    `</div>`
  );
}

function createClusterIcon(theme: 'light' | 'dark') {
  return (cluster: L.MarkerCluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 36 : count < 50 ? 42 : 50;
    const fontSize = count < 10 ? 13 : count < 50 ? 14 : 15;
    const html =
      `<div class="tg-cluster" data-tg-cluster-theme="${theme}" style="width:${size}px;height:${size}px;font-size:${fontSize}px">` +
      `<span class="tg-cluster__count">${count}</span>` +
      `</div>`;
    return L.divIcon({
      html,
      className: '',
      iconSize: L.point(size, size, true),
    });
  };
}

function ResizeInvalidator() {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(el);
    const raf = requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
    });
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [map]);

  return null;
}

function BoundsSync({ bounds }: { bounds: LatLngBoundsLiteral | null }) {
  const map = useMap();
  const didInitial = useRef(false);

  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, {
      padding: [60, 80],
      animate: didInitial.current,
      duration: 0.5,
    });
    didInitial.current = true;
  }, [bounds, map]);

  return null;
}

function FocusSync({ focusPin }: { focusPin: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!focusPin) return;
    const targetZoom = Math.max(map.getZoom(), 14);
    map.flyTo([focusPin.lat, focusPin.lng], targetZoom, { duration: 0.6 });
  }, [focusPin, map]);

  return null;
}

interface DayGroup {
  dayIndex: number;
  pins: MapPinData[];
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

function RouteLayer({ groups }: { groups: DayGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <Polyline
          key={`route-${group.dayIndex}`}
          positions={group.pins.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{
            color: colorForDay(group.dayIndex),
            weight: 3,
            opacity: 0.7,
            dashArray: '8 5',
          }}
        />
      ))}
      <TransitLabels groups={groups} />
    </>
  );
}

function TransitLabels({ groups }: { groups: DayGroup[] }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  if (zoom < TRANSIT_LABEL_MIN_ZOOM) return null;

  const segments: Array<{ key: string; lat: number; lng: number; label: string }> = [];
  for (const group of groups) {
    for (let i = 0; i < group.pins.length - 1; i += 1) {
      const a = group.pins[i];
      const b = group.pins[i + 1];
      const estimate = estimateTransit(
        { lat: a.lat, lng: a.lng },
        { lat: b.lat, lng: b.lng },
      );
      segments.push({
        key: `seg-${group.dayIndex}-${a.id}-${b.id}`,
        lat: (a.lat + b.lat) / 2,
        lng: (a.lng + b.lng) / 2,
        label: formatSegmentLabel(estimate),
      });
    }
  }

  return (
    <>
      {segments.map((seg) => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="tg-transit-label">${escapeHtml(seg.label)}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        return (
          <Marker
            key={seg.key}
            position={[seg.lat, seg.lng]}
            icon={icon}
            interactive={false}
            keyboard={false}
          />
        );
      })}
    </>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
