import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useUsers } from 'src/hooks/useUsers';

import { DashboardContent } from 'src/layouts/dashboard';
import { createUser, updateUser, deleteUser } from 'src/api/users';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserDetailsDialog } from '../user-details-dialog';
import { LeadTableToolbar } from '../../lead/lead-table-toolbar';

// ----------------------------------------------------------------------

export function UserView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterName, setFilterName] = useState('');
  const [sortBy, setSortBy] = useState('creation_desc');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data, total, loading, refetch } = useUsers(
    page + 1,
    rowsPerPage,
    filterName,
    {},
    sortBy,
    filterStatus
  );

  const [openCreate, setOpenCreate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    enabled: 1 as 0 | 1,
    send_welcome_email: 1
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [openDetails, setOpenDetails] = useState(false);
  const [detailsUserId, setDetailsUserId] = useState<string | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      full_name: '',
      enabled: 1,
      send_welcome_email: 1
    });
    setOpenCreate(true);
  };

  const handleEditRow = (row: any) => {
    setSelectedUser(row);
    setFormData({
      email: row.email,
      full_name: row.full_name,
      enabled: row.enabled,
      send_welcome_email: 0
    });
    setOpenCreate(true);
  };

  const handleCloseCreate = () => setOpenCreate(false);

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.name, {
          full_name: formData.full_name,
          enabled: formData.enabled
        });
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        await createUser({
          ...formData,
          user_type: 'System User'
        });
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      refetch();
      handleCloseCreate();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Operation failed', severity: 'error' });
    }
  };

  const handleDeleteRow = (name: string) => {
    setUserToDelete(name);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete);
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      refetch();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Delete failed', severity: 'error' });
    } finally {
      setOpenDelete(false);
      setUserToDelete(null);
    }
  };

  const handleOpenDetails = (userId: string) => {
    setDetailsUserId(userId);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setDetailsUserId(null);
  };

  const notFound = !loading && !data.length && !!filterName;

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Users
        </Typography>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
          sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}
        >
          New User
        </Button>
      </Box>

      <Card>
        <LeadTableToolbar
          numSelected={0}
          filterName={filterName}
          onFilterName={(e) => {
            setFilterName(e.target.value);
            setPage(0);
          }}
          onOpenFilter={() => { }}
          canReset={!!filterName || filterStatus !== 'all'}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchPlaceholder="Search users..."
          sortOptions={[
            { value: 'creation_desc', label: 'Newest First' },
            { value: 'creation_asc', label: 'Oldest First' },
            { value: 'full_name_asc', label: 'Name: A to Z' },
            { value: 'full_name_desc', label: 'Name: Z to A' },
            { value: 'email_asc', label: 'Email: A to Z' },
            { value: 'email_desc', label: 'Email: Z to A' },
          ]}
          filterStatus={filterStatus}
          onFilterStatus={(e) => {
            setFilterStatus(e.target.value);
            setPage(0);
          }}
          options={[
            { value: '1', label: 'Enabled' },
            { value: '0', label: 'Disabled' },
          ]}
          filterLabel="Status"
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                rowCount={total}
                numSelected={0}
                onSelectAllRows={() => { }}
                hideCheckbox
                headLabel={[
                  { id: 'full_name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  { id: 'enabled', label: 'Status' },
                  { id: 'user_type', label: 'Type' },
                  { id: 'creation', label: 'Created' },
                  { id: '' },
                ]}
              />

              <TableBody>
                {data.map((row) => (
                  <UserTableRow
                    key={row.name}
                    row={row}
                    selected={false}
                    onSelectRow={() => { }}
                    onEdit={() => handleEditRow(row)}
                    onDelete={() => handleDeleteRow(row.name)}
                    onView={() => handleOpenDetails(row.name)}
                  />
                ))}

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

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

      <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'New User'}
          <IconButton onClick={handleCloseCreate} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!selectedUser}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled === 1}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked ? 1 : 0 })}
                />
              }
              label="Enabled"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete User"
        content="Are you sure you want to delete this user?"
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
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <UserDetailsDialog
        open={openDetails}
        onClose={handleCloseDetails}
        userId={detailsUserId}
        onEdit={() => {
          if (detailsUserId) {
            const user = data.find((u) => u.name === detailsUserId);
            if (user) {
              handleEditRow(user);
              handleCloseDetails();
            }
          }
        }}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function useTable() {
  // simplified for now
}
