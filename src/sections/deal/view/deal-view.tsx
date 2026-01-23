import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TablePagination from '@mui/material/TablePagination';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useDeals } from 'src/hooks/useDeals';

import { getFriendlyErrorMessage } from 'src/utils/error-handler';

import { getDoctypeList } from 'src/api/leads';
import { DashboardContent } from 'src/layouts/dashboard';
import { createDeal, updateDeal, deleteDeal, getDealPermissions } from 'src/api/deals';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { DealTableRow } from '../deal-table-row';
import { TableNoData } from '../../user/table-no-data';
import { DealDetailsDialog } from '../deal-details-dialog';
import { TableEmptyRows } from '../../user/table-empty-rows';
import { DealTableFiltersDrawer } from '../deal-table-filters-drawer';
import { UserTableHead as DealTableHead } from '../../user/user-table-head';
import { UserTableToolbar as DealTableToolbar } from '../../user/user-table-toolbar';

// ----------------------------------------------------------------------

export function DealView() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [filterStage, setFilterStage] = useState('all');
    const [filters, setFilters] = useState({
        type: 'all',
        contact: 'all',
        account: 'all',
        source_lead: 'all',
        stage: 'all',
    });
    const [openFilters, setOpenFilters] = useState(false);
    const [sortBy, setSortBy] = useState('modified_desc');
    const [selected, setSelected] = useState<string[]>([]);

    const STAGE_OPTIONS = [
        { value: 'Qualification', label: 'Qualification' },
        { value: 'Needs Analysis', label: 'Needs Analysis' },
        { value: 'Meeting Scheduled', label: 'Meeting Scheduled' },
        { value: 'Proposal Sent', label: 'Proposal Sent' },
        { value: 'Negotiation', label: 'Negotiation' },
        { value: 'Closed Won', label: 'Closed Won' },
        { value: 'Closed Lost', label: 'Closed Lost' },
    ];

    const [openCreate, setOpenCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [currentDealId, setCurrentDealId] = useState<string | null>(null);
    const [viewOnly, setViewOnly] = useState(false);
    const [openView, setOpenView] = useState(false);

    // Form state
    const [dealTitle, setDealTitle] = useState('');
    const [account, setAccount] = useState('');
    const [contact, setContact] = useState('');
    const [value, setValue] = useState<number | string>('');
    const [expectedCloseDate, setExpectedCloseDate] = useState<Dayjs | null>(null);
    const [stage, setStage] = useState('Qualification');
    const [probability, setProbability] = useState<number | string>('');
    const [dealType, setDealType] = useState('New Business');
    const [sourceLead, setSourceLead] = useState('');
    const [nextStep, setNextStep] = useState('');
    const [notes, setNotes] = useState('');

    // Dropdown Options
    const [accountOptions, setAccountOptions] = useState<any[]>([]);
    const [contactOptions, setContactOptions] = useState<any[]>([]);
    const [leadOptions, setLeadOptions] = useState<any[]>([]);

    // Alert & Dialog State
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // Permissions State
    const [permissions, setPermissions] = useState<{ read: boolean; write: boolean; delete: boolean }>({
        read: true,
        write: true,
        delete: true,
    });

    // Validation State
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});

    const { data, total, loading, refetch } = useDeals(
        page,
        rowsPerPage,
        filterName,
        filterStage,
        sortBy,
        filters
    );

    const handleFilters = (update: any) => {
        setFilters((prev) => ({ ...prev, ...update }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            type: 'all',
            contact: 'all',
            account: 'all',
            source_lead: 'all',
            stage: 'all',
        });
        setPage(0);
    };

    const canReset =
        filters.type !== 'all' ||
        filters.contact !== 'all' ||
        filters.account !== 'all' ||
        filters.source_lead !== 'all' ||
        filters.stage !== 'all';

    useEffect(() => {
        // Fetch dropdown options on mount - get full objects for filter drawer
        Promise.all([
            fetch('/api/method/frappe.client.get_list?doctype=Accounts&fields=["name","account_name"]&limit_page_length=999', { credentials: 'include' }),
            fetch('/api/method/frappe.client.get_list?doctype=Contacts&fields=["name","first_name"]&limit_page_length=999', { credentials: 'include' }),
            fetch('/api/method/frappe.client.get_list?doctype=Lead&fields=["name","lead_name"]&limit_page_length=999', { credentials: 'include' })
        ]).then(async ([accountsRes, contactsRes, leadsRes]) => {
            const accounts = await accountsRes.json();
            const contacts = await contactsRes.json();
            const leads = await leadsRes.json();

            setAccountOptions(accounts.message || []);
            setContactOptions(contacts.message || []);
            setLeadOptions(leads.message || []);
        }).catch(err => console.error('Failed to fetch dropdown options', err));

        // Fetch Permissions
        getDealPermissions().then(setPermissions);
    }, []);

    const handleOpenCreate = () => {
        setViewOnly(false);
        setOpenCreate(true);
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setCurrentDealId(null);
        setViewOnly(false);
        setDealTitle('');
        setAccount('');
        setContact('');
        setValue('');
        setExpectedCloseDate(null);
        setStage('Qualification');
        setProbability('');
        setDealType('New Business');
        setSourceLead('');
        setNextStep('');
        setNotes('');
        setValidationErrors({}); // Clear errors on close
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDelete({ open: true, id });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            await deleteDeal(confirmDelete.id);
            setSnackbar({ open: true, message: 'Deal deleted successfully', severity: 'success' });
            await refetch();
        } catch (e) {
            console.error(e);
            setSnackbar({ open: true, message: 'Failed to delete deal', severity: 'error' });
        } finally {
            setConfirmDelete({ open: false, id: null });
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selected.map((id) => deleteDeal(id)));
            setSnackbar({ open: true, message: `${selected.length} deals deleted successfully`, severity: 'success' });
            setSelected([]);
            await refetch();
        } catch (e: any) {
            setSnackbar({ open: true, message: e.message || 'Error during bulk delete', severity: 'error' });
        }
    };

    const handleSelectAllRows = (checked: boolean, ids: string[]) => {
        if (checked) {
            setSelected(ids);
            return;
        }
        setSelected([]);
    };

    const handleSelectRow = (id: string) => {
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

    const handleCreate = async () => {
        // Validation
        const newErrors: { [key: string]: boolean } = {};
        const missingFields: string[] = [];

        if (!dealTitle) {
            newErrors.dealTitle = true;
            missingFields.push('Deal Title');
        }
        if (!account) {
            newErrors.account = true;
            missingFields.push('Account');
        }
        if (!value) {
            newErrors.value = true;
            missingFields.push('Deal Value');
        }
        if (!stage) {
            newErrors.stage = true;
            missingFields.push('Stage');
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            setSnackbar({
                open: true,
                message: `Please fill in mandatory fields: ${missingFields.join(', ')}`,
                severity: 'error'
            });
            return;
        }

        try {
            setCreating(true);

            const dealData = {
                deal_title: dealTitle,
                account,
                contact,
                value: Number(value),
                expected_close_date: expectedCloseDate ? expectedCloseDate.format('YYYY-MM-DD') : '',
                stage: stage as any,
                probability: probability ? Number(probability) : undefined,
                type: dealType as any,
                source_lead: sourceLead,
                next_step: nextStep,
                notes,
            };

            if (currentDealId) {
                await updateDeal(currentDealId, dealData);
                setSnackbar({ open: true, message: 'Deal updated successfully', severity: 'success' });
            } else {
                await createDeal(dealData);
                setSnackbar({ open: true, message: 'Deal created successfully', severity: 'success' });
            }

            await refetch();
            handleCloseCreate();
        } catch (err: any) {
            console.error(err);
            const friendlyMsg = getFriendlyErrorMessage(err);
            setSnackbar({ open: true, message: friendlyMsg || (currentDealId ? 'Failed to update deal' : 'Failed to create deal'), severity: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const handleEditRow = (id: string) => {
        setViewOnly(false);
        setCurrentDealId(id);

        const fullRow = data.find((item) => item.name === id);
        if (fullRow) {
            setDealTitle(fullRow.deal_title || '');
            setAccount(fullRow.account || '');
            setContact(fullRow.contact || '');
            setValue(fullRow.value || '');
            setExpectedCloseDate(fullRow.expected_close_date ? dayjs(fullRow.expected_close_date) : null);
            setStage(fullRow.stage || 'Qualification');
            setProbability(fullRow.probability || '');
            setDealType(fullRow.type || 'New Business');
            setSourceLead(fullRow.source_lead || '');
            setNextStep(fullRow.next_step || '');
            setNotes(fullRow.notes || '');
        }
        setOpenCreate(true);
    };

    const handleViewRow = (id: string) => {
        setCurrentDealId(id);
        setOpenView(true);
    };

    const onChangePage = (_: unknown, newPage: number) => setPage(newPage);

    const onChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const notFound = !loading && data.length === 0 && (!!filterName || filterStage !== 'all' || canReset);
    const empty = !loading && data.length === 0 && !filterName && filterStage === 'all' && !canReset;

    return (
        <>
            {/* CREATE DEAL DIALOG */}
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="md">
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {viewOnly ? 'Deal Details' : (currentDealId ? 'Edit Deal' : 'New Deal')}
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseCreate}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box
                            sx={{
                                display: 'grid',
                                margin: '1rem',
                                columnGap: 2,
                                rowGap: 3,
                                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Deal Title"
                                value={dealTitle}
                                onChange={(e) => {
                                    setDealTitle(e.target.value);
                                    if (e.target.value) setValidationErrors(prev => ({ ...prev, dealTitle: false }));
                                }}
                                required
                                error={!!validationErrors.dealTitle}
                                slotProps={{ input: { readOnly: viewOnly } }}
                            />

                            <Autocomplete
                                fullWidth
                                options={accountOptions}
                                value={accountOptions.find((a) => a.name === account) || null}
                                onChange={(event, newValue) => {
                                    setAccount(newValue?.name || '');
                                    if (newValue) setValidationErrors((prev) => ({ ...prev, account: false }));
                                }}
                                getOptionLabel={(option) => `${option.account_name || option.name} (${option.name})`}
                                disabled={viewOnly}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            bgcolor: '#F0F8FF',
                                            '& .MuiAutocomplete-listbox': {
                                                bgcolor: '#F0F8FF',
                                            },
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Account"
                                        required
                                        error={!!validationErrors.account}
                                    />
                                )}
                            />

                            <Autocomplete
                                fullWidth
                                options={contactOptions}
                                value={contactOptions.find((c) => c.name === contact) || null}
                                onChange={(event, newValue) => setContact(newValue?.name || '')}
                                getOptionLabel={(option) => `${option.first_name || option.name} (${option.name})`}
                                disabled={viewOnly}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            bgcolor: '#F0F8FF',
                                            '& .MuiAutocomplete-listbox': {
                                                bgcolor: '#F0F8FF',
                                            },
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Contact"
                                    />
                                )}
                            />

                            <TextField
                                fullWidth
                                label="Deal Value"
                                type="number"
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    if (e.target.value) setValidationErrors(prev => ({ ...prev, value: false }));
                                }}
                                required
                                error={!!validationErrors.value}
                                slotProps={{ input: { readOnly: viewOnly } }}
                            />

                            <DatePicker
                                label="Expected Close Date"
                                value={expectedCloseDate}
                                onChange={(newValue) => setExpectedCloseDate(newValue)}
                                disabled={viewOnly}
                                slotProps={{
                                    textField: {
                                        fullWidth: true
                                    }
                                }}
                            />

                            <TextField
                                select
                                fullWidth
                                label="Stage"
                                value={stage}
                                onChange={(e) => {
                                    setStage(e.target.value);
                                    if (e.target.value) setValidationErrors(prev => ({ ...prev, stage: false }));
                                }}
                                required
                                error={!!validationErrors.stage}
                                disabled={viewOnly}
                                SelectProps={{ native: true }}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    "& .MuiInputBase-input.Mui-disabled": {
                                        WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                                    },
                                }}
                            >
                                <option value="Qualification">Qualification</option>
                                <option value="Needs Analysis">Needs Analysis</option>
                                <option value="Meeting Scheduled">Meeting Scheduled</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Negotiation">Negotiation</option>
                                <option value="Closed Won">Closed Won</option>
                                <option value="Closed Lost">Closed Lost</option>
                            </TextField>

                            <TextField
                                fullWidth
                                label="Probability (%)"
                                type="number"
                                value={probability}
                                onChange={(e) => setProbability(e.target.value)}
                                slotProps={{ input: { readOnly: viewOnly } }}
                            />

                            <TextField
                                select
                                fullWidth
                                label="Type"
                                value={dealType}
                                onChange={(e) => setDealType(e.target.value)}
                                disabled={viewOnly}
                                SelectProps={{ native: true }}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    "& .MuiInputBase-input.Mui-disabled": {
                                        WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                                    },
                                }}
                            >
                                <option value="New Business">New Business</option>
                                <option value="Existing Business">Existing Business</option>
                            </TextField>

                            <Autocomplete
                                fullWidth
                                options={leadOptions}
                                value={leadOptions.find((l) => l.name === sourceLead) || null}
                                onChange={(event, newValue) => setSourceLead(newValue?.name || '')}
                                getOptionLabel={(option) => `${option.lead_name || option.name} (${option.name})`}
                                disabled={viewOnly}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            bgcolor: '#F0F8FF',
                                            '& .MuiAutocomplete-listbox': {
                                                bgcolor: '#F0F8FF',
                                            },
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Source Lead"
                                    />
                                )}
                            />

                            <TextField
                                fullWidth
                                label="Next Step"
                                value={nextStep}
                                onChange={(e) => setNextStep(e.target.value)}
                                slotProps={{ input: { readOnly: viewOnly } }}
                            />

                            <TextField
                                fullWidth
                                label="Notes"
                                multiline
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                sx={{ gridColumn: { sm: 'span 2' } }}
                                slotProps={{ input: { readOnly: viewOnly } }}
                            />
                        </Box>
                    </LocalizationProvider>
                </DialogContent>

                <DialogActions>
                    {!viewOnly && (
                        <Button variant="contained" onClick={handleCreate} disabled={creating}>
                            {creating ? (currentDealId ? 'Updating...' : 'Creating...') : (currentDealId ? 'Update Deal' : 'Create Deal')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* MAIN CONTENT */}
            <DashboardContent>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ flexGrow: 1 }}>
                        Deals
                    </Typography>

                    {permissions.write && (
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={handleOpenCreate}
                            sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                        >
                            New Deal
                        </Button>
                    )}
                </Box>

                <Card>
                    <DealTableToolbar
                        numSelected={selected.length}
                        filterName={filterName}
                        onFilterName={(e) => {
                            setFilterName(e.target.value);
                            setPage(0);
                        }}
                        searchPlaceholder="Search deals..."
                        onOpenFilter={() => setOpenFilters(true)}
                        canReset={canReset}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        onDelete={handleBulkDelete}
                        sortOptions={[
                            { value: 'modified_desc', label: 'Newest First' },
                            { value: 'modified_asc', label: 'Oldest First' },
                            { value: 'deal_title_asc', label: 'Title: A to Z' },
                            { value: 'deal_title_desc', label: 'Title: Z to A' },
                            { value: 'account_asc', label: 'Account: A to Z' },
                            { value: 'account_desc', label: 'Account: Z to A' },
                            { value: 'contact_name_asc', label: 'Contact Name: A to Z' },
                            { value: 'contact_name_desc', label: 'Contact Name: Z to A' },
                            { value: 'value_desc', label: 'Deal Value: High to Low' },
                            { value: 'value_asc', label: 'Deal Value: Low to High' },
                        ]}
                    />

                    <Scrollbar>
                        <TableContainer sx={{ overflow: 'unset' }}>
                            <Table sx={{ minWidth: 800 }}>
                                <DealTableHead
                                    rowCount={total}
                                    numSelected={selected.length}
                                    onSelectAllRows={(checked: boolean) =>
                                        handleSelectAllRows(
                                            checked,
                                            data.map((row) => row.name)
                                        )
                                    }
                                    headLabel={[
                                        { id: 'deal_title', label: 'Title' },
                                        { id: 'account', label: 'Account' },
                                        { id: 'contact', label: 'Contact' },
                                        { id: 'value', label: 'Value' },
                                        { id: 'stage', label: 'Stage' },
                                        { id: 'expected_close_date', label: 'Expected Close' },
                                        { id: '' },
                                    ]}
                                />

                                <TableBody>
                                    {loading && (
                                        <TableEmptyRows height={68} emptyRows={rowsPerPage} />
                                    )}

                                    {!loading &&
                                        data.map((row) => (
                                            <DealTableRow
                                                key={row.name}
                                                row={{
                                                    id: row.name,
                                                    title: row.deal_title ?? '-',
                                                    account: row.account ?? '-',
                                                    contact: row.contact ?? '-',
                                                    contactName: row.contact_name ?? '',
                                                    value: row.value ?? 0,
                                                    stage: row.stage ?? '-',
                                                    expectedCloseDate: row.expected_close_date ?? '-',
                                                    avatarUrl: '/assets/images/avatar/avatar-25.webp',
                                                }}
                                                selected={selected.includes(row.name)}
                                                onSelectRow={() => handleSelectRow(row.name)}
                                                onEdit={() => handleEditRow(row.name)}
                                                onDelete={() => handleDeleteClick(row.name)}
                                                onView={() => handleViewRow(row.name)}
                                                canEdit={permissions.write}
                                                canDelete={permissions.delete}
                                            />
                                        ))}

                                    {notFound && <TableNoData searchQuery={filterName} />}

                                    {empty && (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">
                                                <EmptyContent
                                                    title="No deals found"
                                                    description="Create a new deal to track your sales pipeline."
                                                    icon="solar:hand-stars-bold-duotone"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {!empty && !loading && data.length < rowsPerPage && (
                                        <TableEmptyRows
                                            height={68}
                                            emptyRows={rowsPerPage - data.length}
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
                        onPageChange={onChangePage}
                        rowsPerPageOptions={[5, 10, 25]}
                        onRowsPerPageChange={onChangeRowsPerPage}
                    />
                </Card>

                <DealDetailsDialog
                    open={openView}
                    onClose={() => {
                        setOpenView(false);
                        setCurrentDealId(null);
                    }}
                    dealId={currentDealId}
                    onEdit={handleEditRow}
                />
            </DashboardContent>

            <DealTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                options={{
                    contacts: contactOptions,
                    accounts: accountOptions,
                    source_leads: leadOptions,
                }}
            />

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                title="Confirm Delete"
                content="Are you sure you want to delete this deal?"
                action={
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        Delete
                    </Button>
                }
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
        </>
    );
}
