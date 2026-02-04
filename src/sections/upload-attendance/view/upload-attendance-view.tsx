import { useSnackbar } from 'notistack';
import { useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useUploadAttendance } from 'src/hooks/useUploadAttendance';

import { DashboardContent } from 'src/layouts/dashboard';
import {
    importAttendance,
    deleteUploadAttendance,
    createUploadAttendance,
    updateUploadAttendance,
} from 'src/api/upload-attendance';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableEmptyRows, TableHeadCustom, TableSelectedAction } from 'src/components/table/index';

import { UploadAttendanceTableRow } from '../upload-attendance-table-row';
import { UploadAttendanceFormDialog } from '../upload-attendance-form-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'name', label: 'ID' },
    { id: 'upload_date', label: 'Upload Date' },
    { id: 'att_fr_date', label: 'From Date' },
    { id: 'att_to_date', label: 'To Date' },
    { id: 'file', label: 'File' },
    { id: 'import', label: 'Import' },
    { id: 'actions', label: 'Actions', align: 'right' },
];

// ----------------------------------------------------------------------

export function UploadAttendanceView() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [currentRecord, setCurrentRecord] = useState<any>(null);
    const [importing, setImporting] = useState<string | null>(null);

    const { enqueueSnackbar } = useSnackbar();
    const formDialog = useBoolean();

    const { data, total, loading, refetch } = useUploadAttendance(
        page + 1,
        rowsPerPage,
        search
    );

    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleSelectRow = useCallback((id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    }, []);

    const handleSelectAllRows = useCallback((checked: boolean) => {
        if (checked) {
            setSelected(data.map((row) => row.name));
        } else {
            setSelected([]);
        }
    }, [data]);

    const handleNewRecord = useCallback(() => {
        setCurrentRecord(null);
        formDialog.onTrue();
    }, [formDialog]);

    const handleEditRow = useCallback((row: any) => {
        setCurrentRecord(row);
        formDialog.onTrue();
    }, [formDialog]);

    const handleDeleteRow = useCallback(async (id: string) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await deleteUploadAttendance(id);
                enqueueSnackbar('Record deleted successfully');
                refetch();
            } catch (error: any) {
                enqueueSnackbar(error.message || 'Failed to delete record', { variant: 'error' });
            }
        }
    }, [refetch]);

    const handleImport = useCallback(async (id: string) => {
        setImporting(id);
        try {
            const result = await importAttendance(id);
            enqueueSnackbar('Import completed successfully', { variant: 'success' });
            refetch();
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Failed to import attendance', { variant: 'error' });
        } finally {
            setImporting(null);
        }
    }, [refetch]);

    const handleFormSubmit = useCallback(async (formData: any) => {
        try {
            if (currentRecord) {
                await updateUploadAttendance(currentRecord.name, formData);
            } else {
                await createUploadAttendance(formData);
            }
            refetch();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to save record');
        }
    }, [currentRecord, refetch]);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - total) : 0;
    const notFound = !loading && data.length === 0;

    return (
        <DashboardContent>
            <Box display="flex" alignItems="center" mb={5}>
                <Typography variant="h4" flexGrow={1}>
                    Import Attendance
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={handleNewRecord}
                >
                    Upload Attendance
                </Button>
            </Box>

            <Card>
                {selected.length > 0 && (
                    <TableSelectedAction
                        dense={false}
                        numSelected={selected.length}
                        rowCount={data.length}
                        onSelectAllRows={(checked: boolean) => handleSelectAllRows(checked)}
                        action={
                            <Button
                                color="error"
                                onClick={() => {
                                    // Handle bulk delete if needed
                                }}
                            >
                                Delete
                            </Button>
                        }
                    />
                )}

                <Scrollbar>
                    <TableContainer sx={{ minWidth: 800 }}>
                        <Table>
                            <TableHeadCustom
                                order="asc"
                                orderBy="upload_date"
                                headLabel={TABLE_HEAD}
                                rowCount={data.length}
                                numSelected={selected.length}
                                onSort={() => { }}
                                onSelectAllRows={(checked: boolean) => handleSelectAllRows(checked)}
                            />

                            <TableBody>
                                {data.map((row) => (
                                    <UploadAttendanceTableRow
                                        key={row.name}
                                        row={row}
                                        selected={selected.includes(row.name)}
                                        onSelectRow={() => handleSelectRow(row.name)}
                                        onEditRow={() => handleEditRow(row)}
                                        onDeleteRow={() => handleDeleteRow(row.name)}
                                        onImport={() => handleImport(row.name)}
                                        importing={importing === row.name}
                                    />
                                ))}

                                <TableEmptyRows
                                    height={52}
                                    emptyRows={emptyRows}
                                />

                                {notFound && <TableNoData />}
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

            <UploadAttendanceFormDialog
                open={formDialog.value}
                onClose={formDialog.onFalse}
                onSubmit={handleFormSubmit}
                currentData={currentRecord}
            />
        </DashboardContent>
    );
}
