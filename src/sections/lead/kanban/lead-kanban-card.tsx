import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';

type Props = {
  lead: any;
  onClick?: VoidFunction;
};

export default function LeadKanbanCard({
  lead,
  onClick,
}: Props) {
  return (
    <Card
      onClick={onClick}
      sx={{
        minHeight: 170,
        p: 2,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',

        borderRadius: 2.5,

        border: '1px solid',
        borderColor: 'divider',

        boxShadow: (theme) =>
          `0px 4px 12px ${alpha(theme.palette.grey[500], 0.12)}`,

        transition: 'all .25s ease',

        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: (theme) => theme.customShadows.z20,
        },
      }}
    >
      <Box>
        <Label
          variant="soft"
          color={lead.leads_type === 'Incoming' ? 'info' : 'warning'}
          sx={{
            mb: 1.5,
            fontSize: 10,
            fontWeight: 700,
            py: -5
          }}
        >
          {lead.leads_type || 'Incoming'}
        </Label>

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          {lead.lead_name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {lead.company_name || 'No Company'}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 2,
        }}
      >
        <Avatar
          sx={{
            width: 25,
            height: 25,
            fontSize: 10,
            fontWeight: 700,
            bgcolor: (theme) =>
              alpha(theme.palette.success.main, 0.15),
            color: 'success.dark',
          }}
        >
          {lead.owner?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
          }}
        >
          {lead.owner || 'Unassigned'}
        </Typography>
      </Box>
    </Card>
  );
}