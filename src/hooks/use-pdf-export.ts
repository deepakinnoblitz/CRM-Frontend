import { useState } from 'react';
import { useSnackbar } from 'notistack';

export function usePdfExport() {
  const [exportingPdf, setExportingPdf] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleExportPdf = async (exportFn: () => Promise<void> | void) => {
    setExportingPdf(true);
    try {
      await exportFn();
      enqueueSnackbar('PDF exported successfully!', { variant: 'success' });
    } catch (error) {
      console.error('PDF export failed:', error);
      enqueueSnackbar('Failed to export PDF. Please try again.', { variant: 'error' });
    } finally {
      setExportingPdf(false);
    }
  };

  return {
    exportingPdf,
    handleExportPdf,
  };
}
