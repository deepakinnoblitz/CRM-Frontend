import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import LeadKanbanColumn from './lead-kanban-column';

type Props = {
  leads: any[];
  workflowStates: string[];
  onOpenLead: (leadId: string) => void;
  onEditLead: (leadId: string) => void;
  onDeleteLead: (leadId: string) => void;
  onAddLead: (workflowState: string) => void;
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

export default function LeadKanbanBoard({
  leads,
  workflowStates,
  onOpenLead,
  onEditLead,
  onDeleteLead,
  onAddLead,
  permissions,
}: Props) {
  const columns = useMemo(() => {
    const states =
      workflowStates?.length > 0
        ? workflowStates
        : ['New Lead', 'Contacted', 'Qualified'];

    return states.map((state, index) => {
      const stateLeads = leads.filter((lead) => {
        if (state === states[0] && !lead.workflow_state) {
          return true;
        }

        return lead.workflow_state === state;
      });

      return {
        id: state,
        name: state,
        color: COLUMN_COLORS[index % COLUMN_COLORS.length],
        leadIds: stateLeads.map((lead) => lead.name),
      };
    });
  }, [leads, workflowStates]);

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(97vh - 170px)', // Adjust based on your page header
        mb: -10,
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
            <LeadKanbanColumn
              key={column.id}
              column={column}
              leads={leads}
              onOpenLead={onOpenLead}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onAddLead={onAddLead}
              permissions={permissions}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}