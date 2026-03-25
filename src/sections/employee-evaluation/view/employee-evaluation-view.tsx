import { useState, useCallback, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useEmployeeEvaluationTraits, useEmployeeEvaluationEvents, useEmployeeEvaluationScoreLogs } from 'src/hooks/useEmployeeEvaluation';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  deleteEmployeeEvaluationTrait,
  deleteEmployeeEvaluationEvent,
  submitEmployeeEvaluationEvent,
  cancelEmployeeEvaluationEvent,
  resetAllEmployeeScores
} from 'src/api/employee-evaluation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { TableNoData, TableEmptyRows } from 'src/components/table';

import { useAuth } from 'src/auth/auth-context';

import { EmployeeEvaluationTableHead } from '../employee-evaluation-table-head';
import { EmployeeEvaluationTraitTableRow } from '../evaluation-trait-table-row';
import { EmployeeEvaluationEventTableRow } from '../employee-evaluation-table-row';
import { EmployeeEvaluationTraitFormDialog } from '../evaluation-trait-form-dialog';
import { EmployeeEvaluationTableToolbar } from '../employee-evaluation-table-toolbar';
import { EmployeeEvaluationEventFormDialog } from '../employee-evaluation-form-dialog';
import { EmployeeEvaluationEventDetailsDialog } from '../employee-evaluation-details-dialog';
import { EmployeeEvaluationScoreLogTableRow } from '../employee-evaluation-score-log-table-row';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'events', label: 'Employee Evaluations', icon: <Iconify icon={"solar:clipboard-check-bold-duotone" as any} width={20} /> },
  { value: 'traits', label: 'Behavior Assessment', icon: <Iconify icon={"solar:user-speak-bold-duotone" as any} width={20} /> },
  { value: 'logs', label: 'Score Logs', icon: <Iconify icon={"solar:history-bold-duotone" as any} width={20} /> },
];

