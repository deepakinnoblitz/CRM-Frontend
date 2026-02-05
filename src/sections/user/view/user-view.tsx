import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';

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
import { createUser, updateUser, deleteUser, getUser } from 'src/api/users';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserFormDialog } from '../user-form-dialog';
import { UserDetailsDialog } from '../user-details-dialog';
import { LeadTableToolbar } from '../../lead/lead-table-toolbar';
import { UserTableFiltersDrawer } from '../user-table-filters-drawer';

// ----------------------------------------------------------------------

export const UserView = forwardRef(({ hideHeader = false, hideActionButton = false }: { hideHeader?: boolean; hideActionButton?: boolean }, ref) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterName, setFilterName] = useState('');
  const [sortBy, setSortBy] = useState('creation_desc');
  const [filters, setFilters] = useState({
    user_type: 'all',
    enabled: 'all',
    permission: 'all',
    roles: []
  });
  const [openFilters, setOpenFilters] = useState(false);

  const { data, total, loading, refetch } = useUsers(
    page + 1,
    rowsPerPage,
    filterName,
    sortBy,
    filters
  );

  const [openCreate, setOpenCreate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    full_name: '',
    username: '',
    enabled: 1 as 0 | 1,
    user_type: 'System User',
    role_profile_name: '',
    roles: [] as string[],
    block_modules: [] as string[],
    send_welcome_email: 1 as 0 | 1,
    new_password: ''
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
      first_name: '',
      middle_name: '',
      last_name: '',
      full_name: '',
      username: '',
      enabled: 1,
      user_type: 'System User',
      role_profile_name: '',
      roles: [],
      block_modules: ['Company', 'ClefinCode Chat'],
      send_welcome_email: 1,
      new_password: ''
    });
    setOpenCreate(true);
  };

  useImperativeHandle(ref, () => ({
    handleOpenCreate
  }));

  const handleEditRow = async (row: any) => {
    try {
      // Fetch full user data including roles and modules
      const fullUserData = await getUser(row.name);

      setSelectedUser(fullUserData);

      // Extract roles from child table (array of {role: "Role Name"})
      const userRoles = fullUserData.roles
        ? fullUserData.roles.map((r: any) => r.role)
        : [];

      // Extract blocked modules from child table (array of {module: "Module Name"})
      const blockedModules = fullUserData.block_modules
        ? fullUserData.block_modules.map((m: any) => m.module)
        : [];

      setFormData({
        email: fullUserData.email || '',
        first_name: fullUserData.first_name || '',
        middle_name: fullUserData.middle_name || '',
        last_name: fullUserData.last_name || '',
        full_name: fullUserData.full_name || '',
        username: fullUserData.username || '',
        enabled: fullUserData.enabled,
        user_type: fullUserData.user_type || 'System User',
        role_profile_name: fullUserData.role_profile_name || '',
        roles: userRoles,
        block_modules: blockedModules,
        send_welcome_email: 0,
        new_password: ''
      });

      setOpenCreate(true);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to load user data', severity: 'error' });
    }
  };

  const handleCloseCreate = () => setOpenCreate(false);

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.name, {
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          full_name: formData.full_name,
          username: formData.username,
          enabled: formData.enabled,
          user_type: formData.user_type,
          role_profile_name: formData.role_profile_name,
          roles: formData.roles,
          block_modules: formData.block_modules
        });

        // Trigger password change if provided during update
        if (formData.new_password) {
          const { changeUserPassword } = await import('src/api/users');
          await changeUserPassword(selectedUser.email, formData.new_password);
        }

        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        await createUser({
          email: formData.email,
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          full_name: formData.full_name,
          username: formData.username,
          enabled: formData.enabled,
          user_type: formData.user_type,
          role_profile_name: formData.role_profile_name,
          roles: formData.roles,
          block_modules: formData.block_modules,
          send_welcome_email: formData.send_welcome_email,
          new_password: formData.new_password
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

  const handleFilters = (update: any) => {
    setFilters((prev) => ({ ...prev, ...update }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      user_type: 'all',
      enabled: 'all',
      permission: 'all',
      roles: []
    });
    setPage(0);
  };

  const canReset =
    filters.user_type !== 'all' ||
    filters.enabled !== 'all' ||
    filters.permission !== 'all' ||
    filters.roles.length > 0;

  const notFound = !loading && !data.length && (!!filterName || canReset);

  const renderContent = (
    <>
      {!hideActionButton && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {!hideHeader ? 'Users' : ''}
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
      )
      }

      <Card>
        <LeadTableToolbar
          numSelected={0}
          filterName={filterName}
          onFilterName={(e) => {
            setFilterName(e.target.value);
            setPage(0);
          }}
          onOpenFilter={() => setOpenFilters(true)}
          canReset={!!filterName || canReset}
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
                  { id: 'sno', label: 'Sno', align: 'center' },
                  { id: 'full_name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  { id: 'enabled', label: 'Status' },
                  { id: 'user_type', label: 'Type' },
                  { id: 'permission', label: 'Permission' },
                  { id: 'creation', label: 'Created' },
                  { id: '' },
                ]}
              />

              <TableBody>
                {data.map((row, index) => (
                  <UserTableRow
                    key={row.name}
                    row={row}
                    selected={false}
                    index={page * rowsPerPage + index}
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

      <UserFormDialog
        open={openCreate}
        onClose={handleCloseCreate}
        selectedUser={selectedUser}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onChangePassword={async (userId: string, newPassword: string) => {
          const { changeUserPassword } = await import('src/api/users');
          try {
            await changeUserPassword(userId, newPassword);
            setSnackbar({
              open: true,
              message: 'Password changed successfully',
              severity: 'success'
            });
            handleCloseCreate(); // Close the dialog
          } catch (error: any) {
            setSnackbar({
              open: true,
              message: error.message || 'Failed to change password',
              severity: 'error'
            });
          }
        }}
      />

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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

      <UserTableFiltersDrawer
        open={openFilters}
        onOpen={() => setOpenFilters(true)}
        onClose={() => setOpenFilters(false)}
        filters={filters}
        onFilters={handleFilters}
        canReset={canReset}
        onResetFilters={handleResetFilters}
      />
    </>
  );

  if (hideHeader) {
    return renderContent;
  }

  return (
    <DashboardContent>
      {renderContent}
    </DashboardContent>
  );
});

// ----------------------------------------------------------------------

function useTable() {
  // simplified for now
}
