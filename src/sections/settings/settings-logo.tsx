import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { uploadFile } from 'src/api/data-import';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  value?: string;
  onUpload: (url: string) => void;
};

export function SettingsLogo({ value, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Upload to 'HRMS Settings' doctype
      const uploaded = await uploadFile(file, 'HRMS Settings', 'HRMS Settings', 'app_logo');
      onUpload(uploaded.file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Application Logo
      </Typography>

      <Stack spacing={3} alignItems="center">
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            bgcolor: (theme) => theme.palette.background.neutral,
          }}
        >
          {value ? (
            <Box
              component="img"
              src={value}
              sx={{ width: 1, height: 1, objectFit: 'contain' }}
            />
          ) : (
            <Iconify icon={"solar:gallery-bold" as any} width={48} sx={{ color: 'text.disabled' }} />
          )}
        </Box>

        <Button
          variant="contained"
          component="label"
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon={"solar:upload-minimalistic-bold" as any} />}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload New Logo'}
          <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
        </Button>

        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Allowed *.jpeg, *.jpg, *.png, *.svg
          <br /> max size of 2MB
        </Typography>
      </Stack>
    </Card>
  );
}
