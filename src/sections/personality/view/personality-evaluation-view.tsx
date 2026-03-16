import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { usePersonalityTraits, usePersonalityEvents, usePersonalityScoreLogs } from 'src/hooks/usePersonality';

import { DashboardContent } from 'src/layouts/dashboard';
import { deletePersonalityTrait, deletePersonalityEvent, submitPersonalityEvent, cancelPersonalityEvent } from 'src/api/personality';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { TableNoData, TableEmptyRows } from 'src/components/table';

import { PersonalityTableHead } from '../personality-table-head';
import { PersonalityTableToolbar } from '../personality-table-toolbar';
import { PersonalityTraitTableRow } from '../personality-trait-table-row';
import { PersonalityEventTableRow } from '../personality-event-table-row';
import { PersonalityEventFormDialog } from '../personality-event-form-dialog';
import { PersonalityTraitFormDialog } from '../personality-trait-form-dialog';
import { PersonalityScoreLogTableRow } from '../personality-score-log-table-row';
import { PersonalityEventDetailsDialog } from '../personality-event-details-dialog';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'events', label: 'Personality Events', icon: <Iconify icon={"solar:clipboard-check-bold-duotone" as any} width={20} /> },
  { value: 'traits', label: 'Behavior Assessment', icon: <Iconify icon={"solar:user-speak-bold-duotone" as any} width={20} /> },
  { value: 'logs', label: 'Score Logs', icon: <Iconify icon={"solar:history-bold-duotone" as any} width={20} /> },
];

export function PersonalityEvaluationView() {
  const [currentTab, setCurrentTab] = useState('events');

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
  });

  const { data: events, total: totalEvents, loading: loadingEvents, refetch: refetchEvents } = usePersonalityEvents(page + 1, rowsPerPage, filterName, sortBy, filters);
  const { data: logs, total: totalLogs, loading: loadingLogs, refetch: refetchLogs } = usePersonalityScoreLogs(page + 1, rowsPerPage, filterName, sortBy, filters);
  const { data: traits, total: totalTraits, loading: loadingTraits, refetch: refetchTraits } = usePersonalityTraits(page + 1, rowsPerPage, filterName, sortBy, filters);

  const canReset = !!filterName || !!filters.employee || !!filters.trait || (filters.evaluation_type !== 'all') || (filters.docstatus !== null) || !!filters.category;

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
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} iconPosition="start" />
        ))}
      </Tabs>

      {currentTab !== 'logs' && (
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
      )}
    </Stack>
  );

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Personality Evaluation</Typography>
      </Stack>

      <Card>
        {renderTabs}

        <PersonalityTableToolbar
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
              employee: null,
              trait: null,
              evaluation_type: 'all',
              docstatus: null,
              category: '',
            });
          }}
          currentTab={currentTab}
          traitsOptions={traits}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
            <Table>
              {currentTab === 'events' && (
                <>
                  <PersonalityTableHead
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
                      <PersonalityEventTableRow
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
                            await submitPersonalityEvent({
                              doctype: 'Personality Event',
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
                            await cancelPersonalityEvent(row.name);
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
                            title="No Personality Event Assessment"
                            description="Wait for HR to add personality evaluations for employees."
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
                  <PersonalityTableHead
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
                      <PersonalityScoreLogTableRow
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
                  <PersonalityTableHead
                    headLabel={[
                      { id: 'sno', label: 'Sno', align: 'center' },
                      { id: 'name', label: 'Trait Name' },
                      { id: 'category', label: 'Category' },
                      { id: 'reward', label: 'Reward' },
                      { id: 'penalty', label: 'Penalty' },
                      { id: '' },
                    ]}
                  />
                  <TableBody>
                    {traits.map((row, index) => (
                      <PersonalityTraitTableRow
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
                            description="Define personality traits to start evaluations."
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

      <PersonalityEventDetailsDialog
        open={openDetails}
        onClose={() => {
          setOpenDetails(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />

      <PersonalityEventFormDialog
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

      <PersonalityTraitFormDialog
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
            : `Are you sure you want to delete this ${confirmDelete.type === 'event' ? 'personality event' : 'personality trait'}?`
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
                    await deletePersonalityEvent(confirmDelete.name);
                    refetchEvents();
                    refetchLogs();
                  } else if (confirmDelete.type === 'trait' && confirmDelete.name) {
                    await deletePersonalityTrait(confirmDelete.name);
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
    </DashboardContent>
  );
}
