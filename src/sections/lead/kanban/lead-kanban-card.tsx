import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

type Props = {
  lead: any;
  onClick?: VoidFunction;
};

export default function LeadKanbanCard({ lead, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        mb: 2,
        cursor: 'pointer',
        boxShadow: (theme) => `0px 4px 12px ${alpha(theme.palette.grey[500], 0.1)}`,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z16,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ mb: 1.5 }}>
        <Label 
          variant="soft" 
          color={lead.leads_type === 'Incoming' ? 'info' : 'warning'}
          sx={{ typography: 'caption', fontWeight: 600, px: 1, borderRadius: 1, fontSize: 11 }}
        >
          {lead.leads_type || 'Important'}
        </Label>
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
        {lead.lead_name}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
        {lead.company_name || 'No company specified'}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            alt={lead.owner || 'Unassigned'} 
            sx={{ 
              width: 28, 
              height: 28, 
              fontSize: 12, 
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.16),
              color: 'success.dark',
              border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.32)}`,
              fontWeight: 700
            }}
          >
            {lead.owner ? lead.owner.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {lead.owner || 'Unassigned'}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
