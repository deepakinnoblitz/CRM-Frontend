import type dayjs from 'dayjs';

import * as XLSX from 'xlsx';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useEmployees } from 'src/hooks/useEmployees';
import { useDepartments, useDesignations } from 'src/hooks/use-masters';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { EmployeeReportDetailsDialog } from '../employee-report-details-dialog';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['Active', 'Inactive'];

export function EmployeeOverallReportView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('date_of_joining');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const [joiningDateFrom, setJoiningDateFrom] = useState<dayjs.Dayjs | null>(null);
  const [joiningDateTo, setJoiningDateTo] = useState<dayjs.Dayjs | null>(null);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterDesignation, setFilterDesignation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: departments } = useDepartments(1, 100);
  const { data: designations } = useDesignations(1, 100);

  const { data, total, loading, refetch } = useEmployees(
    page + 1,
    rowsPerPage,
    '',
    orderBy,
    order,
    filterDepartment,
    filterDesignation,
    filterStatus,
    '', // filterCountry
    '', // filterState
    '', // filterCity
    joiningDateFrom ? joiningDateFrom.format('YYYY-MM-DD') : null,
    joiningDateTo ? joiningDateTo.format('YYYY-MM-DD') : null
  );

  const [openDetails, setOpenDetails] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleViewDetails = (id: string) => {
    setSelectedEmployeeId(id);
    setOpenDetails(true);
  };

  const handleExport = () => {
    const exportData = data.map((emp, index) => ({
      'S.No': index + 1,
      'Employee Name': emp.employee_name,
      'Employee ID': emp.name,
      'Department': emp.department,
      'Designation': emp.designation,
      'Joining Date': fDate(emp.date_of_joining, 'DD-MM-YYYY'),
      'Status': emp.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Overall Report');
    XLSX.writeFile(workbook, 'Employee_Overall_Report.xlsx');
  };

  const handleReset = () => {
    setJoiningDateFrom(null);
    setJoiningDateTo(null);
    setFilterDepartment('all');
    setFilterDesignation('all');
    setFilterStatus('all');
    setOrder('desc');
  };

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSortChange = (event: SelectChangeEvent) => {
    setOrder(event.target.value as 'asc' | 'desc');
  };

  return (
    <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Employee Overall Report</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:refresh-bold" />}
              onClick={refetch}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="solar:restart-bold" />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Stack>
        </Stack>

        <Card
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: 'background.neutral',
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <Stack direction="row" gap={1.5} alignItems="center" flexWrap="wrap">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Joining Date From"
                format="DD-MM-YYYY"
                value={joiningDateFrom}
                onChange={(newValue) => setJoiningDateFrom(newValue)}
                slotProps={{ textField: { size: 'small', sx: { flexGrow: 1, maxWidth: 170 } } }}
              />
              <DatePicker
                label="Joining Date To"
                format="DD-MM-YYYY"
                value={joiningDateTo}
                onChange={(newValue) => setJoiningDateTo(newValue)}
                slotProps={{ textField: { size: 'small', sx: { flexGrow: 1, maxWidth: 170 } } }}
              />
            </LocalizationProvider>

            <FormControl size="small" sx={{ flexGrow: 1, minWidth: 160 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                label="Department"
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.name} value={dept.name}>
                    {dept.department_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flexGrow: 1, minWidth: 160 }}>
              <InputLabel>Designation</InputLabel>
              <Select
                value={filterDesignation}
                label="Designation"
                onChange={(e) => setFilterDesignation(e.target.value)}
              >
                <MenuItem value="all">All Designations</MenuItem>
                {designations.map((desig) => (
                  <MenuItem key={desig.name} value={desig.name}>
                    {desig.designation_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flexGrow: 1, minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flexGrow: 1, minWidth: 140 }}>
              <InputLabel>Sort</InputLabel>
              <Select value={order} label="Sort" onChange={handleSortChange}>
                <MenuItem value="desc">Newest First</MenuItem>
                <MenuItem value="asc">Oldest First</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:export-bold" />}
              onClick={handleExport}
              sx={{
                bgcolor: '#08a3cd',
                color: 'common.white',
                '&:hover': { bgcolor: '#068fb3' },
                height: 40,
                px: 3,
                ml: { md: 'auto' },
              }}
            >
              Export
            </Button>
          </Stack>
        </Card>

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size="medium" stickyHeader sx={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f4f6f8' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < data.length}
                        checked={data.length > 0 && selected.length === data.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Employee ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Designation</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Joining Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', position: 'sticky', right: 0, bgcolor: '#f4f6f8', zIndex: 11 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => {
                    const isSelected = selected.indexOf(row.name) !== -1;
                    return (
                      <TableRow 
                        key={row.name} 
                        hover 
                        selected={isSelected}
                        aria-checked={isSelected}
                        role="checkbox"
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isSelected} onClick={(event) => handleClick(event, row.name)} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            src={row.profile_picture || ''}
                            alt={row.employee_name}
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: 14,
                              fontWeight: 'bold',
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                            }}
                          >
                            {row.employee_name?.charAt(0).toUpperCase()}
                          </Avatar>
                            <Stack spacing={0.25}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {row.employee_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                ID: {row.name}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell>{row.designation}</TableCell>
                        <TableCell>{fDate(row.date_of_joining, 'DD-MM-YYYY')}</TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.75,
                              fontWeight: 'bold',
                              bgcolor: row.status === 'Active' ? 'success.lighter' : 'error.lighter',
                              color: row.status === 'Active' ? 'success.dark' : 'error.dark',
                            }}
                          >
                            {row.status}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper' }}>
                          <IconButton onClick={() => handleViewDetails(row.name)} sx={{ color: 'info.main' }}>
                            <Iconify icon="solar:eye-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {data.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 10 }}>
                        <EmptyContent
                          title="No Employees Found"
                          description="Try adjusting your filters to find what you're looking for."
                          sx={{ py: 0 }}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={onChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Card>
      </Stack>

      <EmployeeReportDetailsDialog
        open={openDetails}
        employeeId={selectedEmployeeId}
        onClose={() => {
          setOpenDetails(false);
          setSelectedEmployeeId(null);
        }}
      />
    </DashboardContent>
  );
}
