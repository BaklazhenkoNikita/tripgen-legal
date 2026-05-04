'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import { Download, ChevronDown, FileText, Calendar, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { useExportTrip, type ExportFormat } from '@/hooks/useExport';
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
} from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/Button';

interface Props {
  searchId: string;
  disabled?: boolean;
}

interface Option {
  format: ExportFormat;
  label: string;
  description: string;
  Icon: typeof FileText;
}

const OPTIONS: Option[] = [
  { format: 'pdf', label: 'PDF', description: 'Print-ready document.', Icon: FileText },
  { format: 'google-calendar', label: 'Google Calendar', description: 'One event per activity.', Icon: Calendar },
  { format: 'notion', label: 'Notion', description: 'Database in your workspace.', Icon: FileSpreadsheet },
];

export function ExportMenu({ searchId, disabled }: Props) {
  const [pending, setPending] = useState<ExportFormat | null>(null);
  const exportTrip = useExportTrip();

  const handleExport = async (format: ExportFormat) => {
    setPending(format);
    try {
      const res = await exportTrip.mutateAsync({ searchId, format });
      const url = res.url ?? res.pdf_url ?? res.calendar_url ?? res.notion_url;
      if (url && typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      toast.success(`${formatLabel(format)} export ready.`);
    } catch (err) {
      toast.error(err instanceof Error ? `Export failed: ${err.message}` : 'Export failed.');
    } finally {
      setPending(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          iconLeft={<Download size={14} />}
          iconRight={<ChevronDown size={14} />}
          disabled={disabled}
        >
          Export
        </Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>Export this trip</DropdownLabel>
        {OPTIONS.map((opt) => (
          <DropdownItem
            key={opt.format}
            onSelect={(e) => {
              e.preventDefault();
              void handleExport(opt.format);
            }}
            disabled={pending !== null}
            sx={{ minWidth: 260 }}
          >
            <Box sx={{ display: 'inline-flex', color: 'text.secondary' }}>
              <opt.Icon size={16} aria-hidden />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box component="span" sx={{ fontWeight: 500 }}>
                {pending === opt.format ? `${opt.label}…` : opt.label}
              </Box>
              <Box component="span" sx={{ fontSize: 11, color: 'text.disabled' }}>
                {opt.description}
              </Box>
            </Box>
          </DropdownItem>
        ))}
      </DropdownContent>
    </DropdownMenu>
  );
}

function formatLabel(format: ExportFormat): string {
  switch (format) {
    case 'pdf': return 'PDF';
    case 'google-calendar': return 'Google Calendar';
    case 'notion': return 'Notion';
  }
}
