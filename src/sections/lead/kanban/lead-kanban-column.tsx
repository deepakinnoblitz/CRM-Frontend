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

export default function LeadKanbanColumn({ column, leads, onOpenLead }: Props) {
  const columnLeads = column.leadIds
    .map((id) => leads.find((l) => l.name === id))
    .filter((lead) => !!lead);

  return (
    <Box
      sx={{
        width: 320,
        flexShrink: 0,
        bgcolor: '#f8fafc',
        borderRadius: 2.5,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(108vh - 300px)',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid',
        borderColor: 'rgba(145, 158, 171, 0.12)',
      }}
    >
      {/* Column Header — Sticky */}
      <Box
        sx={{
          bgcolor: column.color,
          px: 2,
          py: 1,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Count Badge */}
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              typography: 'subtitle2',
              color: column.color,
              fontWeight: 700,
            }}
          >
            {columnLeads.length}
          </Box>
          {/* Title */}
          <Typography variant="subtitle1" sx={{ color: 'common.white', fontWeight: 600 }}>
            {column.name}
          </Typography>
        </Box>

        <IconButton size="small" sx={{ color: 'common.white' }}>
          <Iconify icon="mingcute:add-line" width={20} />
        </IconButton>
      </Box>

      {/* Column Cards Container — Individual Scroll */}
      <Stack
        spacing={2}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          minHeight: 0,
          pb: 1,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(145, 158, 171, 0.3)',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: 'rgba(145, 158, 171, 0.5)',
          },
        }}
      >
        {columnLeads.map((lead, index) => (
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
