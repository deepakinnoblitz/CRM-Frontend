import { useDashboardView } from 'src/hooks/dashboard-view-context';

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
  const { view, isHRView, isCRMView } = useDashboardView();

  const isHR = user?.roles?.some((role: string) => role.toLowerCase() === 'hr');
  const isEmployee = user?.roles?.some((role: string) => role.toLowerCase() === 'employee');
  const isSales = user?.roles?.some((role: string) => role.toLowerCase() === 'sales');
  const isCRM = user?.roles?.some((role: string) => role.toLowerCase() === 'crm user');
  const isSalesAndCRM = user?.roles?.some((role: string) => role.toLowerCase() === 'crm and sales');
  const isAdmin = user?.roles?.some((role: string) => ['administrator', 'system manager'].includes(role.toLowerCase()));

  const hasMultipleRoles = (isHR && (isSales || isCRM || isSalesAndCRM)) || isAdmin;

  // HR users see HR dashboard, Sales/CRM see their dashboards, Admin sees CRM dashboard
  const renderDashboard = () => {
    if (hasMultipleRoles) {
      if (isHRView) return <HRDashboardView />;
      if (isCRMView) {
        if (isSalesAndCRM || isAdmin) return <CombinedDashboardView />;
        if (isSales) return <SalesDashboardView />;
        if (isCRM) return <CRMDashboard />;
      }
    }

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
        content="Innoblitz"
      />
      <meta name="keywords" content="Innoblitz" />

      {renderDashboard()}
    </>
  );
}