export function EmployeeEvaluationView() {
  const { user } = useAuth();

  const isAdminOrManager = user?.roles.some(role => 
    ['Administrator', 'HR Manager', 'System Manager', 'Task Manager'].includes(role)
  );

  const isEmployee = user?.roles.includes('Employee');

  const hideTabs = isEmployee && !isAdminOrManager;

  const filteredTabs = hideTabs ? TABS.filter(tab => tab.value === 'logs') : TABS;

  const [currentTab, setCurrentTab] = useState(hideTabs ? 'logs' : 'events');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterName, setFilterName] = useState('');
  const [sortBy, setSortBy] = useState('modified_desc');

  const [openDetails, setOpenDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [openEventForm, setOpenEventForm] = useState(false);
  const [openTraitForm, setOpenTraitForm] = useState(false);
  const [selectedTrait, setSelectedTrait] = useState<any>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    type: 'event' | 'trait' | null;
    name: string | null;
    isSubmitted?: boolean;
  }>({
    open: false,
    type: null,
    name: null,
    isSubmitted: false,
  });

  const [filters, setFilters] = useState<any>({
    employee: null,
    trait: null,
    evaluation_type: 'all',
    docstatus: null,
    category: '',
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    if (hideTabs && user?.employee) {
      setFilters((prev: any) => ({ ...prev, employee: user.employee }));
    }
  }, [hideTabs, user?.employee]);

  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetResults, setResetResults] = useState<any[]>([]);
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);

  const { data: events, total: totalEvents, loading: loadingEvents, refetch: refetchEvents } = useEmployeeEvaluationEvents(page + 1, rowsPerPage, filterName, sortBy, filters);
  const { data: logs, total: totalLogs, loading: loadingLogs, refetch: refetchLogs } = useEmployeeEvaluationScoreLogs(page + 1, rowsPerPage, filterName, sortBy, filters);
  const { data: traits, total: totalTraits, loading: loadingTraits, refetch: refetchTraits } = useEmployeeEvaluationTraits(page + 1, rowsPerPage, filterName, sortBy, filters);

  const canReset = !!filterName || (filters.employee && !hideTabs) || !!filters.trait || (filters.evaluation_type !== 'all') || (filters.docstatus !== null) || !!filters.category || !!filters.startDate || !!filters.endDate;

  const notFoundEvents = !events.length && !!filterName && !loadingEvents;
  const emptyEvents = !events.length && !filterName && !loadingEvents;

  const notFoundLogs = !logs.length && !!filterName && !loadingLogs;
  const emptyLogs = !logs.length && !filterName && !loadingLogs;

  const notFoundTraits = !traits.length && !!filterName && !loadingTraits;
  const emptyTraits = !traits.length && !filterName && !loadingTraits;

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setPage(0);
  }, []);

  const renderTabs = (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: '#00A5D1',
          },
          '& .MuiTab-root.Mui-selected': {
            color: '#00A5D1',
          },
        }}
      >
        {filteredTabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} iconPosition="start" />
        ))}
      </Tabs>

      {!hideTabs && currentTab !== 'logs' && (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={() => setOpenResetDialog(true)}
            sx={{ height: 40 }}
          >
            Reset Scores
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ bgcolor: '#00A5D1', '&:hover': { bgcolor: '#0084a7' } }}
            onClick={() => {
              if (currentTab === 'events') setOpenEventForm(true);
              if (currentTab === 'traits') {
                setSelectedTrait(null);
                setOpenTraitForm(true);
              }
            }}
          >
            {currentTab === 'events' ? 'New Event' : 'New Trait'}
          </Button>
        </Stack>
      )}
    </Stack>
  );

  return (
    <DashboardContent maxWidth={false}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Employee Evaluation</Typography>
      </Stack>

      <Card>
        {renderTabs}

        <EmployeeEvaluationTableToolbar
          filterName={filterName}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            setPage(0);
          }}
          sortBy={sortBy}
          onSortChange={(value) => {
            setSortBy(value);
            setPage(0);
          }}
          sortOptions={[
            { value: 'modified_desc', label: 'Newest First' },
            { value: 'modified_asc', label: 'Oldest First' },
          ]}
          filters={filters}
          onFilters={(update) => {
            setFilters((prev: any) => ({ ...prev, ...update }));
            setPage(0);
          }}
          canReset={canReset}
          onResetFilters={() => {
            setFilterName('');
            setFilters({
              employee: hideTabs ? user?.employee : null,
              trait: null,
              evaluation_type: 'all',
              docstatus: null,
              category: '',
              startDate: null,
              endDate: null,
            });
          }}
          currentTab={currentTab}
          traitsOptions={traits}
          hideEmployeeFilter={hideTabs}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
            <Table>
              {currentTab === 'events' && (
                <>
                  <EmployeeEvaluationTableHead
                    headLabel={[
                      { id: 'sno', label: 'Sno', align: 'center' },
                      { id: 'employee', label: 'Employee' },
                      { id: 'trait', label: 'Trait' },
                      { id: 'type', label: 'Type' },
                      { id: 'change', label: 'Change' },
                      { id: 'date', label: 'Date' },
                      { id: 'status', label: 'Status' },
                      { id: '' },
                    ]}
                  />
                  <TableBody>
                    {events.map((row, index) => (
                      <EmployeeEvaluationEventTableRow
                        key={row.name}
                        row={row}
                        index={page * rowsPerPage + index}
                        selected={false}
                        onSelectRow={() => { }}
                        onView={() => {
                          setSelectedEvent(row);
                          setOpenDetails(true);
                        }}
                        onEdit={() => {
                          setSelectedEvent(row);
                          setOpenEventForm(true);
                        }}
                        onSubmit={async () => {
                          try {
                            await submitEmployeeEvaluationEvent({
                              doctype: 'Employee Evaluation',
                              ...row,
                            });
                            refetchEvents();
                            refetchLogs();
                          } catch (error) {
                            console.error(error);
                          }
                        }}
                        onCancel={async () => {
                          try {
                            await cancelEmployeeEvaluationEvent(row.name);
                            refetchEvents();
                            refetchLogs();
                          } catch (error) {
                            console.error(error);
                          }
                        }}
                        onDelete={() => {
                          setConfirmDelete({
                            open: true,
                            type: 'event',
                            name: row.name,
                            isSubmitted: row.docstatus === 1,
                          });
                        }}
                      />
                    ))}

                    {emptyEvents && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <EmptyContent
                            title="No Employee Evaluation Assessment"
                            description="Wait for HR to add employee evaluations for employees."
                            icon="solar:clipboard-check-bold-duotone"
                          />
                        </TableCell>
                      </TableRow>
                    )}

                    {!emptyEvents && !notFoundEvents && (
                      <TableEmptyRows
                        height={77}
                        emptyRows={rowsPerPage - events.length}
                      />
                    )}

                    {notFoundEvents && <TableNoData searchQuery={filterName} colSpan={8} />}
                  </TableBody>
                </>
              )}

              {currentTab === 'logs' && (
                <>
                  <EmployeeEvaluationTableHead
                    headLabel={[
                      { id: 'sno', label: 'Sno', align: 'center' },
                      { id: 'employee', label: 'Employee' },
                      { id: 'prev', label: 'Prev Score' },
                      { id: 'change', label: 'Change' },
                      { id: 'new', label: 'New Score' },
                      { id: 'reason', label: 'Reason' },
                      { id: 'date', label: 'Date' },
                    ]}
                  />
                  <TableBody>
                    {logs.map((row, index) => (
                      <EmployeeEvaluationScoreLogTableRow
                        key={row.name}
                        row={row}
                        index={page * rowsPerPage + index}
                      />
                    ))}

                    {emptyLogs && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <EmptyContent
                            title="No Score Logs found"
                            description="Personal score changes will be logged here."
                            icon="solar:history-bold-duotone"
                          />
                        </TableCell>
                      </TableRow>
                    )}

                    {!emptyLogs && !notFoundLogs && (
                      <TableEmptyRows
                        height={77}
                        emptyRows={rowsPerPage - logs.length}
                      />
                    )}

                    {notFoundLogs && <TableNoData searchQuery={filterName} colSpan={7} />}
                  </TableBody>
                </>
              )}

              {currentTab === 'traits' && (
                <>
                  <EmployeeEvaluationTableHead
                    headLabel={[
                      { id: 'sno', label: 'Sno', align: 'center' },
                      { id: 'name', label: 'Trait Name' },
                      { id: 'category', label: 'Category' },
                      { id: 'description', label: 'Description' },
                      { id: '' },
                    ]}
                  />
                  <TableBody>
                    {traits.map((row, index) => (
                      <EmployeeEvaluationTraitTableRow
                        key={row.name}
                        row={row}
                        index={page * rowsPerPage + index}
                        onEdit={() => {
                          setSelectedTrait(row);
                          setOpenTraitForm(true);
                        }}
                        onDelete={() => {
                          setConfirmDelete({
                            open: true,
                            type: 'trait',
                            name: row.name,
                          });
                        }}
                      />
                    ))}

                    {emptyTraits && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyContent
                            title="No Traits found"
                            description="Define evaluation traits to start evaluations."
                            icon="solar:user-speak-bold-duotone"
                          />
                        </TableCell>
                      </TableRow>
                    )}

                    {!emptyTraits && !notFoundTraits && (
                      <TableEmptyRows
                        height={77}
                        emptyRows={rowsPerPage - traits.length}
                      />
                    )}

                    {notFoundTraits && <TableNoData searchQuery={filterName} colSpan={6} />}
                  </TableBody>
                </>
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={
            (currentTab === 'events' && totalEvents) ||
            (currentTab === 'logs' && totalLogs) ||
            (currentTab === 'traits' && totalTraits) ||
            0
          }
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <EmployeeEvaluationEventDetailsDialog
        open={openDetails}
        onClose={() => {
          setOpenDetails(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />

      <EmployeeEvaluationEventFormDialog
        open={openEventForm}
        onClose={() => {
          setOpenEventForm(false);
          setSelectedEvent(null);
        }}
        onSuccess={() => {
          refetchEvents();
          refetchLogs();
        }}
        traits={traits}
        selectedEvent={selectedEvent}
      />

      <EmployeeEvaluationTraitFormDialog
        open={openTraitForm}
        onClose={() => {
          setOpenTraitForm(false);
          setSelectedTrait(null);
        }}
        onSuccess={() => refetchTraits()}
        selectedTrait={selectedTrait}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete((prev) => ({ ...prev, open: false }))}
        title={confirmDelete.isSubmitted ? "Cannot Delete" : "Delete Confirmation"}
        content={
          confirmDelete.isSubmitted
            ? "This event is already submitted. You need to cancel it first before you can delete it."
            : `Are you sure you want to delete this ${confirmDelete.type === 'event' ? 'employee evaluation' : 'evaluation trait'}?`
        }
        icon={confirmDelete.isSubmitted ? "solar:info-circle-bold" : "solar:danger-bold"}
        iconColor={confirmDelete.isSubmitted ? "info.main" : "error.main"}
        action={
          confirmDelete.isSubmitted ? (
            <Button variant="contained" onClick={() => setConfirmDelete((prev) => ({ ...prev, open: false }))}>
              OK
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                try {
                  if (confirmDelete.type === 'event' && confirmDelete.name) {
                    await deleteEmployeeEvaluationEvent(confirmDelete.name);
                    refetchEvents();
                    refetchLogs();
                  } else if (confirmDelete.type === 'trait' && confirmDelete.name) {
                    await deleteEmployeeEvaluationTrait(confirmDelete.name);
                    refetchTraits();
                  }
                  setConfirmDelete((prev) => ({ ...prev, open: false }));
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              Delete
            </Button>
          )
        }
      />

      <Dialog open={openResetDialog} onClose={() => !resetLoading && setOpenResetDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reset All Employee Scores</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            This action will reset all active employee scores to 100. This cannot be undone.
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Admin Password"
            value={resetPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setResetPassword(e.target.value);
              setResetError('');
            }}
            error={!!resetError}
            helperText={resetError || "Enter Administrator password to confirm reset"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenResetDialog(false)} disabled={resetLoading}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            loading={resetLoading}
            onClick={async () => {
              if (!resetPassword) {
                setResetError('Password is required');
                return;
              }
              setResetLoading(true);
              setResetError('');
              try {
                const results = await resetAllEmployeeScores(resetPassword);
                setOpenResetDialog(false);
                setResetPassword('');
                setResetResults(results);
                setOpenSummaryDialog(true);
                refetchEvents();
                refetchLogs();
              } catch (error: any) {
                setResetError(error.message || 'Failed to reset scores');
              } finally {
                setResetLoading(false);
              }
            }}
          >
            Reset All
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openSummaryDialog} onClose={() => setOpenSummaryDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Reset Summary
          <IconButton onClick={() => setOpenSummaryDialog(false)} size="small">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, pb: 4 }}>
          <Typography variant="body2" sx={{ px: 3, pt: 1, pb: 3, color: 'text.secondary' }}>
            Successfully reset scores for <b>{resetResults.length}</b> employees to 100.
          </Typography>
          <Scrollbar sx={{ maxHeight: 400 }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3, py: 2 }}>Employee</TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>Old Score</TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>New Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resetResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ pl: 3, py: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="subtitle2" noWrap>
                          {result.employee_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {result.employee}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                        {result.previous_score}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {result.new_score}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </DialogContent>
      </Dialog>
    </DashboardContent>
  );
}
