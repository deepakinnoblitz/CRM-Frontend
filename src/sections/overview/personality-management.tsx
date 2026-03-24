import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import PersonalityGauge from 'src/sections/personality/components/personality-gauge';

// ----------------------------------------------------------------------

interface PersonalityTraitData {
  trait: string;
  score: number;
}

interface PersonalityManagementProps {
  data?: PersonalityTraitData[];
}

export function PersonalityManagement({
  data = [
    { trait: 'Communication', score: 18 },
    { trait: 'Teamwork', score: 15 },
    { trait: 'Leadership', score: 14 },
    { trait: 'Creativity', score: 16 },
    { trait: 'Technical Skills', score: 22 },
  ],
}: PersonalityManagementProps) {
  const theme = useTheme();

  // Total calculation
  const total = data.reduce((sum, item) => sum + item.score, 0);

  return (
    <Card
      sx={{
        p: { xs: 2, md: 3 },
        boxShadow: theme.palette.mode === 'light' ? 2 : 4,
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Personality Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Skill distribution and personality traits breakdown
          </Typography>
        </Box>

        {/* FLEX SECTION */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          {/* Gauge Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <PersonalityGauge value={total} width={260} height={260} />

            <Typography
              variant="h5"
              sx={{
                mt: 2,
                fontWeight: 800,
                color: 'primary.main',
                textAlign: 'center',
              }}
            >
              {total} Total Points
            </Typography>

            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              Skill distribution and personality traits breakdown
            </Typography>
          </Box>

          {/* List Section */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              List of The Management
            </Typography>

            <Stack spacing={1.5}>
              {data.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Typography variant="body2">{item.trait}</Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {item.score}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}
