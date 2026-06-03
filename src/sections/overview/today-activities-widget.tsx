import type { Call, Meeting } from 'src/api/dashboard';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type CallsTableProps = {
    title?: string;
    subheader?: string;
    calls: Call[];
};

type MeetingsTableProps = {
    title?: string;
    subheader?: string;
    meetings: Meeting[];
};

type TodayActivitiesWidgetProps = {
    calls: Call[];
    meetings: Meeting[];
};

// ----------------------------------------------------------------------

function StatusSwitcher({ value, onChange }: { value: 'Scheduled' | 'Completed'; onChange: (val: 'Scheduled' | 'Completed') => void }) {
    const theme = useTheme();
    const [pressed, setPressed] = useState(false);

    const activeIndex = value === 'Scheduled' ? 0 : 1;

    const renderOption = (label: string, optionValue: 'Scheduled' | 'Completed') => {
        const isActive = value === optionValue;
        return (
            <ButtonBase
                disableRipple
                onClick={() => onChange(optionValue)}
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                onTouchStart={() => setPressed(true)}
                onTouchEnd={() => setPressed(false)}
                sx={{
                    flex: 1,
                    height: 28,
                    borderRadius: '30px',
                    px: 1.5,
                    zIndex: 2,
                    position: 'relative',
                    transition: theme.transitions.create(
                        ['color', 'transform', 'text-shadow'],
                        { duration: 280, easing: theme.transitions.easing.easeInOut }
                    ),
                    color: isActive ? 'common.white' : 'text.disabled',
                    '&:hover': !isActive
                        ? {
                            color: 'text.main',
                            transform: 'translateY(-1px)',
                        }
                        : {},
                    '&:active': {
                        transform: 'scale(0.96)',
                    },
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '12px',
                        fontWeight: isActive ? 700 : 600,
                        whiteSpace: 'nowrap',
                        transform: isActive ? 'scale(1.04)' : 'scale(1)',
                        transition: theme.transitions.create('transform', {
                            duration: 280,
                            easing: theme.transitions.easing.easeInOut,
                        }),
                    }}
                >
                    {label}
                </Typography>
            </ButtonBase>
        );
    };

    return (
        <Box
            sx={{
                p: 0.25,
                borderRadius: '40px',
                background: `linear-gradient(135deg,
                    ${alpha(theme.palette.common.white, 0.94)},
                    ${alpha(theme.palette.primary.lighter ?? theme.palette.primary.light, 0.16)}
                )`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                display: 'inline-flex',
                alignItems: 'center',
                minWidth: 160,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `
                    0 8px 24px -16px ${alpha(theme.palette.common.black, 0.2)},
                    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.92)}
                `,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    width: 'calc(50% - 2px)',
                    height: 'calc(100% - 4px)',
                    borderRadius: '32px',
                    background: `linear-gradient(135deg,
                        ${value === 'Scheduled' ? theme.palette.warning.light : theme.palette.success.light},
                        ${value === 'Scheduled' ? theme.palette.warning.main : theme.palette.success.main}
                    )`,
                    transform: `translateX(${activeIndex * 100}%) scale(${pressed ? 0.95 : 1})`,
                    transition: theme.transitions.create(['transform', 'box-shadow'], {
                        easing: theme.transitions.easing.easeInOut,
                        duration: 320,
                    }),
                }}
            />
            <Stack direction="row" sx={{ width: '100%', position: 'relative', zIndex: 3 }}>
                {renderOption('Scheduled', 'Scheduled')}
                {renderOption('Completed', 'Completed')}
            </Stack>
        </Box>
    );
}

// ----------------------------------------------------------------------

