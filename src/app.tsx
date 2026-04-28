import 'src/global.css';

import { useEffect } from 'react';
import { SnackbarProvider } from 'notistack';

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
    <AuthProvider>
      <DashboardViewProvider>
        <ThemeProvider>
          <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            {children}
          </SnackbarProvider>
        </ThemeProvider>
      </DashboardViewProvider>
    </AuthProvider>
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