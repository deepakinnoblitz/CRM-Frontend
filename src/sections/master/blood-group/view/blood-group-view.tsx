import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useBloodGroups } from 'src/hooks/use-masters';

import { deleteBloodGroup } from 'src/api/masters';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { MasterEmptyState } from 'src/sections/master/master-empty-state';

import { useAuth } from 'src/auth/auth-context';

import { BloodGroupDialog } from '../blood-group-dialog';
import { TableNoData } from '../../../lead/table-no-data';
import { BloodGroupTableRow } from '../blood-group-table-row';
import { LeadTableHead } from '../../../lead/lead-table-head';
import { TableEmptyRows } from '../../../lead/table-empty-rows';
import { LeadTableToolbar } from '../../../lead/lead-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'blood_group', label: 'Blood Group' },
  { id: 'actions', label: 'Actions', align: 'right' },
];

const SORT_OPTIONS = [
  { value: 'modified_desc', label: 'Newest First' },
  { value: 'modified_asc', label: 'Oldest First' },
];

// ----------------------------------------------------------------------

export function BloodGroupView() {
  const { user } = useAuth();
  const actionPerms = user?.permissions?.actions?.blood_group;
  const hasCustomPerms = !!user?.permissions?.custom_permissions_assigned && !!actionPerms;
  const canCreate = hasCustomPerms ? !!actionPerms?.create : true;
  const canEdit = hasCustomPerms ? !!actionPerms?.edit : true;
  const canDelete = hasCustomPerms ? !!actionPerms?.delete : true;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('modified');

  const [openForm, setOpenForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, total, loading, refetch } = useBloodGroups(
    page + 1,
    rowsPerPage,
    filterName,
    orderBy,
    order
  );

  const notFound = !data.length && !!filterName;
  const empty = !loading && !data.length && !filterName;

  const handleSortChange = (value: string) => {
    const [id, ord] = value.split('_');
    setOrderBy(id);
    setOrder(ord as 'asc' | 'desc');
  };

  const handleOpenCreate = () => {
    setSelectedId(null);
    setOpenForm(true);
  };

  const handleEditRow = (id: string) => {
    setSelectedId(id);
    setOpenForm(true);
  };

  const handleDeleteRow = (id: string) => {
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete.id) {
      try {
        await deleteBloodGroup(confirmDelete.id);
        setSnackbar({ open: true, message: 'Blood group deleted successfully', severity: 'success' });
        refetch();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.message || 'Failed to delete blood group', severity: 'error' });
      } finally {
        setConfirmDelete({ open: false, id: null });
      }
    }
  };

  return (
    <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">Blood Group List</Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenCreate}
            sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}
          >
            New Blood Group
          </Button>
        )}
      </Stack>

      <Card>
        <LeadTableToolbar
          numSelected={0}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            setPage(0);
          }}
          searchPlaceholder="Search blood groups..."
          sortOptions={SORT_OPTIONS}
          sortBy={`${orderBy}_${order}`}
          onSortChange={handleSortChange}
        />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 600, borderCollapse: 'collapse' }}>
              <LeadTableHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={total}
                numSelected={0}
                onSelectAllRows={() => {}}
                onSort={(id) => {
                  const isAsc = orderBy === id && order === 'asc';
                  setOrder(isAsc ? 'desc' : 'asc');
                  setOrderBy(id);
                }}
                showIndex
                hideCheckbox
              />
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length + 1} align="center" sx={{ py: 10 }}>
                      <CircularProgress sx={{ color: '#08a3cd' }} />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {data.map((row, index) => (
                      <BloodGroupTableRow
                        key={row.name}
                        row={row}
                        index={page * rowsPerPage + index}
                        selected={false}
                        onSelectRow={() => {}}
                        onEditRow={() => handleEditRow(row.name)}
                        onDeleteRow={() => handleDeleteRow(row.name)}
                        canEdit={canEdit}
                        canDelete={canDelete}
                      />
                    ))}

                    {!empty && !notFound && (
                      <TableEmptyRows height={68} emptyRows={data.length < 5 ? 5 - data.length : 0} />
                    )}

                    {notFound && <TableNoData searchQuery={filterName} />}

                    {empty && (
                      <MasterEmptyState
                        masterName="Blood Group"
                        colSpan={TABLE_HEAD.length + 1}
                      />
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

            <TablePagination
              component="div"
              page={page}
              count={total}
              rowsPerPage={rowsPerPage}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
      </Card>

      <BloodGroupDialog
        open={openForm}
        id={selectedId}
        onClose={() => {
          setOpenForm(false);
          setSelectedId(null);
        }}
        onSuccess={() => {
          refetch();
          setSnackbar({
            open: true,
            message: selectedId ? 'Blood Group updated successfully' : 'Blood Group created successfully',
            severity: 'success',
          });
        }}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Blood Group"
        content="Are you sure you want to delete this blood group? This action cannot be undone."
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: '100%' }}>{snackbar.message}</Box>
      </Snackbar>
    </DashboardContent>
  );
}
