import { useState } from 'react';

import { alpha } from '@mui/material/styles';
import {
    Box,
    Card,
    Stack,
    Table,
    Alert,
    Chip,
    Button,
    Dialog,
    TableRow,
    TableBody,
    TableCell,
    TableHead,
    Typography,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
    TableContainer,
    TextField,
    InputAdornment,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface AllocationResult {
    created_count: number;
    skipped_count: number;
    created_details: {
        employee_name: string;
        employee_id: string;
        leave_type: string;
        total_leaves: number;
    }[];
    errors: string[];
}

interface Props {
    open: boolean;
    onClose: VoidFunction;
    data: AllocationResult | null;
}

export default function AutoAllocateResultDialog({ open, onClose, data }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    if (!data) return null;

    const filteredDetails = data.created_details.filter((detail) =>
        detail.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        detail.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        detail.leave_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: {
                    borderRadius: 2.5,
                    boxShadow: (theme) => `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.24)}`
                },
            }}
        >
            <DialogTitle sx={{
                m: 0,
                p: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.neutral',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Leave Allocation Result</Typography>
                </Stack>
                <IconButton onClick={onClose} sx={{ color: 'text.disabled' }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, bgcolor: 'background.paper', mt: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, color: 'text.primary' }}>
                        Allocation Completed Successfully!
                    </Typography>

                    <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
                        <Card sx={{
                            p: 2.5,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2.5,
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
                            border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
                            boxShadow: 'none'
                        }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'success.main',
                                color: 'common.white',
                                boxShadow: (theme) => `0 8px 16px -4px ${alpha(theme.palette.success.main, 0.4)}`
                            }}>
                                <Iconify icon="eva:checkmark-fill" width={32} />
                            </Box>
                            <Stack>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>{data.created_count}</Typography>
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Allocations Created</Typography>
                            </Stack>
                        </Card>

                        <Card sx={{
                            p: 2.5,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2.5,
                            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
                            border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
                            boxShadow: 'none'
                        }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'warning.main',
                                color: 'common.white',
                                boxShadow: (theme) => `0 8px 16px -4px ${alpha(theme.palette.warning.main, 0.4)}`
                            }}>
                                <Iconify icon="solar:double-alt-arrow-right-bold" width={32} />
                            </Box>
                            <Stack>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>{data.skipped_count}</Typography>
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Already Existing / Skipped</Typography>
                            </Stack>
                        </Card>
                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', px: 0.5 }}>
                            Detailed Log
                        </Typography>
                        <TextField
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search employee..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: 280 }}
                        />
                    </Stack>

                    <TableContainer sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        maxHeight: 300,
                        bgcolor: 'background.neutral'
                    }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, color: 'text.secondary', py: 1.5 }}>Employee</TableCell>
                                    <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, color: 'text.secondary', py: 1.5 }}>Type</TableCell>
                                    <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, color: 'text.secondary', textAlign: 'center', py: 1.5 }}>Allocated</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredDetails.map((detail, idx) => (
                                    <TableRow key={`${detail.employee_id}-${detail.leave_type}`} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{detail.employee_name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{detail.employee_id}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={detail.leave_type}
                                                size="small"
                                                variant="outlined"
                                                color={detail.leave_type === 'Paid Leave' ? 'primary' : 'default'}
                                                sx={{ borderRadius: 0.5, height: 20, fontSize: 10, fontWeight: 700 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 800 }}>+{detail.total_leaves}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.created_details.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} sx={{ py: 6, textAlign: 'center' }}>
                                            <Stack spacing={1} alignItems="center">
                                                <Iconify icon="solar:folder-bold-duotone" width={48} sx={{ color: 'text.disabled' }} />
                                                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                                    No new allocations were created this time.
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {data.errors.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Alert
                                severity="error"
                                variant="outlined"
                                sx={{ borderRadius: 1.5, '& .MuiAlert-message': { width: '100%' } }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Errors Encountered ({data.errors.length}):</Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                    {data.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </Box>
                            </Alert>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            {/* <DialogActions sx={{ p: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onClose}
                    fullWidth
                    sx={{ py: 1.5, borderRadius: 1.25, fontWeight: 700 }}
                >
                    Done & Close
                </Button>
            </DialogActions> */}
        </Dialog>
    );
}
