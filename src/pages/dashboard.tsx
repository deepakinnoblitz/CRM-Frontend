import { CONFIG } from 'src/config-global';

import { HRDashboardView } from 'src/sections/overview/view/hr-dashboard-view';
import { SalesDashboardView } from 'src/sections/overview/view/sales-dashboard-view';
import { EmployeeDashboardView } from 'src/sections/overview/view/employee-dashboard-view';
import { CombinedDashboardView } from 'src/sections/overview/view/combined-dashboard-view';
import { OverviewAnalyticsView as CRMDashboard } from 'src/sections/overview/view/overview-analytics-view';

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

  // HR users see HR dashboard, Sales/CRM see their dashboards, Admin sees CRM dashboard
  const renderDashboard = () => {
    if (isHR) return <HRDashboardView />;
    if (isEmployee) return <EmployeeDashboardView />;
    if (isAdmin) return <CRMDashboard />;
    if (isSalesAndCRM) return <CombinedDashboardView />;
    if (isSales) return <SalesDashboardView />;
    if (isCRM) return <CRMDashboard />;
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
