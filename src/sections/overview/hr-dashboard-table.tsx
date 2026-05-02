import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = CardProps & {
    title?: string;
    subheader?: string;
    tableData: any[];
    headLabel: { id: string; label: string }[];
    emptyMessage?: string;
    totalCount?: number;
    viewAllPath?: string;
};

export function HRDashboardTable({ title, subheader, tableData, headLabel, emptyMessage, totalCount, viewAllPath, ...other }: Props) {
    return (
        <Card {...other}>
            <CardHeader 
                title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6">{title}</Typography>
                        {totalCount !== undefined && (
                            <Chip label={totalCount} size="small" color="error" />
                        )}
                    </Stack>
                } 
                subheader={subheader} 
                action={
                    viewAllPath && (
                        <Button
                            component={RouterLink}
                            href={viewAllPath}
                            size="small"
                            color="inherit"
                            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
                        >
                            View all
                        </Button>
                    )
                }
                sx={{ mb: 3 }} 
            />

            <TableContainer sx={{ overflow: 'unset' }}>
                <Scrollbar>
                    <Table sx={{ minWidth: 400 }}>
                        <TableHead>
                            <TableRow>
                                {headLabel.map((headCell) => (
                                    <TableCell key={headCell.id}>{headCell.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {tableData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={headLabel.length} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {emptyMessage || 'No data found'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tableData.map((row: any, index) => (
                                    <TableRow key={index}>
                                        {headLabel.map((headCell) => (
                                            <TableCell key={headCell.id} sx={{ whiteSpace: 'nowrap' }}>
                                                <Typography 
                                                    variant="body2" 
                                                    noWrap 
                                                    sx={{ 
                                                        maxWidth: headCell.id === 'subject' ? 250 : 150,
                                                        display: 'block'
                                                    }}
                                                >
                                                    {headCell.id === 'index' ? index + 1 : row[headCell.id]}
                                                </Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Scrollbar>
            </TableContainer>
        </Card>
    );
}
