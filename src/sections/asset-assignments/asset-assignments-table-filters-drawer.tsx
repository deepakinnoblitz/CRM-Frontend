import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

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

import { getEmployees } from 'src/api/asset-assignments';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'returned', label: 'Returned' }
];

// ----------------------------------------------------------------------

type FiltersProps = {
    employee: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
};

type Props = {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    filters: FiltersProps;
    onFilters: (newFilters: Partial<FiltersProps>) => void;
    canReset: boolean;
    onResetFilters: () => void;
};

export function AssetAssignmentsTableFiltersDrawer({
    open,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
}: Props) {
    const [employees, setEmployees] = useState<Array<{ name: string; employee_name: string }>>([]);

    useEffect(() => {
        const fetchEmployeeList = async () => {
            const emps = await getEmployees();
            setEmployees(emps);
        };
        fetchEmployeeList();
    }, []);

    const handleFilterEmployee = (event: SelectChangeEvent<string>) => {
        onFilters({ employee: event.target.value });
    };

    const handleFilterStatus = (event: SelectChangeEvent<string>) => {
        onFilters({ status: event.target.value });
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

    const renderEmployee = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2">Employee</Typography>
            <FormControl fullWidth>
                <InputLabel>Select Employee</InputLabel>
                <Select
                    value={filters.employee}
                    onChange={handleFilterEmployee}
                    label="Select Employee"
                >
                    <MenuItem value="all">All</MenuItem>
                    {employees.map((option) => (
                        <MenuItem key={option.name} value={option.name}>
                            {option.employee_name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Stack>
    );

    const renderStatus = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2">Status</Typography>
            <FormControl fullWidth>
                <InputLabel>Select Status</InputLabel>
                <Select
                    value={filters.status}
                    onChange={handleFilterStatus}
                    label="Select Status"
                >
                    <MenuItem value="all">All</MenuItem>
                    {STATUSES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Stack>
    );

    const renderDateRange = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2">Assignment Date</Typography>
            <Stack spacing={2}>
                <DatePicker
                    label="Start Date"
                    value={filters.startDate ? dayjs(filters.startDate) : null}
                    onChange={handleFilterStartDate}
                    slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                    label="End Date"
                    value={filters.endDate ? dayjs(filters.endDate) : null}
                    onChange={handleFilterEndDate}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </Stack>
        </Stack>
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 280,
                    border: 'none',
                    overflow: 'hidden',
                },
            }}
        >
            {renderHead}

            <Divider />

            <Scrollbar>
                <Stack spacing={3} sx={{ p: 2.5 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {renderEmployee}
                        {renderStatus}
                        {renderDateRange}
                    </LocalizationProvider>
                </Stack>
            </Scrollbar>

            <Box sx={{ p: 2.5 }}>
                <Button
                    fullWidth
                    size="large"
                    type="submit"
                    color="inherit"
                    variant="outlined"
                    disabled={!canReset}
                    onClick={onResetFilters}
                    startIcon={<Iconify icon="solar:restart-bold" />}
                >
                    Clear All Filters
                </Button>
            </Box>
        </Drawer>
    );
}
