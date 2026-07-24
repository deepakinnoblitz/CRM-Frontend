import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { getRolePermissionList, deleteRolePermission, type PermissionManagement } from 'src/api/permission-management';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { useAuth } from 'src/auth/auth-context';

import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';

type RolePermissionTableToolbarProps = {
    filterName: string;
    onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
};

function RolePermissionTableToolbar({
    filterName,
    onFilterName,
    sortBy,
    onSortChange,
}: RolePermissionTableToolbarProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const sortOptions = [
        { value: 'modified_desc', label: 'Newest First' },
        { value: 'modified_asc', label: 'Oldest First' },
    ];

    const currentLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort';

    return (
        <Box sx={{
            height: 96,
            display: 'flex',
            alignItems: 'center',
            p: (theme) => theme.spacing(0, 1, 0, 3),
            justifyContent: 'space-between',
        }}>
            <OutlinedInput
                value={filterName}
                onChange={onFilterName}
                placeholder="Search role permissions..."
                startAdornment={
                    <InputAdornment position="start">
                        <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                }
                sx={{ maxWidth: 480, flexGrow: 1 }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                    variant="text"
                    color="inherit"
                    startIcon={<Iconify icon="solar:sort-bold" />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                        minWidth: 120,
                        height: 40,
                        px: 2,
                        color: 'text.primary',
                        bgcolor: 'background.neutral',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                    }}
                >
                    {currentLabel}
                </Button>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    {sortOptions.map((option) => (
                        <MenuItem
                            key={option.value}
                            selected={option.value === sortBy}
                            onClick={() => {
                                onSortChange(option.value);
                                setAnchorEl(null);
                            }}
                            sx={{
                                typography: 'body2',
                                ...(option.value === sortBy && {
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                    fontWeight: 'fontWeightSemiBold',
                                }),
                            }}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        </Box>
    );
}

const TABLE_HEAD = [
    { id: 'sno', label: 'Sno', align: 'center' },
    { id: 'frontend_role_name', label: 'Role Name' },
    { id: 'backend_master_role', label: 'Backend Master Role' },
    { id: 'status', label: 'Status' },
    { id: '', label: 'Actions', align: 'right' },
];

interface RolePermissionListViewProps {
    onEdit?: (name: string) => void;
    onView?: (name: string) => void;
}

export function RolePermissionListView({ onEdit, onView }: RolePermissionListViewProps) {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [data, setData] = useState<PermissionManagement[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [sortBy, setSortBy] = useState('modified_desc');

    const [openDelete, setOpenDelete] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<string | null>(null);

    const { user } = useAuth();
    const hasCustomPerms = user?.permissions?.custom_permissions_assigned && user?.permissions?.actions?.users_list;
    const displayEdit = hasCustomPerms ? !!user?.permissions?.actions?.users_list?.edit : true;
    const displayDelete = hasCustomPerms ? !!user?.permissions?.actions?.users_list?.delete : true;

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getRolePermissionList(
                page + 1,
                rowsPerPage,
                filterName,
                'all'
            );
            setData(result.data);
            setTotal(result.total);
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Failed to load role permissions', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, filterName, enqueueSnackbar]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDeleteRow = (name: string) => {
        setPermissionToDelete(name);
        setOpenDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (!permissionToDelete) return;
        try {
            await deleteRolePermission(permissionToDelete);
            enqueueSnackbar('Role permission deleted successfully', { variant: 'success' });
            loadData();
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Delete failed', { variant: 'error' });
        } finally {
            setOpenDelete(false);
            setPermissionToDelete(null);
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(event.target.value);
        setPage(0);
    };

    const notFound = !data.length && !!filterName;
    const empty = !loading && !data.length;

    return (
        <>
            <Card>
                <RolePermissionTableToolbar
                    filterName={filterName}
                    onFilterName={handleSearch}
                    sortBy={sortBy}
                    onSortChange={(value) => {
                        setSortBy(value);
                        setPage(0);
                    }}
                />

                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                    <Scrollbar>
                        <Table sx={{ minWidth: 800 }}>
                            <TableRow sx={{ bgcolor: 'background.neutral' }}>
                                {TABLE_HEAD.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        align={headCell.align as any || 'left'}
                                        sx={{ fontWeight: 'fontWeightBold', color: 'text.secondary' }}
                                    >
                                        {headCell.label}
                                    </TableCell>
                                ))}
                            </TableRow>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {data.map((row, idx) => {
                                            const sno = page * rowsPerPage + idx + 1;
                                            return (
                                                <TableRow
                                                    key={row.name}
                                                    hover
                                                    sx={{
                                                        '& td, & th': { borderBottom: (t) => `1px solid ${t.palette.divider}` },
                                                        '&:last-child td, &:last-child th': { borderBottom: 0 },
                                                    }}
                                                >
                                                    <TableCell align="center">{sno}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            {row.frontend_role_name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{row.backend_master_role}</TableCell>
                                                    <TableCell>
                                                        <Label
                                                            variant="soft"
                                                            color={row.status === 'Enabled' ? 'success' : 'error'}
                                                        >
                                                            {row.status}
                                                        </Label>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton onClick={() => onView?.(row.name) || router.push(`/role-permissions/${row.name}/view`)} sx={{ color: 'info.main' }}>
                                                            <Iconify icon="solar:eye-bold" />
                                                        </IconButton>
                                                        {displayEdit &&(
                                                            <IconButton onClick={() => onEdit?.(row.name) || router.push(`/role-permissions/${row.name}/edit`)} sx={{ color: 'primary.main' }}>
                                                                <Iconify icon="solar:pen-bold" />
                                                            </IconButton>
                                                        )}
                                                        {displayDelete &&(
                                                        <IconButton onClick={() => handleDeleteRow(row.name)} sx={{ color: 'error.main' }}>
                                                            <Iconify icon="solar:trash-bin-trash-bold" />
                                                        </IconButton>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                        {notFound && <TableNoData searchQuery={filterName} />}

                                        {!data.length && !loading && !notFound && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                                    <EmptyContent
                                                        title="No Role Permissions found"
                                                        description="Start creating custom role rules to manage frontend access levels."
                                                        icon="solar:shield-keyhole-bold-duotone"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {!empty && !notFound && (
                                            <TableEmptyRows
                                                height={60}
                                                emptyRows={data.length < 5 ? 5 - data.length : 0}
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
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Card>

            <ConfirmDialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                title="Delete"
                content="Are you sure you want to delete this role permission configuration?"
                action={
                    <Button variant="contained" color="error" onClick={handleConfirmDelete} sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        Delete
                    </Button>
                }
            />
        </>
    );
}
