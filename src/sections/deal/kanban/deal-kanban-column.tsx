import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import DealKanbanCard from './deal-kanban-card';

type Props = {
  column: {
    id: string;
    name: string;
    color: string;
    dealIds: string[];
  };
  deals: any[];
  onOpenDeal: (dealId: string) => void;
  onEditDeal: (dealId: string) => void;
  onDeleteDeal: (dealId: string) => void;
  onAddDeal: (stage: string) => void;
  permissions?: {
    write: boolean;
    delete: boolean;
  };
};

export default function DealKanbanColumn({
  column,
  deals,
  onOpenDeal,
  onEditDeal,
  onDeleteDeal,
  onAddDeal,
  permissions,
}: Props) {
  const columnDeals = column.dealIds
    .map((id) => deals.find((d) => d.name === id))
    .filter(Boolean);

  return (
    <Box
      sx={{
        width: 300,
        minWidth: 300,
        height: 'calc(125vh - 270px)',
        flexShrink: 0,
        bgcolor: '#F8FAFC',
        borderRadius: 3,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'rgba(145,158,171,0.12)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: column.color,
          px: 2,
          py: 0.5,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 25,
              height: 25,
              borderRadius: '50%',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: column.color,
              fontSize: 13,
            }}
          >
            {columnDeals.length}
          </Box>

          <Typography
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {column.name}
          </Typography>
        </Box>

        {permissions?.write && (
          <IconButton
            size="small"
            onClick={() => onAddDeal(column.id)}
            sx={{
              color: '#fff',
            }}
          >
            <Iconify icon="mingcute:add-line" width={20} />
          </IconButton>
        )}
      </Box>

      {/* Scroll Area */}
      <Stack
        spacing={2}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          pr: 0.5,

          '&::-webkit-scrollbar': {
            width: 0.5,
          },

          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(145,158,171,0.3)',
            borderRadius: 999,
          },

          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(145,158,171,0.5)',
          },
        }}
      >
        {columnDeals.map((deal) => (
          <DealKanbanCard
            key={deal.name}
            deal={deal}
            onClick={() => onOpenDeal(deal.name)}
            onEdit={() => onEditDeal(deal.name)}
            onDelete={() => onDeleteDeal(deal.name)}
            permissions={permissions}
          />
        ))}
      </Stack>
    </Box>
  );
}
