import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import LeadKanbanCard from './lead-kanban-card';

type Props = {
  column: {
    id: string;
    name: string;
    color: string;
    leadIds: string[];
  };
  leads: any[];
  onOpenLead: (leadId: string) => void;
};

export default function LeadKanbanColumn({
  column,
  leads,
  onOpenLead,
}: Props) {
  const columnLeads = column.leadIds
    .map((id) => leads.find((l) => l.name === id))
    .filter(Boolean);

  return (
    <Box
      sx={{
        width: 300,
        minWidth: 300,
        height: 'calc(101vh - 240px)',
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
          py: 0.8,
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
              width: 30,
              height: 30,
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
            {columnLeads.length}
          </Box>

          <Typography
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {column.name}
          </Typography>
        </Box>

        <IconButton
          size="small"
          sx={{
            color: '#fff',
          }}
        >
          <Iconify icon="mingcute:add-line" width={20} />
        </IconButton>
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
        {columnLeads.map((lead) => (
          <LeadKanbanCard
            key={lead.name}
            lead={lead}
            onClick={() => onOpenLead(lead.name)}
          />
        ))}
      </Stack>
    </Box>
  );
}