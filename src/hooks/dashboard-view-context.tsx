import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

type DashboardView = 'HR' | 'CRM';

type DashboardViewContextType = {
  view: DashboardView;
  setView: (view: DashboardView) => void;
  isHRView: boolean;
  isCRMView: boolean;
};

const DashboardViewContext = createContext<DashboardViewContextType | undefined>(undefined);

export function DashboardViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<DashboardView>(() => {
    // Try to get from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-view');
      return (saved as DashboardView) || 'HR';
    }
    return 'HR';
  });

  const handleSetView = useCallback((newView: DashboardView) => {
    setView(newView);
    localStorage.setItem('dashboard-view', newView);
  }, []);

  const value = {
    view,
    setView: handleSetView,
    isHRView: view === 'HR',
    isCRMView: view === 'CRM',
  };

  return <DashboardViewContext.Provider value={value}>{children}</DashboardViewContext.Provider>;
}

export function useDashboardView() {
  const context = useContext(DashboardViewContext);
  if (context === undefined) {
    throw new Error('useDashboardView must be used within a DashboardViewProvider');
  }
  return context;
}
