import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = {
    searchQuery: string;
    colSpan?: number;
};

export function TableNoData({ searchQuery, colSpan = 12 }: TableNoDataProps) {
    return (
        <TableRow>
            <TableCell align="center" colSpan={colSpan}>
                <Box sx={{ py: 10, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Not found
                    </Typography>

                    <Typography variant="body2">
                        No results found for &nbsp;
                        <strong>&quot;{searchQuery}&quot;</strong>.
                        <br /> Try checking for typos or using complete words.
                    </Typography>
                </Box>
            </TableCell>
        </TableRow>
    );
}
