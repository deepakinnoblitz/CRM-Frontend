import { CONFIG } from 'src/config-global';

import { HRDashboardView, SalesDashboardView, CombinedDashboardView, OverviewAnalyticsView as CRMDashboard } from 'src/sections/overview/view';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

export default function Page() {
  const { user } = useAuth();

  const isHR = user?.roles?.some(role => role.toLowerCase() === 'hr');
  const isEmployee = user?.roles?.some(role => role.toLowerCase() === 'employee');
  const isSales = user?.roles?.some(role => role.toLowerCase() === 'sales');
  const isCRM = user?.roles?.some(role => role.toLowerCase() === 'crm user');
  const isSalesAndCRM = user?.roles?.some(role => role.toLowerCase() === 'crm and sales');
  const isAdmin = user?.roles?.some(role => ['administrator', 'system manager'].includes(role.toLowerCase()));

  // Admin and Sales/CRM see the new Sales & CRM dashboard, HR sees HR dashboard
  const renderDashboard = () => {
    if (isAdmin) return <CRMDashboard />;
    if (isSalesAndCRM) return <CombinedDashboardView />;
    if (isSales) return <SalesDashboardView />;
    if (isCRM) return <CRMDashboard />;
    if (isHR) return <HRDashboardView />;
    if (isEmployee) return <HRDashboardView />;
    return <CRMDashboard />;
  };

  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Innoblitz ERP"
      />
      <meta name="keywords" content="Innoblitz ERP" />

      {renderDashboard()}
    </>
  );
}
