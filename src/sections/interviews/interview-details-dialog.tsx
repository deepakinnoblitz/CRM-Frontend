import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: VoidFunction;
    interview: any;
};

export function InterviewDetailsDialog({ open, onClose, interview }: Props) {
    const [tab, setTab] = useState(0);

    if (!interview) return null;

    // ── helpers ────────────────────────────────────────────────────────────

    const statusColor = (status: string): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
        switch (status) {
            case 'Selected':
            case 'Completed': return 'success';
            case 'Rejected':
            case 'Cancelled':
            case 'No-Show': return 'error';
            case 'On Hold':
            case 'Rescheduled': return 'warning';
            case 'Scheduled':
            case 'In Progress': return 'info';
            default: return 'primary';
        }
    };

    const fmt = (val: any) => (val != null && val !== '') ? String(val) : '—';

    /** Read-only TextField that looks identical to the edit-dialog fields */
    const readField = (
        label: string,
        value: any,
        opts?: { colSpan?: boolean; multiline?: boolean; rows?: number }
    ) => (
        <TextField
            fullWidth
            label={label}
            value={fmt(value)}
            InputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
            multiline={opts?.multiline}
            rows={opts?.multiline ? (opts.rows ?? 4) : undefined}
            sx={opts?.colSpan ? { gridColumn: 'span 2' } : {}}
        />
    );

    // ── Header card ────────────────────────────────────────────────────────

    const renderHeader = (
        <Box
            sx={{
                p: 2.5, mb: 2,
                bgcolor: 'background.neutral',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }} noWrap>
                    {interview.job_applicant}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    {interview.job_applied && (
                        <Chip label={interview.job_applied} size="small" variant="outlined" />
                    )}
                    {interview.designation && (
                        <Chip label={interview.designation} size="small" variant="outlined" />
                    )}
                    {interview.email_id && (
                        <Typography variant="caption" color="text.secondary">
                            {interview.email_id}
                        </Typography>
                    )}
                </Stack>
            </Box>
            <Label
                variant="filled"
                color={statusColor(interview.overall_status)}
                sx={{ flexShrink: 0, height: 32, px: 2, borderRadius: 1 }}
            >
                {interview.overall_status}
            </Label>
        </Box>
    );

    // ── Tab 0 · Applicant Details ──────────────────────────────────────────

    const renderApplicantDetails = (
        <Stack spacing={3}>
            {/* Job info */}
            <Divider sx={{ borderStyle: 'dashed' }}>Job Applicant Details</Divider>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                {readField('Job Applicant', interview.job_applicant)}
                {readField('Job Applied', interview.job_applied)}
                {readField('Designation', interview.designation)}
                {readField('Overall Status', interview.overall_status)}
            </Box>

            {/* Contact */}
            <Divider sx={{ borderStyle: 'dashed' }}>Contact Information</Divider>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                {readField('Email Address', interview.email_id)}
                {readField('Phone Number', interview.phone_number)}
                {readField('Country', interview.country)}
                {readField('State', interview.state)}
                {readField('City', interview.city)}
            </Box>

            {/* Notes */}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr' }}>
                {readField('Notes', interview.notes, { multiline: true, rows: 3 })}
            </Box>

            {/* Resume */}
            <Divider sx={{ borderStyle: 'dashed' }}>Resume</Divider>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                {readField('Resume Link', interview.resume_link)}

                {/* Resume Attachment — styled like a read-only outlined field */}
                <Box sx={{ position: 'relative' }}>
                    <Typography
                        component="label"
                        variant="caption"
                        sx={{
                            position: 'absolute', top: -9, left: 10, px: 0.5,
                            bgcolor: 'background.paper', color: 'text.secondary',
                            fontSize: '0.75rem', lineHeight: 1, zIndex: 1, pointerEvents: 'none',
                        }}
                    >
                        Resume Attachment
                    </Typography>
                    <Box
                        sx={{
                            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                            borderRadius: 1, px: 1.5, py: 1,
                            display: 'flex', alignItems: 'center', gap: 1, minHeight: 56,
                        }}
                    >
                        {interview.resume_attachment ? (
                            <>
                                <Iconify icon="solar:file-text-bold" width={18} sx={{ color: 'primary.main', flexShrink: 0 }} />
                                <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: 500 }}>
                                    {interview.resume_attachment.split('/').pop()}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Iconify icon="solar:download-bold" width={14} />}
                                    href={interview.resume_attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    component="a"
                                    sx={{ flexShrink: 0 }}
                                >
                                    Download
                                </Button>
                            </>
                        ) : (
                            <>
                                <Iconify icon={"solar:file-text-linear" as any} width={18} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ flex: 1, color: 'text.disabled' }}>No file attached</Typography>
                            </>
                        )}
                    </Box>
                </Box>

                {readField('Cover Letter', interview.cover_letter, { colSpan: true, multiline: true, rows: 3 })}
            </Box>

            {/* Salary */}
            <Divider sx={{ borderStyle: 'dashed' }}>Salary Expectation</Divider>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' } }}>
                {readField('Currency', interview.currency)}
                {readField('Lower Range', interview.lower_range)}
                {readField('Upper Range', interview.upper_range)}
            </Box>
        </Stack>
    );

    // ── Tab 1 · Interview Details ──────────────────────────────────────────

    const renderInterviewDetails = (
        <Stack spacing={3}>
            {/* Schedule */}
            <Divider sx={{ borderStyle: 'dashed' }}>Schedule</Divider>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                {readField('Scheduled On', interview.scheduled_on ? new Date(interview.scheduled_on).toLocaleDateString('en-GB') : '')}
                <Box />
                {readField('From Time', interview.from_time)}
                {readField('To Time', interview.to_time)}
            </Box>

            {/* Summary */}
            <Divider sx={{ borderStyle: 'dashed' }}>Interview Summary</Divider>
            {readField('Interview Summary', interview.interview_summary, { multiline: true, rows: 5 })}
        </Stack>
    );

    // ── Tab 2 · Performance ───────────────────────────────────────────────

    const renderPerformance = (
        <Stack spacing={3}>
            {readField('Overall Performance', interview.overall_performance, { multiline: true, rows: 3 })}

            <Divider sx={{ borderStyle: 'dashed' }}>Feedbacks</Divider>

            {interview.feedbacks?.length ? (
                interview.feedbacks.map((fb: any, index: number) => (
                    <Box
                        key={index}
                        sx={{
                            border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
                            borderRadius: 1.5,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Card header */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                                px: 2, py: 1,
                                bgcolor: 'background.neutral',
                                borderBottom: (theme) => `1px dashed ${theme.vars.palette.divider}`,
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                Feedback #{index + 1}
                            </Typography>
                            <Rating value={Number(fb.rating)} readOnly size="small" />
                        </Stack>

                        {/* Card body */}
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, p: 2 }}>
                            {readField('Interview Type', fb.interview_type)}
                            {readField('Interviewer', fb.interviewer)}
                            {readField('Notes', fb.notes, { colSpan: true, multiline: true, rows: 2 })}
                        </Box>
                    </Box>
                ))
            ) : (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
                    <Iconify icon={"solar:document-bold" as any} width={40} sx={{ mb: 1, opacity: 0.4 }} />
                    <Typography variant="body2">No feedback recorded yet.</Typography>
                </Box>
            )}
        </Stack>
    );

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle
                sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                Interview Details
                <IconButton onClick={onClose}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <Scrollbar sx={{ maxHeight: '85vh' }}>
                <DialogContent sx={{ p: 3, pt: 2 }}>
                    {/* {renderHeader} */}

                    <Tabs
                        value={tab}
                        onChange={(_, val) => setTab(val)}
                        sx={{
                            mb: 3,
                            borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
                        }}
                    >
                        <Tab label="Applicant Details" />
                        <Tab label="Interview Details" />
                        <Tab label="Performance" />
                    </Tabs>

                    {tab === 0 && renderApplicantDetails}
                    {tab === 1 && renderInterviewDetails}
                    {tab === 2 && renderPerformance}
                </DialogContent>
            </Scrollbar>
        </Dialog>
    );
}

// ----------------------------------------------------------------------

function SectionHeader({ title, icon }: { title: string; icon: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Iconify icon={icon as any} width={24} sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Iconify icon={icon as any} width={20} sx={{ color: 'text.disabled', mt: 0.2 }} />
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {value}
                </Typography>
            </Box>
        </Stack>
    );
}
