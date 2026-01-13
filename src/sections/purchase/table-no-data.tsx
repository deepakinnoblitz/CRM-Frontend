
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = {
    query: string;
};

export function TableNoData({ query }: TableNoDataProps) {
    return (
        <TableRow>
            <TableCell align="center" colSpan={9} sx={{ py: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" paragraph>
                        Not found
                    </Typography>

                    <Typography variant="body2">
                        No results found for &nbsp;
                        <strong>&quot;{query}&quot;</strong>.
                        <br /> Try checking for typos or using complete words.
                    </Typography>
                </Box>
            </TableCell>
        </TableRow>
    );
}