


import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    row: any;
    selected: boolean;
    onSelectRow: VoidFunction;
    onEditRow: VoidFunction;
    onDeleteRow: VoidFunction;
    onImport: VoidFunction;
    importing: boolean;
};

export function UploadAttendanceTableRow({
    row,
    selected,
    onSelectRow,
    onEditRow,
    onDeleteRow,
    onImport,
    importing
}: Props) {
    const handleImport = async () => {
        await onImport();
    };

    const isImported = Boolean(row.imported);
    const hasFile = Boolean(row.attendance_file);

    return (
        <TableRow hover selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox checked={selected} onClick={onSelectRow} />
            </TableCell>

            <TableCell>
                <Typography variant="body2" noWrap>
                    {row.name}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {row.upload_date ? fDate(row.upload_date) : '-'}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {row.att_fr_date ? fDate(row.att_fr_date) : '-'}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {row.att_to_date ? fDate(row.att_to_date) : '-'}
                </Typography>
            </TableCell>

            <TableCell>
                {hasFile ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon={"solar:file-bold-duotone" as any} width={20} />
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{
                                maxWidth: 200,
                                cursor: 'pointer',
                                '&:hover': {
                                    textDecoration: 'underline',
                                    color: 'primary.main',
                                },
                            }}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = row.attendance_file;
                                link.download = row.attendance_file.split('/').pop() || 'download';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        >
                            {row.attendance_file?.split('/').pop() || 'Uploaded'}
                        </Typography>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No file
                    </Typography>
                )}
            </TableCell>

            <TableCell>
                {hasFile && (
                    <Button
                        size="small"
                        variant={isImported ? 'outlined' : 'contained'}
                        color={isImported ? 'success' : 'primary'}
                        disabled={isImported || importing}
                        onClick={handleImport}
                        startIcon={
                            isImported ? (
                                <Iconify icon={"solar:check-circle-bold" as any} />
                            ) : (
                                <Iconify icon={"solar:import-bold" as any} />
                            )
                        }
                    >
                        {isImported ? 'Imported' : 'Import'}
                    </Button>
                )}
            </TableCell>

            <TableCell align="right">
                <Tooltip title={isImported ? "Editing is disabled for imported records" : "Edit"}>
                    <span>
                        <IconButton onClick={onEditRow} disabled={isImported}>
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Delete">
                    <IconButton onClick={onDeleteRow} sx={{ color: 'error.main' }}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}
