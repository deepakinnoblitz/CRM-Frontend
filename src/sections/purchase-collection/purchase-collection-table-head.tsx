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
    hideCheckbox?: boolean;
    showIndex?: boolean;
};

export default function PurchaseCollectionTableHead({
    order,
    orderBy,
    rowCount,
    headLabel,
    numSelected,
    onSort,
    onSelectAllRows,
    hideCheckbox = false,
    showIndex = false,
}: Props) {
    return (
        <TableHead>
            <TableRow>
                {!hideCheckbox && (
                    <TableCell padding="checkbox">
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={(event) => onSelectAllRows(event.target.checked)}
                        />
                    </TableCell>
                )}

                {showIndex && <TableCell align="center">Sno</TableCell>}

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
