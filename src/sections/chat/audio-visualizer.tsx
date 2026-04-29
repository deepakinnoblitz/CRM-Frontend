import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

type Props = {
  stream: MediaStream | null;
  active: boolean;
};

export default function AudioVisualizer({ stream, active }: Props) {
  const theme = useTheme();
  const [levels, setLevels] = useState<number[]>(new Array(12).fill(4));

  const updateLevels = useCallback(() => {
    if (!active || !stream) {
      setLevels(new Array(12).fill(4));
      return () => {};
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let animationId: number;

      const animate = () => {
        analyser.getByteFrequencyData(dataArray);

        // Map frequency data to 12 bars
        const newLevels = [];
        const step = Math.floor(bufferLength / 12);

        for (let i = 0; i < 12; i += 1) {
          const value = dataArray[i * step] || 0;
          // Scale value (0-255) to height (4-40)
          const height = 4 + (value / 255) * 36;
          newLevels.push(height);
        }

        setLevels(newLevels);
        animationId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationId);
        source.disconnect();
        analyser.disconnect();
        audioContext.close();
      };
    } catch (error) {
      console.error('Audio visualizer error:', error);
      return () => {};
    }
  }, [active, stream]);

  useEffect(() => {
    const cleanup = updateLevels();
    return () => {
      if (cleanup) cleanup();
    };
  }, [updateLevels]);

  if (!active) return null;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={0.5}
      sx={{ height: 40, mt: 2 }}
    >
      {levels.map((height, index) => (
        <Box
          key={index}
          sx={{
            width: 4,
            height: `${height}px`,
            borderRadius: 1,
            bgcolor: theme.palette.primary.main,
            transition: theme.transitions.create(['height'], {
              duration: theme.transitions.duration.shortest,
            }),
          }}
        />
      ))}
    </Stack>
  );
}
