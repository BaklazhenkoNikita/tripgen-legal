'use client';

import { useCallback, useMemo, type ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

export interface SnackbarOptions {
  message: string;
  durationMs?: number;
  action?: { label: string; onPress: () => void };
  tone?: 'info' | 'success' | 'warning' | 'error';
}

interface SnackbarContextValue {
  showSnackbar: (opts: SnackbarOptions) => void;
  dismissSnackbar: (id?: number | string) => void;
}

/** Backwards-compat: SnackbarProvider now bridges to sonner so existing call sites
 *  (`useSnackbar().showSnackbar({...})`) keep working. The sonner Toaster is
 *  mounted once at the root layout via <ToastBridge />. */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useSnackbar(): SnackbarContextValue {
  const showSnackbar = useCallback((opts: SnackbarOptions) => {
    const fn =
      opts.tone === 'success'
        ? sonnerToast.success
        : opts.tone === 'warning'
        ? sonnerToast.warning
        : opts.tone === 'error'
        ? sonnerToast.error
        : sonnerToast;
    fn(opts.message, {
      duration: opts.durationMs,
      action: opts.action
        ? { label: opts.action.label, onClick: opts.action.onPress }
        : undefined,
    });
  }, []);

  const dismissSnackbar = useCallback((id?: number | string) => {
    if (id == null) sonnerToast.dismiss();
    else sonnerToast.dismiss(id);
  }, []);

  return useMemo(() => ({ showSnackbar, dismissSnackbar }), [showSnackbar, dismissSnackbar]);
}
