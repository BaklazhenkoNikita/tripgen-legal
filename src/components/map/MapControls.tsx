'use client';

import type maplibregl from 'maplibre-gl';
import { Plus, Minus, Maximize2, Layers, Maximize, Minimize } from 'lucide-react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

type LngLatBounds = [[number, number], [number, number]] | null;

interface Props {
  map: maplibregl.Map | null;
  bounds: LngLatBounds;
  onLayersToggle?: () => void;
  layersActive?: boolean;
  onFullscreenToggle?: () => void;
  fullscreen?: boolean;
}

export function MapControls({
  map,
  bounds,
  onLayersToggle,
  layersActive,
  onFullscreenToggle,
  fullscreen,
}: Props) {
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
        onClick={() => map?.zoomIn()}
        disabled={!map}
      />
      <ControlButton
        label="Zoom out"
        icon={<Minus size={18} aria-hidden />}
        onClick={() => map?.zoomOut()}
        disabled={!map}
      />
      {bounds ? (
        <ControlButton
          label="Fit to pins"
          icon={<Maximize2 size={16} aria-hidden />}
          onClick={() =>
            map?.fitBounds(bounds, {
              padding: { top: 60, right: 80, bottom: 60, left: 80 },
              maxZoom: 15,
              duration: 400,
            })
          }
          disabled={!map}
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
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Tooltip title={label} placement="left" arrow>
      <Box
        component="button"
        type="button"
        aria-label={label}
        disabled={disabled}
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
          cursor: disabled ? 'default' : 'pointer',
          color: active ? 'primary.main' : 'text.secondary',
          opacity: disabled ? 0.5 : 1,
          transition: 'background-color 160ms ease, color 160ms ease',
          '&:hover': disabled
            ? undefined
            : {
                backgroundColor: (t) => alpha(t.palette.text.primary, 0.06),
                color: 'text.primary',
              },
          '&:active': disabled
            ? undefined
            : {
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
