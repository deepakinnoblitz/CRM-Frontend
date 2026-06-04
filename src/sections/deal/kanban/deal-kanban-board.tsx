import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import DealKanbanColumn from './deal-kanban-column';

type Props = {
  deals: any[];
  stages: { value: string; label: string }[];
  onOpenDeal: (dealId: string) => void;
  onEditDeal: (dealId: string) => void;
  onDeleteDeal: (dealId: string) => void;
  onAddDeal: (stage: string) => void;
  permissions?: {
    write: boolean;
    delete: boolean;
  };
};

const COLUMN_COLORS = [
  '#4F46E5', // Indigo
  '#F59E0B', // Orange
  '#10B981', // Green
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#3B82F6', // Blue
];

export default function DealKanbanBoard({
  deals,
  stages,
  onOpenDeal,
  onEditDeal,
  onDeleteDeal,
  onAddDeal,
  permissions,
}: Props) {
  const columns = useMemo(
    () =>
      stages.map((stageObj, index) => {
        const stageName = stageObj.value;

        const stageDeals = deals.filter((deal) => {
          if (stageName === stages[0].value && !deal.stage) {
            return true;
          }

          return deal.stage === stageName;
        });

        return {
          id: stageName,
          name: stageObj.label,
          color: COLUMN_COLORS[index % COLUMN_COLORS.length],
          dealIds: stageDeals.map((deal) => deal.name),
        };
      }),
    [deals, stages]
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(120vh - 200px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',

          '&::-webkit-scrollbar': {
            height: 8,
          },

          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(145,158,171,0.30)',
            borderRadius: 999,
          },

          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(145,158,171,0.50)',
          },
        }}
      >
        <Stack
          direction="row"
          spacing={3}
          alignItems="flex-start"
          sx={{
            width: 'max-content',
            minWidth: '100%',
            height: '100%',
            p: 1,
          }}
        >
          {columns.map((column) => (
            <DealKanbanColumn
              key={column.id}
              column={column}
              deals={deals}
              onOpenDeal={onOpenDeal}
              onEditDeal={onEditDeal}
              onDeleteDeal={onDeleteDeal}
              onAddDeal={onAddDeal}
              permissions={permissions}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