export function CallsTable({ title, subheader, calls }: CallsTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterStatus, setFilterStatus] = useState<'Scheduled' | 'Completed'>('Scheduled');

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const displayedCalls = calls.filter(c => (c.outgoing_call_status || 'Scheduled') === filterStatus);
    const paginatedCalls = displayedCalls.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const formatTime = (datetime: string) => {
        const date = new Date(datetime);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getStatusColor = (status: string) => {
        if (status === 'Completed') return 'success';
        if (status === 'Scheduled') return 'warning';
        return 'default';
    };

    return (
        <Card sx={{ border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.08)}`, boxShadow: (t) => t.customShadows?.card }}>
            <CardHeader
                title={title}
                action={<StatusSwitcher value={filterStatus} onChange={(val) => { setFilterStatus(val); setPage(0); }} />}
                sx={{ mb: 2.5 }}
                titleTypographyProps={{ variant: 'h6' }}
            />

            <Scrollbar>
                <TableContainer sx={{ overflow: 'unset' }}>
                    <Table sx={{ minWidth: 400 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: (t) => alpha(t.palette.grey[500], 0.04) }}>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Title</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Related To</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Time</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedCalls.map((call) => (
                                <TableRow key={call.name} hover>
                                    <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}` }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: '600', maxWidth: 160 }}>{call.title || 'Untitled Call'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}` }}>
                                        <Typography variant="body2" noWrap sx={{ color: 'text.secondary', maxWidth: 180 }}>
                                            {call.call_for} {call.lead_name ? `• ${call.lead_name}` : ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}` }}>
                                        <Typography variant="body2" sx={{ fontWeight: '500' }}>{formatTime(call.call_start_time)}</Typography>
                                        {call.call_end_time && (
                                            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                                                ends {formatTime(call.call_end_time)}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}` }}>
                                        <Label
                                            color={getStatusColor(call.outgoing_call_status) as any}
                                            variant="soft"
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            {call.outgoing_call_status || 'Scheduled'}
                                        </Label>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {displayedCalls.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ height: 73 * rowsPerPage, borderBottom: 'none' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <Iconify icon={"solar:history-bold-duotone" as any} width={48} sx={{ color: 'text.disabled', mb: 1, opacity: 0.24 }} />
                                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                                No {filterStatus.toLowerCase()} calls found
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}

                            {displayedCalls.length > 0 && paginatedCalls.length < rowsPerPage && (
                                <TableRow sx={{ height: 73 * (rowsPerPage - paginatedCalls.length) }}>
                                    <TableCell colSpan={4} sx={{ borderBottom: 'none' }} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Scrollbar>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={displayedCalls.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: (t) => `1px dashed ${alpha(t.palette.grey[500], 0.2)}` }}
            />
        </Card>
    );
}

// ----------------------------------------------------------------------

export function MeetingsTable({ title, subheader, meetings }: MeetingsTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterStatus, setFilterStatus] = useState<'Scheduled' | 'Completed'>('Scheduled');

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const displayedMeetings = meetings.filter(m => (m.outgoing_call_status || 'Scheduled') === filterStatus);
    const paginatedMeetings = displayedMeetings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const formatTime = (datetime: string) => {
        const date = new Date(datetime);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getStatusColor = (status: string) => {
        if (status === 'Completed') return 'success';
        if (status === 'Scheduled') return 'warning';
        return 'default';
    };

    return (
        <Card sx={{ border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.08)}`, boxShadow: (t) => t.customShadows?.card }}>
            <CardHeader
                title={title}
                action={<StatusSwitcher value={filterStatus} onChange={(val) => { setFilterStatus(val); setPage(0); }} />}
                sx={{ mb: 2.5 }}
                titleTypographyProps={{ variant: 'h6' }}
            />

            <Scrollbar>
                <TableContainer sx={{ overflow: 'unset' }}>
                    <Table sx={{ minWidth: 400 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: (t) => alpha(t.palette.grey[500], 0.04) }}>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Title</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Related To</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Time</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedMeetings.map((meeting) => (
                                <TableRow key={meeting.name} hover>
                                    <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}` }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: '600', maxWidth: 160 }}>{meeting.title}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}` }}>
                                        <Typography variant="body2" noWrap sx={{ color: 'text.secondary', maxWidth: 180 }}>
                                            {meeting.meet_for} {meeting.lead_name ? `• ${meeting.lead_name}` : ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}` }}>
                                        <Typography variant="body2" sx={{ fontWeight: '500' }}>{formatTime(meeting.from)}</Typography>
                                        {meeting.to && (
                                            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                                                ends {formatTime(meeting.to)}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}` }}>
                                        <Label
                                            color={getStatusColor(meeting.outgoing_call_status) as any}
                                            variant="soft"
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            {meeting.outgoing_call_status || 'Scheduled'}
                                        </Label>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {displayedMeetings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ height: 73 * rowsPerPage, borderBottom: 'none' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <Iconify icon={"solar:calendar-mark-bold-duotone" as any} width={48} sx={{ color: 'text.disabled', mb: 1, opacity: 0.24 }} />
                                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                                No {filterStatus.toLowerCase()} meetings found
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}

                            {displayedMeetings.length > 0 && paginatedMeetings.length < rowsPerPage && (
                                <TableRow sx={{ height: 73 * (rowsPerPage - paginatedMeetings.length) }}>
                                    <TableCell colSpan={4} sx={{ borderBottom: 'none' }} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Scrollbar>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={displayedMeetings.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: (t) => `1px dashed ${alpha(t.palette.grey[500], 0.2)}` }}
            />
        </Card>
    );
}

// ----------------------------------------------------------------------

export function TodayActivitiesWidget({ calls, meetings }: TodayActivitiesWidgetProps) {
    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
                <CallsTable
                    title="Today's Calls"
                    calls={calls}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <MeetingsTable
                    title="Today's Meetings"
                    meetings={meetings}
                />
            </Grid>
        </Grid>
    );
}
