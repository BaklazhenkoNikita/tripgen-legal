'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <Box
          role="alert"
          sx={{
            mx: 'auto',
            my: 5,
            maxWidth: 448,
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha('#dc2626', 0.3),
            bgcolor: alpha('#dc2626', 0.08),
            p: 3,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              mx: 'auto',
              display: 'inline-flex',
              height: 48,
              width: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              bgcolor: alpha('#dc2626', 0.15),
              color: '#dc2626',
            }}
          >
            <AlertTriangle size={20} aria-hidden />
          </Box>
          <Typography
            component="h2"
            sx={{ mt: 2, fontSize: 18, fontWeight: 600, color: 'text.primary' }}
          >
            Something went wrong
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
            {this.state.error.message}
          </Typography>
          <Stack direction="row" justifyContent="center" sx={{ mt: 2.5 }}>
            <Button
              type="button"
              onClick={this.reset}
              variant="contained"
              startIcon={<RotateCcw size={16} aria-hidden />}
              sx={{
                bgcolor: 'primary.main',
                color: 'common.white',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Try again
            </Button>
          </Stack>
        </Box>
      );
    }
    return this.props.children;
  }
}
