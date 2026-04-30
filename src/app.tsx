import 'src/global.css';

import { useEffect } from 'react';
import { SnackbarProvider } from 'notistack';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { usePathname } from 'src/routes/hooks';

import { DashboardViewProvider } from 'src/hooks/dashboard-view-context';

import { ThemeProvider } from 'src/theme/theme-provider';

import { AuthProvider } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} dateFormats={{ normalDate: 'DD-MM-YYYY', keyboardDate: 'DD-MM-YYYY' }}>
      <AuthProvider>
        <DashboardViewProvider>
          <ThemeProvider>
            <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
              {children}
            </SnackbarProvider>
          </ThemeProvider>
        </DashboardViewProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}