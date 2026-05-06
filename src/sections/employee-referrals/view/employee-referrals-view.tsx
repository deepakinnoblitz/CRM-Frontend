import { CgWorkAlt } from "react-icons/cg";
import { useLocation } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { MdOutlineRoomPreferences } from "react-icons/md";

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { fetchFrappeList } from 'src/api/hr-management';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchOpenJobs, fetchMyReferrals, createJobApplicant } from 'src/api/referrals';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ReferralModal } from '../referral-modal';
import { ReferralTableToolbar } from '../referral-table-toolbar';
import { ReferralTableFiltersDrawer } from '../referral-table-filters-drawer';
import { JobOpeningDetailsDialog } from '../../report/job-openings/job-opening-details-dialog';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'jobs', label: 'Job Openings', icon: <CgWorkAlt size={22}/> },
  { value: 'my-referrals', label: 'My Referrals', icon: <MdOutlineRoomPreferences size={22}/>},
];

export function EmployeeReferralsView() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const viewType = searchParams.get('view'); // 'hr' or default (employee)

  const [currentTab, setCurrentTab] = useState('jobs');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | undefined>(undefined);
  const [openJobDetails, setOpenJobDetails] = useState(false);
  const [selectedJobData, setSelectedJobData] = useState<any>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [filterName, setFilterName] = useState('');
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    job_opening: 'all',
    location: 'all',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('date_desc');

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = { ...filters };

      if (currentTab === 'jobs') {
        const orderMapper = sortBy === 'date_desc' ? 'posted_on desc' : 'posted_on asc';
        const data = await fetchOpenJobs(filterName, activeFilters, page, rowsPerPage, orderMapper);
        setJobs(data);
        // Note: For real pagination, we'd need a total count from the API. 
        // For now, we'll assume the length is representative.
        setTotal(data.length + (page * rowsPerPage));
      } else if (currentTab === 'my-referrals') {
        if (viewType === 'hr') {
          const response = await fetchFrappeList('Employee Referral', {
            page: page + 1,
            page_size: rowsPerPage,
            search: filterName,
            searchField: 'candidate_name',
            filters: [
              ...(filters.status !== 'all' ? [['status', '=', filters.status]] : []),
              ...(filters.job_opening !== 'all' ? [['job_opening', '=', filters.job_opening]] : [])
            ],
            orderBy: sortBy === 'date_desc' ? 'modified desc' : 'modified asc'
          });
          setReferrals(response.data);
          setTotal(response.total);
        } else {
          const orderMapper = sortBy === 'date_desc' ? 'modified desc' : 'modified asc';
          const data = await fetchMyReferrals(filterName, activeFilters, page, rowsPerPage, orderMapper);
          setReferrals(data);
          setTotal(data.length + (page * rowsPerPage));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentTab, viewType, filters, filterName, page, rowsPerPage, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timeout);
  }, [loadData]);

  // Special fetch for job options (to populate filters when in other tabs)
  useEffect(() => {
    fetchOpenJobs().then(setJobs).catch(console.error);
  }, []);

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setFilterName('');
    setPage(0);
    handleResetFilters();
  }, []);

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    setPage(0);
  };

  const handleFilters = (update: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      job_opening: 'all',
      location: 'all',
    });
    setPage(0);
  };

  const handleChangePage = (event: unknown, 控制Page: number) => {
    setPage(控制Page);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(0);
  };

  const canReset = filters.status !== 'all' || filters.job_opening !== 'all' || filters.location !== 'all';
  const activeFiltersCount = (filters.status !== 'all' ? 1 : 0) +
    (filters.job_opening !== 'all' ? 1 : 0) +
    (filters.location !== 'all' ? 1 : 0);

  const handleReferClick = (jobName: string) => {
    setSelectedJob(jobName);
    setOpenModal(true);
  };

  const handleViewJob = (job: any) => {
    setSelectedJobData(job);
    setOpenJobDetails(true);
  };

  const handleCreateApplicant = async (name: string) => {
    try {
      await createJobApplicant(name);
      setSnackbar({ open: true, message: 'Job Applicant created successfully!', severity: 'success' });
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to create applicant', severity: 'error' });
    }
  };

  return (
    <DashboardContent maxWidth={false} sx={{mt: 2}}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={{ xs: 3, md: 3 }}>
        <Typography variant="h4">{viewType === 'hr' ? 'Referral Management' : 'Employee Referrals'}</Typography>
      </Stack>

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
          '& .MuiTabs-indicator': { backgroundColor: '#00A5D1' },
          '& .MuiTab-root.Mui-selected': { color: '#00A5D1' },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} iconPosition="start" />
        ))}
      </Tabs>

      <Card>
        <ReferralTableToolbar
          filterName={filterName}
          onFilterName={handleFilterName}
          onOpenFilter={(e) => setOpenFilters(true)}
          numSelected={0}
          activeFiltersCount={activeFiltersCount}
          placeholder={currentTab === 'jobs' ? "Search jobs..." : "Search candidates..."}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          sortOptions={[
            { value: 'date_desc', label: 'Newest First' },
            { value: 'date_asc', label: 'Oldest First' },
          ]}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
            <Table>
              <TableBody>
                {currentTab === 'jobs' ? (
                  <>
                    <TableRow sx={{ bgcolor: 'background.neutral' }}>
                      <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Job Title</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Designation</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Posted On</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Action</TableCell>
                    </TableRow>
                    {jobs.map((row, index) => (
                      <TableRow key={row.name}>
                        <TableCell align="center">
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              display: 'flex',
                              borderRadius: '50%',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                              color: 'primary.main',
                              typography: 'subtitle2',
                              fontWeight: 800,
                              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                              mx: 'auto',
                            }}
                          >
                            {index + 1}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{row.job_title}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.name}</Typography>
                        </TableCell>
                        <TableCell>{row.designation}</TableCell>
                        <TableCell>{row.location}</TableCell>
                        <TableCell>{new Date(row.posted_on).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewJob(row)}
                              sx={{ color: '#00A5D1', borderColor: alpha('#00A5D1', 0.5) }}
                            >
                              View
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleReferClick(row.name)}
                              sx={{ bgcolor: '#00A5D1', '&:hover': { bgcolor: '#0084a7' } }}
                            >
                              Refer
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!jobs.length && !loading && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyContent
                            title={filterName ? "No matches found" : "No Job Openings"}
                            description={filterName ? `No results found for "${filterName}"` : "There are currently no active job openings."}
                            icon="solar:case-minimalistic-bold-duotone"
                            sx={{ py: 10 }}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ) : (
                  <>
                    <TableRow sx={{ bgcolor: 'background.neutral' }}>
                      <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Candidate</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Job Opening</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Status</TableCell>
                      {viewType === 'hr' && <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Referrer</TableCell>}
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Action</TableCell>
                    </TableRow>
                    {referrals.map((row, index) => (
                      <TableRow key={row.name}>
                        <TableCell align="center">
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              display: 'flex',
                              borderRadius: '50%',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                              color: 'primary.main',
                              typography: 'subtitle2',
                              fontWeight: 800,
                              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                              mx: 'auto',
                            }}
                          >
                            {index + 1}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{row.candidate_name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.candidate_email}</Typography>
                        </TableCell>
                        <TableCell>{row.job_opening}</TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              px: 1, py: 0.5, borderRadius: 1,
                              bgcolor: row.status === 'Accepted' || row.status === 'Hired' ? 'success.lighter' : row.status === 'Rejected' ? 'error.lighter' : 'warning.lighter',
                              color: row.status === 'Accepted' || row.status === 'Hired' ? 'success.darker' : row.status === 'Rejected' ? 'error.darker' : 'warning.darker',
                              fontWeight: 'bold'
                            }}
                          >
                            {row.status}
                          </Typography>
                        </TableCell>
                        {viewType === 'hr' && <TableCell>{row.referrer}</TableCell>}
                        <TableCell>{new Date(row.creation).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          {viewType === 'hr' && row.status === 'Pending' && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleCreateApplicant(row.name)}
                            >
                              Create Job Applicant
                            </Button>
                          )}
                          {row.job_applicant && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Applicant: {row.job_applicant}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!referrals.length && !loading && (
                      <TableRow>
                        <TableCell colSpan={viewType === 'hr' ? 7 : 6}>
                          <EmptyContent
                            title={filterName ? "No matches found" : "No Referrals Found"}
                            description={filterName ? `No results found for "${filterName}"` : (viewType === 'hr' ? "No referrals found in the system." : "You haven't submitted any referrals yet.")}
                            icon="solar:user-id-bold-duotone"
                            sx={{ py: 10 }}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={total}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: (t) => `1px solid ${t.palette.divider}` }}
        />
      </Card>

      <ReferralModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={(msg) => {
          setSnackbar({ open: true, message: msg, severity: 'success' });
          loadData();
        }}
        onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
        selectedJob={selectedJob}
        jobOptions={jobs}
      />

      <JobOpeningDetailsDialog
        open={openJobDetails}
        onClose={() => setOpenJobDetails(false)}
        onRefer={handleReferClick}
        job={selectedJobData}
      />

      <ReferralTableFiltersDrawer
        open={openFilters}
        onOpen={() => setOpenFilters(true)}
        onClose={() => setOpenFilters(false)}
        filters={filters}
        onFilters={handleFilters}
        canReset={canReset}
        onResetFilters={handleResetFilters}
        currentTab={currentTab}
        jobOptions={jobs.map(j => ({ name: j.name, job_title: j.job_title }))}
        locationOptions={[...new Set(jobs.map(j => j.location))]}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
