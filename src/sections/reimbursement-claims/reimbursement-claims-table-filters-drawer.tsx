import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type FiltersProps = {
    paid: string;
    claim_type: string;
    startDate: string | null;
    endDate: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    filters: FiltersProps;
    onFilters: (newFilters: Partial<FiltersProps>) => void;
    canReset: boolean;
    onResetFilters: () => void;
    claimTypes: any[];
};

export function ReimbursementClaimsTableFiltersDrawer({
    open,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    claimTypes,
}: Props) {
    const handleFilterStatus = (event: SelectChangeEvent<string>) => {
        onFilters({ paid: event.target.value });
    };

    const handleFilterType = (event: SelectChangeEvent<string>) => {
        onFilters({ claim_type: event.target.value });
    };

    const handleFilterStartDate = (newValue: dayjs.Dayjs | null) => {
        onFilters({ startDate: newValue ? newValue.format('YYYY-MM-DD') : null });
    };

    const handleFilterEndDate = (newValue: dayjs.Dayjs | null) => {
        onFilters({ endDate: newValue ? newValue.format('YYYY-MM-DD') : null });
    };

    const renderHead = (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 2, pr: 1, pl: 2.5 }}
        >
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Filters
            </Typography>

            <IconButton onClick={onClose}>
                <Iconify icon="mingcute:close-line" />
            </IconButton>
        </Stack>
    );

    const renderStatus = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2">Status</Typography>
            <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                    value={filters.paid}
                    onChange={handleFilterStatus}
                    label="Status"
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                </Select>
            </FormControl>
        </Stack>
    );

    const renderType = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2">Claim Type</Typography>
            <FormControl fullWidth>
                <InputLabel>Claim Type</InputLabel>
                <Select
                    value={filters.claim_type}
                    onChange={handleFilterType}
                    label="Claim Type"
                >
                    <MenuItem value="all">All</MenuItem>
                    {claimTypes.map((type) => (
                        <MenuItem key={type.name} value={type.name}>
                            {type.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Stack>
    );

    const renderDateRange = (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={1.5}>
                <Typography variant="subtitle2">Expense Date Range</Typography>
                <DatePicker
                    label="Start Date"
                    value={filters.startDate ? dayjs(filters.startDate) : null}
                    onChange={handleFilterStartDate}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            InputLabelProps: { shrink: true },
                        },
                    }}
                />
                <DatePicker
                    label="End Date"
                    value={filters.endDate ? dayjs(filters.endDate) : null}
                    onChange={handleFilterEndDate}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            InputLabelProps: { shrink: true },
                        },
                    }}
                />
            </Stack>
        </LocalizationProvider>
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: { invisible: true },
            }}
            PaperProps={{
                sx: { width: 280 },
            }}
        >
            {renderHead}

            <Divider />

            <Scrollbar>
                <Stack spacing={3} sx={{ p: 2.5 }}>
                    {renderStatus}
                    {renderType}
                    {renderDateRange}
                </Stack>
            </Scrollbar>

            <Box sx={{ p: 2.5 }}>
                <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    color="inherit"
                    onClick={onResetFilters}
                    disabled={!canReset}
                    startIcon={<Iconify icon="solar:restart-bold" />}
                >
                    Clear All
                </Button>
            </Box>
        </Drawer>
    );
}
