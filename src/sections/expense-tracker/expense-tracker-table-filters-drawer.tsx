import type dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onOpen: VoidFunction;
    onClose: VoidFunction;
    filters: {
        type: string;
        startDate: dayjs.Dayjs | null;
        endDate: dayjs.Dayjs | null;
    };
    onFilters: (update: any) => void;
    canReset: boolean;
    onResetFilters: VoidFunction;
};

export default function ExpenseTrackerTableFiltersDrawer({
    open,
    onOpen,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
}: Props) {
    const handleFilterType = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilters({ type: event.target.value });
    };

    const handleFilterStartDate = (newValue: dayjs.Dayjs | null) => {
        onFilters({ startDate: newValue });
    };

    const handleFilterEndDate = (newValue: dayjs.Dayjs | null) => {
        onFilters({ endDate: newValue });
    };

    const renderHead = (
        <Box
            sx={{
                py: 2.5,
                pl: 3,
                pr: 2,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Filters
            </Typography>

            <IconButton
                onClick={onResetFilters}
                disabled={!canReset}
                sx={{
                    mr: 0.5,
                    color: canReset ? 'primary.main' : 'text.disabled',
                    '&:hover': {
                        bgcolor: canReset ? 'primary.lighter' : 'transparent',
                    },
                }}
            >
                <Badge color="error" variant="dot" invisible={!canReset}>
                    <Iconify icon="solar:restart-bold" width={20} />
                </Badge>
            </IconButton>

            <IconButton
                onClick={onClose}
                sx={{
                    color: 'text.secondary',
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <Iconify icon="mingcute:close-line" width={20} />
            </IconButton>
        </Box>
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: 320,
                        boxShadow: (theme: any) => theme.customShadows.z24,
                    },
                },
            }}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 100,
            }}
        >
            {renderHead}

            <Scrollbar>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                            Type
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            value={filters.type}
                            onChange={handleFilterType}
                            SelectProps={{ native: true }}
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1.5,
                                    bgcolor: 'background.neutral',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                },
                            }}
                        >
                            <option value="all">All Types</option>
                            <option value="Income">Income</option>
                            <option value="Expense">Expense</option>
                        </TextField>
                    </Stack>

                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                            Date Range
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Stack spacing={2}>
                                <DatePicker
                                    label="Start Date"
                                    value={filters.startDate}
                                    onChange={handleFilterStartDate}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: 'small',
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1.5,
                                                    bgcolor: 'background.neutral',
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                    },
                                                },
                                            }
                                        }
                                    }}
                                />
                                <DatePicker
                                    label="End Date"
                                    value={filters.endDate}
                                    onChange={handleFilterEndDate}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: 'small',
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1.5,
                                                    bgcolor: 'background.neutral',
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                    },
                                                },
                                            }
                                        }
                                    }}
                                />
                            </Stack>
                        </LocalizationProvider>
                    </Stack>
                </Stack>
            </Scrollbar>

            <Box
                sx={{
                    p: 2.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                }}
            >
                <Button
                    fullWidth
                    size="large"
                    color="inherit"
                    variant="outlined"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={onResetFilters}
                    disabled={!canReset}
                    sx={{
                        borderRadius: 1.5,
                        borderColor: 'divider',
                        fontWeight: 600,
                        '&:hover': {
                            borderColor: 'error.main',
                            color: 'error.main',
                            bgcolor: 'error.lighter',
                        },
                        '&.Mui-disabled': {
                            borderColor: 'divider',
                        },
                    }}
                >
                    Clear All Filters
                </Button>
            </Box>
        </Drawer>
    );
}
