import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import App from './app';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';

// ----------------------------------------------------------------------

const router = createBrowserRouter(
  [
    {
      Component: () => (
        <App>
          <Outlet />
        </App>
      ),
      errorElement: <ErrorBoundary />,
      children: routesSection,
    },
  ],
  {
    basename: '/',
  }
);

// ----------------------------------------------------------------------

window.addEventListener('beforeunload', (e) => {
  // 1. Check if we are on the sign-in page.
  if (window.location.pathname.includes('/sign-in')) {
    return undefined;
  }

  // 2. Check user presence status from localStorage
  const status = localStorage.getItem('user_presence_status');
  if (status !== 'Available') {
    return undefined;
  }

  // 3. Standard prompt setup.
  // Custom message is ignored by modern browsers but 'returnValue' is required.
  const confirmationMessage = '\\o/';
  if (e) {
    e.preventDefault();
    e.returnValue = confirmationMessage;
  }
  return confirmationMessage;
});

// ----------------------------------------------------------------------

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
