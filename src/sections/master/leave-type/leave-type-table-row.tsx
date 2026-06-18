import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import { FaMoneyBill, FaSortNumericUp, FaArrowRight, FaSyncAlt, FaLock } from 'react-icons/fa';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  index?: number;
};

export function LeaveTypeTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  index,
}: Props) {
  const { leave_type_name, is_paid, max_leaves, status, carry_forward, reset_frequency, restrict_during_probation } = row;
  const [openView, setOpenView] = useState(false);

  return (
    <>
      <TableRow
      hover
      selected={selected}
      sx={{
        '& td, & th': {
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          py: 1.5,
        },
        '&:last-child td, &:last-child th': { borderBottom: 0 },
      }}
    >
      {typeof index === 'number' && (
        <TableCell align="center">
          <Box
            sx={{
                width: 28,
                height: 28,
                display: 'flex',
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
                typography: 'subtitle2',
                fontWeight: 800,
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                mx: 'auto',
                transition: (theme) => theme.transitions.create(['all'], { duration: theme.transitions.duration.shorter }),
                '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    transform: 'scale(1.1)',
                },
            }}
          >
            {index + 1}
          </Box>
        </TableCell>
      )}

      <TableCell>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
          {leave_type_name}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {is_paid ? 'Yes' : 'No'}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {max_leaves || '-'}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {carry_forward ? 'Yes' : 'No'}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {reset_frequency || '-'}
        </Typography>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={status === 'Active' ? 'success' : 'error'}
          sx={{ fontWeight: 700 }}
        >
          {status}
        </Label>
      </TableCell>

      <TableCell align="right">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setOpenView(true)} sx={{ color: '#08a3cd' }}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>

          <IconButton size="small" onClick={onEditRow} sx={{ color: 'primary.main' }}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>

          <IconButton size="small" onClick={onDeleteRow} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>

      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 2, boxShadow: (themeVar: any) => themeVar.customShadows.z24, } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Leave Type Details</Typography>
            <IconButton onClick={() => setOpenView(false)} sx={{ color: (theme) => theme.palette.grey[500] }}>
                <Iconify icon="mingcute:close-line" />
            </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, m: 2, mt: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'info.lighter',
                            color: 'info.main',
                        }}
                    >
                        <Iconify icon="solar:calendar-bold" width={40} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{leave_type_name}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Label
                            variant="soft"
                            color={status === 'Active' ? 'success' : 'error'}
                        >
                            {status || 'Unknown'}
                        </Label>
                    </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box>
                    <SectionHeader title="Leave Type Information" />
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 3,
                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        }}
                    >
                        <DetailItem label="Is Paid" value={is_paid ? 'Yes' : 'No'} icon={<FaMoneyBill size={18} />} />
                        <DetailItem label="Max Leaves" value={max_leaves ?? '-'} icon={<FaSortNumericUp size={18} />} />
                        <DetailItem label="Carry Forward" value={carry_forward ? 'Yes' : 'No'} icon={<FaArrowRight size={18} />} />
                        <DetailItem label="Reset Frequency" value={reset_frequency || '-'} icon={<FaSyncAlt size={18} />} />
                        <DetailItem label="Restrict During Probation" value={restrict_during_probation ? 'Yes' : 'No'} icon={<FaLock size={18} />} />
                    </Box>
                </Box>
            </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SectionHeader({ title, noMargin = false }: { title: string, noMargin?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: noMargin ? 0 : 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ label, value, icon }: { label: string; value?: React.ReactNode; icon: React.ReactNode }) {
    const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 50,
                    height: 50,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'info.main',
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5, fontSize: 11 }}>
                    {label}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
// forced update for TS server
