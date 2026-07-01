import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import { getProposalByLeadId } from 'src/api/leads';

import { Iconify } from 'src/components/iconify';

interface WhatsappAutomationDialogProps {
  open: boolean;
  onClose: () => void;
  automation: {
    show_confirmation: boolean;
    title?: string;
    message?: string;
    preview: string;
    automation_name: string;
  };
  lead: any;
  onSend: (proposalName: string | null) => Promise<void>;
}

export function EmailAutomationDialog({
  open,
  onClose,
  automation,
  lead,
  onSend,
}: WhatsappAutomationDialogProps) {
  const [proposalOptions, setProposalOptions] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<string>('');
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const isProposalSentState = lead?.workflow_state === 'Proposal Sent';

  useEffect(() => {
    if (open && isProposalSentState && lead?.name) {
      setLoadingProposals(true);
      setError('');
      setSelectedProposal('');
      getProposalByLeadId(lead.name)
        .then((data) => {
          setProposalOptions(data || []);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load proposals.');
        })
        .finally(() => {
          setLoadingProposals(false);
        });
    }
  }, [open, isProposalSentState, lead?.name]);

  const handleConfirm = async () => {
    if (isProposalSentState && !selectedProposal) {
      setError('Please select a Proposal.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await onSend(selectedProposal || null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={sending ? undefined : onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Iconify icon={"ic:baseline-email" as any} width={28} sx={{ color: '#258ad3ff' }} />
        {automation.title || 'Send Email'}
      </DialogTitle>
      
      <DialogContent dividers sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Typography variant="body1" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          {automation.message || 'Do you want to send the Email?'}
        </Typography>



        {isProposalSentState && (
          <FormControl fullWidth required error={!!error && !selectedProposal} sx={{ mb: 3 }}>
            <InputLabel id="proposal-select-label">Proposal</InputLabel>
            <Select
              labelId="proposal-select-label"
              value={selectedProposal}
              label="Proposal"
              disabled={loadingProposals || sending}
              onChange={(e) => {
                setSelectedProposal(e.target.value);
                setError('');
              }}
              sx={{ borderRadius: 1.5 }}
            >
              {loadingProposals ? (
                <MenuItem disabled>
                  <CircularProgress size={16} sx={{ mr: 1 }} /> Loading proposals...
                </MenuItem>
              ) : proposalOptions.length === 0 ? (
                <MenuItem disabled>No proposals found for this lead</MenuItem>
              ) : (
                proposalOptions.map((prop) => (
                  <MenuItem key={prop.name} value={prop.name}>
                    {prop.proposal_title || prop.reference_no || prop.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {error && !selectedProposal && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        )}

        <Box
          sx={{
            p: 2.5,
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f8fafc' : 'background.neutral'),
            borderRadius: 2,
            border: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'light' ? '#e2e8f0' : 'divider'),
            overflowY: 'auto',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '13.5px',
              lineHeight: 1.6,
              color: 'text.primary',
            }}
          >
            {automation.preview}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={sending} 
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
        >
          Skip
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleConfirm} 
          disabled={sending}
          startIcon={sending ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ 
            borderRadius: 1.5, 
            textTransform: 'none', 
            fontWeight: 800,
            bgcolor: '#258ad3ff',
            color: '#fff',
            '&:hover': {
              bgcolor: '#258ad3ff',
            }
          }}
        >
          {sending ? 'Sending...' : 'Send Email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
