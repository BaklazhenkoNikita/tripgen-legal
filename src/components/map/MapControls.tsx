'use client';

import { useMap } from 'react-leaflet';
import type { LatLngBoundsLiteral } from 'leaflet';
import { Plus, Minus, Maximize2, Layers, Maximize, Minimize } from 'lucide-react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

interface Props {
  bounds: LatLngBoundsLiteral | null;
  onLayersToggle?: () => void;
  layersActive?: boolean;
  onFullscreenToggle?: () => void;
  fullscreen?: boolean;
}

export function MapControls({
  bounds,
  onLayersToggle,
  layersActive,
  onFullscreenToggle,
  fullscreen,
}: Props) {
  const map = useMap();

  return (
    <Box
      sx={{
        pointerEvents: 'auto',
        position: 'absolute',
        right: 12,
        top: 12,
        zIndex: 1000,
        display: 'inline-flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: (t) =>
          t.palette.mode === 'dark'
            ? 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.5)'
            : 'inset 0 0 0 1px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.10)',
        '& > button + button': {
          borderTop: '1px solid',
          borderTopColor: 'divider',
        },
      }}
    >
      <ControlButton
        label="Zoom in"
        icon={<Plus size={18} aria-hidden />}
        onClick={() => map.zoomIn()}
      />
      <ControlButton
        label="Zoom out"
        icon={<Minus size={18} aria-hidden />}
        onClick={() => map.zoomOut()}
      />
      {bounds ? (
        <ControlButton
          label="Fit to pins"
          icon={<Maximize2 size={16} aria-hidden />}
          onClick={() =>
            map.fitBounds(bounds, { padding: [60, 80], animate: true })
          }
        />
      ) : null}
      {onFullscreenToggle ? (
        <ControlButton
          label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          icon={
            fullscreen ? (
              <Minimize size={16} aria-hidden />
            ) : (
              <Maximize size={16} aria-hidden />
            )
          }
          onClick={onFullscreenToggle}
          active={fullscreen}
        />
      ) : null}
      {onLayersToggle ? (
        <ControlButton
          label={layersActive ? 'Hide legend' : 'Show legend'}
          icon={<Layers size={16} aria-hidden />}
          onClick={onLayersToggle}
          active={layersActive}
        />
      ) : null}
    </Box>
  );
}

function ControlButton({
  label,
  icon,
  onClick,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Tooltip title={label} placement="left" arrow>
      <Box
        component="button"
        type="button"
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        sx={{
          appearance: 'none',
          height: 40,
          width: 40,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          color: active ? 'primary.main' : 'text.secondary',
          transition: 'background-color 160ms ease, color 160ms ease',
          '&:hover': {
            backgroundColor: (t) => alpha(t.palette.text.primary, 0.06),
            color: 'text.primary',
          },
          '&:active': {
            backgroundColor: (t) => alpha(t.palette.text.primary, 0.1),
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: -2,
          },
        }}
      >
        {icon}
      </Box>
    </Tooltip>
  );
}
