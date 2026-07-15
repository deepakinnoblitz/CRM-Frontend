import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import { frappeRequest } from 'src/utils/csrf';

import { getProposalByLeadId, getProposalAttachments } from 'src/api/leads';

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
  onSend: (proposalName: string | null, attachments?: { file_url: string }[] | null) => Promise<void>;
}

const decodeHtml = (str: string) => {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'ph:file-pdf-fill';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'ph:image-fill';
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'ph:file-doc-fill';
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'ph:file-xls-fill';
  if (['zip', 'rar', 'tar', 'gz'].includes(ext || '')) return 'ph:file-zip-fill';
  return 'ph:file-fill';
};

const formatFileSize = (size?: any) => {
  if (!size) return '';
  if (typeof size === 'number') {
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1048576).toFixed(1)} MB`;
  }
  return String(size);
};

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
  const [livePreview, setLivePreview] = useState<string>(automation.preview);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [attachments, setAttachments] = useState<any[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState(false);

  const isProposalSentState = lead?.workflow_state === 'Proposal Sent';

  // Reset live preview when automation changes (i.e. dialog reopens)
  useEffect(() => {
    setLivePreview(automation.preview);
  }, [automation.preview]);

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

  // Re-fetch preview when a proposal is selected
  useEffect(() => {
    if (!selectedProposal || !lead?.name) return;
    setLoadingPreview(true);
    frappeRequest(
      `/api/method/company.company.doctype.crm_email_automation.crm_email_automation.get_automation_preview?doctype=Lead&docname=${encodeURIComponent(lead.name)}&proposal_name=${encodeURIComponent(selectedProposal)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.message?.preview) {
          setLivePreview(data.message.preview);
        }
      })
      .catch((err) => console.error('Failed to refresh preview:', err))
      .finally(() => setLoadingPreview(false));
  }, [selectedProposal, lead?.name]);

  // Fetch attachments immediately when a proposal is selected
  useEffect(() => {
    if (!selectedProposal) {
      setAttachments([]);
      setSelectedAttachments([]);
      return;
    }
    setLoadingAttachments(true);
    setAttachmentsError(false);
    getProposalAttachments(selectedProposal)
      .then((data) => {
        setAttachments(data || []);
        // Select all by default
        setSelectedAttachments((data || []).map((att) => att.file_url));
      })
      .catch((err) => {
        console.error(err);
        setAttachmentsError(true);
      })
      .finally(() => {
        setLoadingAttachments(false);
      });
  }, [selectedProposal]);

  const handleConfirm = async () => {
    if (isProposalSentState && !selectedProposal) {
      setError('Please select a Proposal.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const selectedList = attachments
        .filter((att) => selectedAttachments.includes(att.file_url))
        .map((att) => ({ file_url: att.file_url }));
      await onSend(selectedProposal || null, selectedList.length > 0 ? selectedList : null);
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
          <FormControl fullWidth required error={!!error && !selectedProposal} sx={{ mb: 3, position: 'relative' }}>
            <InputLabel id="proposal-select-label">Proposal</InputLabel>
            <Select
              labelId="proposal-select-label"
              value={selectedProposal}
              label="Proposal"
              disabled={loadingProposals || sending || loadingPreview || loadingAttachments}
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
            {(loadingPreview || loadingAttachments) && (
              <CircularProgress 
                size={20} 
                sx={{ 
                  position: 'absolute', 
                  right: 32, 
                  top: 'calc(50% - 10px)', 
                  zIndex: 2 
                }} 
              />
            )}
            {error && !selectedProposal && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        )}

        {isProposalSentState && selectedProposal && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Proposal Attachments</span>
              {attachments.length > 0 && (
                <Stack direction="row" spacing={1}>
                  <Button 
                    size="small" 
                    onClick={() => setSelectedAttachments(attachments.map(a => a.file_url))}
                    disabled={sending || loadingAttachments || loadingPreview}
                    sx={{ textTransform: 'none', py: 0.2, px: 1, fontSize: '0.75rem' }}
                  >
                    Select All
                  </Button>
                  <Button 
                    size="small" 
                    color="inherit"
                    onClick={() => setSelectedAttachments([])}
                    disabled={sending || loadingAttachments || loadingPreview}
                    sx={{ textTransform: 'none', py: 0.2, px: 1, fontSize: '0.75rem' }}
                  >
                    Clear All
                  </Button>
                </Stack>
              )}
            </Typography>

            {loadingAttachments ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">Loading attachments...</Typography>
              </Box>
            ) : attachmentsError ? (
              <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                Failed to load proposal attachments.
              </Alert>
            ) : attachments.length === 0 ? (
              <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No attachments found for this proposal.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {attachments.map((att) => {
                  const isChecked = selectedAttachments.includes(att.file_url);
                  return (
                    <Box 
                      key={att.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        border: '1px solid',
                        borderColor: isChecked ? 'primary.light' : 'divider',
                        borderRadius: 1.5,
                        bgcolor: isChecked ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ overflow: 'hidden' }}>
                        <Checkbox 
                          checked={isChecked}
                          disabled={sending || loadingPreview || loadingAttachments}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAttachments(prev => [...prev, att.file_url]);
                            } else {
                              setSelectedAttachments(prev => prev.filter(url => url !== att.file_url));
                            }
                          }}
                          sx={{ p: 0.5 }}
                        />
                        <Iconify icon={getFileIcon(att.file_name) as any} width={24} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {att.file_name}
                          </Typography>
                          {att.file_size && (
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(att.file_size)}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        <Button
                          size="small"
                          color="inherit"
                          variant="outlined"
                          onClick={() => window.open(att.file_url, '_blank')}
                          sx={{ textTransform: 'none', minWidth: 64, py: 0.2, borderRadius: 1 }}
                        >
                          Preview
                        </Button>
                        <Button
                          size="small"
                          color="primary"
                          variant="outlined"
                          component="a"
                          href={att.file_url}
                          download
                          sx={{ textTransform: 'none', minWidth: 64, py: 0.2, borderRadius: 1 }}
                        >
                          Download
                        </Button>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
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
            position: 'relative',
          }}
        >
          {loadingPreview && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {!loadingPreview && (
            <Box
              dangerouslySetInnerHTML={{ __html: decodeHtml(livePreview) }}
              sx={{
                fontSize: '14.5px',
                lineHeight: 1.6,
                color: 'text.primary',
                '& p': { my: 1 },
                '& table': { width: '100%', borderCollapse: 'collapse', my: 2 },
                '& td, & th': { border: '1px solid rgba(0, 0, 0, 0.12)', p: 1 },
              }}
            />
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={sending || loadingPreview || loadingAttachments} 
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
          disabled={sending || loadingPreview || loadingAttachments}
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

