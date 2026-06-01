import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

type ProposalTableHeadProps = {
    rowCount: number;
    numSelected: number;
    headLabel: Record<string, any>[];
    onSelectAllRows: (checked: boolean) => void;
    hideCheckbox?: boolean;
    showIndex?: boolean;
};

export function ProposalTableHead({
    rowCount,
    headLabel,
    numSelected,
    onSelectAllRows,
    hideCheckbox = false,
    showIndex = false,
}: ProposalTableHeadProps) {
    return (
        <TableHead>
            <TableRow>
                {!hideCheckbox && (
                    <TableCell padding="checkbox">
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                onSelectAllRows(event.target.checked)
                            }
                        />
                    </TableCell>
                )}

                {showIndex && <TableCell align="center">S.No</TableCell>}

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
