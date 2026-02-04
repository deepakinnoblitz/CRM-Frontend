import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableSelectedActionProps = {
    dense?: boolean;
    action?: React.ReactNode;
    rowCount: number;
    numSelected: number;
    onSelectAllRows: (checked: boolean) => void;
};

export function TableSelectedAction({
    dense,
    action,
    rowCount,
    numSelected,
    onSelectAllRows,
}: TableSelectedActionProps) {
    const theme = useTheme();

    if (!numSelected) {
        return null;
    }

    return (
        <Box
            sx={{
                pl: 1,
                pr: 2,
                top: 0,
                left: 0,
                width: 1,
                zIndex: 9,
                display: 'flex',
                position: 'absolute',
                alignItems: 'center',
                height: dense ? 38 : 58,
                bgcolor: 'primary.lighter',
                ...(dense && {
                    pl: 3,
                }),
            }}
        >
            <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onSelectAllRows(event.target.checked)
                }
            />

            <Typography
                variant="subtitle1"
                sx={{
                    ml: 2,
                    flexGrow: 1,
                    color: 'primary.main',
                    ...(dense && {
                        ml: 3,
                    }),
                }}
            >
                {numSelected} selected
            </Typography>

            {action && action}
        </Box>
    );
}
