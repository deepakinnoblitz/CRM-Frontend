import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { Scrollbar } from 'src/components/scrollbar';

import LeadKanbanColumn from './lead-kanban-column';

type Props = {
  leads: any[];
  workflowStates: string[];
  onOpenLead: (leadId: string) => void;
};

// Vibrant colors matching the design screenshot
const COLUMN_COLORS = [
  '#4F46E5', // Indigo (like In Progress)
  '#F59E0B', // Amber (like Reviewed)
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F43F5E', // Rose
  '#3B82F6', // Blue
];

export default function LeadKanbanBoard({ leads, workflowStates, onOpenLead }: Props) {
  const columns = useMemo(() => {
    // If no workflow states exist yet, fallback to a single default column to show leads
    const states = workflowStates.length > 0 ? workflowStates : ['New Lead', 'In Progress', 'Completed'];

    return states.map((state, index) => {
      // Find leads that belong to this state
      // If workflow_state is missing, maybe default to the first column
      const columnLeads = leads.filter((lead) => {
        if (state === states[0] && !lead.workflow_state) return true;
        return lead.workflow_state === state;
      });

      return {
        id: state,
        name: state,
        color: COLUMN_COLORS[index % COLUMN_COLORS.length],
        leadIds: columnLeads.map((l) => l.name),
      };
    });
  }, [leads, workflowStates]);

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        pb: 2,
        mb: -10,
        '&::-webkit-scrollbar': { height: 8 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'rgba(145, 158, 171, 0.3)',
          borderRadius: 4,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={3}
        sx={{
          p: 1,
        }}
      >
        {columns.map((column) => (
          <LeadKanbanColumn
            key={column.id}
            column={column}
            leads={leads}
            onOpenLead={onOpenLead}
          />
        ))}
      </Stack>
    </Box>
  );
}
