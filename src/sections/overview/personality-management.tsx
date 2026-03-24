import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import PersonalityGauge from '../personality/components/personality-gauge';

// ---------------- TYPES ----------------
interface PersonalityTraitData {
  trait: string;
  score: number;
}

interface Props {
  data?: PersonalityTraitData[];
}

// ---------------- COMPONENT ----------------
export default function PersonalityManagement({
  data = [
    { trait: 'Communication', score: 18 },
    { trait: 'Teamwork', score: 15 },
    { trait: 'Leadership', score: 14 },
    { trait: 'Creativity', score: 16 },
    { trait: 'Technical Skills', score: 22 },
  ],
}: Props) {
  const theme = useTheme();

  const total = data.reduce((sum, item) => sum + item.score, 0);

  return (
    <Card
      sx={{
        p: { xs: 2, md: 3 },
        boxShadow: theme.palette.mode === 'light' ? 2 : 4,
      }}
    >
      <Stack spacing={3}>
        {/* HEADER */}
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Personality Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Skill distribution and personality traits breakdown
          </Typography>
        </Box>

        {/* FLEX */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
          }}
        >
          {/* GAUGE */}
          <Box flex={1} textAlign="center">
            <PersonalityGauge value={total} />

            <Typography mt={2} variant="h5" fontWeight={800} color="primary.main">
              {total} Total Points
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Skill distribution and personality traits breakdown
            </Typography>
          </Box>

          {/* LIST */}
          <Box flex={1}>
            <Typography variant="h6" mb={2} fontWeight={700}>
              List of The Management
            </Typography>

            <Stack spacing={1.5}>
              {data.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Typography>{item.trait}</Typography>
                  <Typography fontWeight={600}>{item.score}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}