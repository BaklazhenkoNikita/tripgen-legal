'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { HelpCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

interface Props {
  question: string;
  onAnswer: (answer: string) => void;
  onCancel: () => void;
}

export function ClarificationDialog({ question, onAnswer, onCancel }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAnswer(trimmed);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
            <HelpCircle size={16} aria-hidden />
          </Box>
          A quick question
        </Box>
      }
      description={question}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!value.trim()}>Continue</Button>
        </>
      }
    >
      <TextField
        inputRef={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        multiline
        rows={3}
        fullWidth
        placeholder="Type your answer…"
        sx={{ mt: 1 }}
      />
    </Dialog>
  );
}
