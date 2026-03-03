import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useJobApplicants } from 'src/hooks/useJobApplicants';

import { getDoctypeList } from 'src/api/leads';
import { DashboardContent } from 'src/layouts/dashboard';
import {
    getJobApplicant,
    createJobApplicant,
    updateJobApplicant,
    deleteJobApplicant,
    getJobApplicantPermissions,
} from 'src/api/job-applicants';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { TableNoData } from 'src/sections/lead/table-no-data';
import { TableEmptyRows } from 'src/sections/lead/table-empty-rows';
import { JobApplicantTableRow } from 'src/sections/job-applicants/job-applicant-table-row';
import { LeadTableHead as JobApplicantTableHead } from 'src/sections/lead/lead-table-head';
import { LeadTableToolbar as JobApplicantTableToolbar } from 'src/sections/lead/lead-table-toolbar';
import { JobApplicantDetailsDialog } from 'src/sections/job-applicants/job-applicant-details-dialog';
import { JobApplicantsTableFiltersDrawer } from 'src/sections/job-applicants/job-applicants-table-filters-drawer';

// ----------------------------------------------------------------------

export function JobApplicantsView() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState('creation');
    const [selected, setSelected] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        job_title: 'all',
        startDate: null as string | null,
        endDate: null as string | null
    });

    const { data, total, refetch } = useJobApplicants(
        page + 1,
        rowsPerPage,
        filterName,
        orderBy,
        order,
        filters
    );

    const [permissions, setPermissions] = useState({ read: false, write: false, delete: false });
    const [jobOpenings, setJobOpenings] = useState<any[]>([]);

    // Dialog states
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [viewApplicant, setViewApplicant] = useState<any>(null);
    const [editApplicant, setEditApplicant] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState<any>({
        applicant_name: '',
        email_id: '',
        phone_number: '',
        job_title: '',
        status: 'Received',
        source: '',
        cover_letter: '',
        resume_attachment: '',
        resume_link: '',
        lower_range: '',
        upper_range: '',
        currency: 'INR',
    });

    // Snackbar
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        const fetchData = async () => {
            const perms = await getJobApplicantPermissions();
            setPermissions(perms);

            const jobs = await getDoctypeList('Job Opening', ['name', 'job_title']);
            setJobOpenings(jobs);
        };
        fetchData();
    }, []);

    const handleSelectAllRows = (checked: boolean) => {
        if (checked) {
            setSelected(data.map((row) => row.name));
        } else {
            setSelected([]);
        }
    };

    const handleSelectRow = (name: string) => {
        setSelected((prev) =>
            prev.includes(name) ? prev.filter((id) => id !== name) : [...prev, name]
        );
    };

    const handleOpenCreate = () => {
        setEditApplicant(null);
        setFormData({
            applicant_name: '',
            email_id: '',
            phone_number: '',
            job_title: '',
            status: 'Received',
            source: '',
            cover_letter: '',
            resume_attachment: '',
            resume_link: '',
            lower_range: '',
            upper_range: '',
            currency: 'INR',
        });
        setOpenCreate(true);
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setEditApplicant(null);
    };

    const handleEditRow = useCallback(async (row: any) => {
        try {
            const fullData = await getJobApplicant(row.name);
            setEditApplicant(fullData);
            setFormData({
                applicant_name: fullData.applicant_name,
                email_id: fullData.email_id,
                phone_number: fullData.phone_number,
                job_title: fullData.job_title,
                status: fullData.status,
                source: fullData.source,
                cover_letter: fullData.cover_letter,
                resume_attachment: fullData.resume_attachment,
                resume_link: fullData.resume_link,
                lower_range: fullData.lower_range,
                upper_range: fullData.upper_range,
                currency: fullData.currency || 'INR',
            });
            setOpenCreate(true);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to load record',
                severity: 'error',
            });
        }
    }, []);

    const handleViewRow = useCallback(async (row: any) => {
        try {
            const fullData = await getJobApplicant(row.name);
            setViewApplicant(fullData);
            setOpenView(true);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to load record',
                severity: 'error',
            });
        }
    }, []);

    const handleDeleteRow = useCallback(async (name: string) => {
        try {
            await deleteJobApplicant(name);
            setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
            refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Delete failed', severity: 'error' });
        }
    }, [refetch]);

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selected.map((name) => deleteJobApplicant(name)));
            setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
            setSelected([]);
            refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Bulk delete failed', severity: 'error' });
        }
    };

    const handleSubmit = async () => {
        try {
            if (editApplicant) {
                await updateJobApplicant(editApplicant.name, formData);
                setSnackbar({ open: true, message: 'Updated successfully', severity: 'success' });
            } else {
                await createJobApplicant(formData);
                setSnackbar({ open: true, message: 'Created successfully', severity: 'success' });
            }
            handleCloseCreate();
            refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Action failed', severity: 'error' });
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilters = (newFilters: Partial<typeof filters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            status: 'all',
            job_title: 'all',
            startDate: null,
            endDate: null
        });
        setPage(0);
    };

    const canReset = filters.status !== 'all' || filters.job_title !== 'all' || filters.startDate !== null || filters.endDate !== null;

    const handleSortChange = (value: string) => {
        if (value === 'date_desc') { setOrderBy('creation'); setOrder('desc'); }
        else if (value === 'date_asc') { setOrderBy('creation'); setOrder('asc'); }
        else if (value === 'name_asc') { setOrderBy('applicant_name'); setOrder('asc'); }
        else if (value === 'name_desc') { setOrderBy('applicant_name'); setOrder('desc'); }
        setPage(0);
    };

    const getCurrentSortValue = () => {
        if (orderBy === 'creation') return order === 'desc' ? 'date_desc' : 'date_asc';
        if (orderBy === 'applicant_name') return order === 'desc' ? 'name_desc' : 'name_asc';
        return 'date_desc';
    };

    const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(event.target.value);
        setPage(0);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const notFound = !data.length && !!filterName;
    const empty = !data.length && !filterName;

    return (
        <DashboardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
                <Typography variant="h4">Job Applicants</Typography>
                {permissions.write && (
                    <Button
                        variant="contained"
                        sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={handleOpenCreate}
                    >
                        New Applicant
                    </Button>
                )}
            </Box>

            <Card>
                <JobApplicantTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                    searchPlaceholder="Search applicants..."
                    onDelete={selected.length > 0 ? handleBulkDelete : undefined}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                    sortBy={getCurrentSortValue()}
                    onSortChange={handleSortChange}
                    sortOptions={[
                        { value: 'date_desc', label: 'Newest First' },
                        { value: 'date_asc', label: 'Oldest First' },
                        { value: 'name_asc', label: 'Name: A to Z' },
                        { value: 'name_desc', label: 'Name: Z to A' },
                    ]}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <JobApplicantTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={data.length}
                                numSelected={selected.length}
                                onSelectAllRows={(checked: boolean) => handleSelectAllRows(checked)}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'applicant_name', label: 'Name' },
                                    { id: 'job_title', label: 'Job Opening' },
                                    { id: 'phone_number', label: 'Phone' },
                                    { id: 'status', label: 'Status' },
                                    { id: '', label: '' },
                                ]}
                            />
                            <TableBody>
                                {data.map((row, index) => (
                                    <JobApplicantTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        hideCheckbox
                                        row={{
                                            id: row.name,
                                            applicant_name: row.applicant_name,
                                            email_id: row.email_id,
                                            phone_number: row.phone_number,
                                            job_title: row.job_title,
                                            status: row.status,
                                        }}
                                        selected={selected.includes(row.name)}
                                        onSelectRow={() => handleSelectRow(row.name)}
                                        onView={() => handleViewRow(row)}
                                        onEdit={() => handleEditRow(row)}
                                        onDelete={() => handleDeleteRow(row.name)}
                                        canEdit={permissions.write}
                                        canDelete={permissions.delete}
                                    />
                                ))}

                                {notFound && <TableNoData searchQuery={filterName} />}

                                {empty && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <EmptyContent
                                                title="No applicants found"
                                                description="There are no candidates for your job openings yet."
                                                icon="solar:user-resume-bold-duotone"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!empty && (
                                    <TableEmptyRows
                                        height={68}
                                        emptyRows={Math.max(0, rowsPerPage - data.length)}
                                    />
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
                />
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="md">
                <DialogTitle
                    sx={{
                        m: 0,
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'background.neutral',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {editApplicant ? 'Edit Applicant' : 'New Applicant'}
                    </Typography>

                    <IconButton
                        onClick={handleCloseCreate}
                        sx={{
                            p: 0.75,
                            bgcolor: 'background.paper',
                            boxShadow: (theme) => theme.customShadows.z8,
                            '&:hover': {
                                bgcolor: 'background.paper',
                                color: 'error.main',
                            },
                        }}
                    >
                        <Iconify icon="mingcute:close-line" width={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <TextField
                                fullWidth
                                label="Applicant Name"
                                value={formData.applicant_name}
                                onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email ID"
                                value={formData.email_id}
                                onChange={(e) => setFormData({ ...formData, email_id: e.target.value })}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            />
                            <TextField
                                select
                                fullWidth
                                label="Job Opening"
                                value={formData.job_title}
                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                            >
                                {jobOpenings.map((job) => (
                                    <MenuItem key={job.name} value={job.name}>
                                        {job.job_title || job.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                fullWidth
                                label="Status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value="Received">Received</MenuItem>
                                <MenuItem value="Open">Open</MenuItem>
                                <MenuItem value="Replied">Replied</MenuItem>
                                <MenuItem value="Hold">Hold</MenuItem>
                                <MenuItem value="Accepted">Accepted</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </TextField>

                            <TextField
                                fullWidth
                                label="Source"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                placeholder="LinkedIn, Referral, etc."
                            />


                            <TextField
                                fullWidth
                                label="Resume Link"
                                value={formData.resume_link}
                                onChange={(e) => setFormData({ ...formData, resume_link: e.target.value })}
                                placeholder="Google Drive, Dropbox, etc."
                            />

                            <TextField
                                fullWidth
                                label="Resume Attachment"
                                value={formData.resume_attachment}
                                onChange={(e) => setFormData({ ...formData, resume_attachment: e.target.value })}
                                placeholder="File URL"
                                helperText="For now, please provide the URL of the uploaded resume."
                            />

                            <TextField
                                fullWidth
                                label="Expected Salary (Lower)"
                                type="number"
                                value={formData.lower_range}
                                onChange={(e) => setFormData({ ...formData, lower_range: e.target.value })}
                            />

                            <TextField
                                fullWidth
                                label="Expected Salary (Upper)"
                                type="number"
                                value={formData.upper_range}
                                onChange={(e) => setFormData({ ...formData, upper_range: e.target.value })}
                            />

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Cover Letter"
                                value={formData.cover_letter}
                                onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                                sx={{ gridColumn: 'span 2' }}
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editApplicant ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <JobApplicantDetailsDialog
                open={openView}
                onClose={() => setOpenView(false)}
                applicant={viewApplicant}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Filters Drawer */}
            <JobApplicantsTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                jobOpenings={jobOpenings}
            />
        </DashboardContent>
    );
}
