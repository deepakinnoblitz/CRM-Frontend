import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

type Props = {
    order: 'asc' | 'desc';
    orderBy: string;
    rowCount: number;
    headLabel: any[];
    numSelected: number;
    onSort: (id: string) => void;
    onSelectAllRows: (checked: boolean) => void;
};

export default function PurchaseCollectionTableHead({
    order,
    orderBy,
    rowCount,
    headLabel,
    numSelected,
    onSort,
    onSelectAllRows,
}: Props) {
    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={(event) => onSelectAllRows(event.target.checked)}
                    />
                </TableCell>

                {headLabel.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align || 'left'}
                        sx={{ width: headCell.width, minWidth: headCell.minWidth }}
                    >
                        {headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}
