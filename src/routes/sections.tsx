import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { Outlet, Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/auth-guard';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const LeadsPage = lazy(() => import('src/pages/leads'));
export const ContactPage = lazy(() => import('src/pages/contact'));
export const AccountsPage = lazy(() => import('src/pages/accounts'));
export const DealsPage = lazy(() => import('src/pages/deals'));
export const EventsPage = lazy(() => import('src/pages/events'));
export const CallsPage = lazy(() => import('src/pages/calls'));
export const MeetingsPage = lazy(() => import('src/pages/meetings'));
export const ToDoPage = lazy(() => import('src/pages/todo'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const InvoiceListPage = lazy(() => import('src/pages/invoice/list'));
export const InvoiceCreatePage = lazy(() => import('src/pages/invoice/new'));
export const InvoiceEditPage = lazy(() => import('src/pages/invoice/edit'));
export const InvoiceDetailsPage = lazy(() => import('src/pages/invoice/details'));
export const EstimationListPage = lazy(() => import('src/pages/estimation/list'));
export const EstimationCreatePage = lazy(() => import('src/pages/estimation/new'));
export const EstimationEditPage = lazy(() => import('src/pages/estimation/edit'));
export const EstimationDetailsPage = lazy(() => import('src/pages/estimation/details'));
export const ProductsPage = lazy(() => import('src/pages/products'));

export const LeadReportPage = lazy(() => import('src/pages/reports/lead'));
export const ContactReportPage = lazy(() => import('src/pages/reports/contact'));
export const AccountReportPage = lazy(() => import('src/pages/reports/account'));
export const CallsReportPage = lazy(() => import('src/pages/reports/calls'));
export const MeetingReportPage = lazy(() => import('src/pages/reports/meeting'));
export const PurchaseReportPage = lazy(() => import('src/pages/reports/purchase'));
export const ExpenseReportPage = lazy(() => import('src/pages/reports/expense'));
export const EstimationReportPage = lazy(() => import('src/pages/reports/estimation'));
export const InvoiceReportPage = lazy(() => import('src/pages/reports/invoice'));
export const InvoiceCollectionReportPage = lazy(() => import('src/pages/reports/invoice-collection'));
export const PurchaseCollectionReportPage = lazy(() => import('src/pages/reports/purchase-settlement-report'));
export const TimesheetReportPage = lazy(() => import('src/pages/reports/timesheet'));
export const AttendanceReportPage = lazy(() => import('src/pages/reports/attendance'));
export const EmployeePage = lazy(() => import('src/pages/employee'));
export const AttendancePage = lazy(() => import('src/pages/attendance'));
export const LeavesPage = lazy(() => import('src/pages/leaves'));
export const LeaveAllocationsPage = lazy(() => import('src/pages/leave-allocations'));
export const PayrollPage = lazy(() => import('src/pages/payroll'));
export const RequestsPage = lazy(() => import('src/pages/requests'));
export const AnnouncementsPage = lazy(() => import('src/pages/announcements'));
export const AssetsPage = lazy(() => import('src/pages/assets'));
export const AssetAssignmentsPage = lazy(() => import('src/pages/asset-assignments'));
export const TimesheetsPage = lazy(() => import('src/pages/timesheets'));
export const ExpensesListPage = lazy(() => import('src/pages/expenses/list'));
export const ExpensesNewPage = lazy(() => import('src/pages/expenses/new'));
export const ExpensesEditPage = lazy(() => import('src/pages/expenses/edit'));
export const ExpensesDetailsPage = lazy(() => import('src/pages/expenses/details'));
export const WFHAttendancePage = lazy(() => import('src/pages/wfh-attendance'));
export const ImportAttendancePage = lazy(() => import('src/pages/import-attendance'));
export const HolidaysPage = lazy(() => import('src/pages/holidays'));
export const CRMExpenseTrackerPage = lazy(() => import('src/pages/crm-expense-tracker'));
export const ExpenseTrackerPage = lazy(() => import('src/pages/expense-tracker'));
export const ReimbursementClaimsPage = lazy(() => import('src/pages/reimbursement-claims'));
const RenewalTrackerPage = lazy(() => import('src/pages/renewals-tracker'));
const SalarySlipsPage = lazy(() => import('src/pages/salary-slips'));
const JobOpeningsPage = lazy(() => import('src/pages/job-openings'));
const JobApplicantsPage = lazy(() => import('src/pages/job-applicants'));
const InterviewPage = lazy(() => import('src/pages/interviews'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const AccessDeniedPage = lazy(() => import('src/pages/access-denied'));
export const PurchaseListPage = lazy(() => import('src/pages/purchase/list'));
export const PurchaseNewPage = lazy(() => import('src/pages/purchase/new'));
export const PurchaseEditPage = lazy(() => import('src/pages/purchase/edit'));
export const PurchaseDetailsPage = lazy(() => import('src/pages/purchase/details'));
export const InvoiceCollectionListPage = lazy(() => import('src/pages/invoice-collection/list'));
export const InvoiceCollectionCreatePage = lazy(() => import('src/pages/invoice-collection/new'));
export const InvoiceCollectionEditPage = lazy(() => import('src/pages/invoice-collection/edit'));
export const InvoiceCollectionDetailsPage = lazy(() => import('src/pages/invoice-collection/details'));
export const PurchaseCollectionListPage = lazy(() => import('src/pages/purchase-collection/list'));
export const PurchaseCollectionCreatePage = lazy(() => import('src/pages/purchase-collection/new'));
export const PurchaseCollectionEditPage = lazy(() => import('src/pages/purchase-collection/edit'));
export const PurchaseCollectionDetailsPage = lazy(() => import('src/pages/purchase-collection/details'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));


const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'leads', element: <LeadsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'contacts', element: <ContactPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'deals', element: <DealsPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'calls', element: <CallsPage /> },
      { path: 'meetings', element: <MeetingsPage /> },
      { path: 'todo', element: <ToDoPage /> },
      { path: 'products', element: <ProductsPage /> },
      {
        path: 'invoices',
        children: [
          { index: true, element: <InvoiceListPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: ':id/view', element: <InvoiceDetailsPage /> },
        ],
      },
      {
        path: 'estimations',
        children: [
          { index: true, element: <Navigate to="/deals?tab=estimations" replace /> },
          { path: 'new', element: <EstimationCreatePage /> },
          { path: ':id/edit', element: <EstimationEditPage /> },
          { path: ':id/view', element: <EstimationDetailsPage /> },
        ],
      },
      { path: 'blog', element: <BlogPage /> },

      { path: 'employee', element: <EmployeePage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'leaves', element: <LeavesPage /> },
      { path: 'leave-allocations', element: <LeaveAllocationsPage /> },
      { path: 'payroll', element: <PayrollPage /> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'assets', element: <AssetsPage /> },
      { path: 'asset-assignments', element: <AssetAssignmentsPage /> },
      { path: 'timesheets', element: <TimesheetsPage /> },
      { path: 'wfh-attendance', element: <WFHAttendancePage /> },
      { path: 'import-attendance', element: <ImportAttendancePage /> },
      { path: 'timesheet-reports', element: <TimesheetReportPage /> },
      {
        path: 'expenses',
        children: [
          { index: true, element: <ExpensesListPage /> },
          { path: 'new', element: <ExpensesNewPage /> },
          { path: ':id/edit', element: <ExpensesEditPage /> },
          { path: ':id/view', element: <ExpensesDetailsPage /> },
        ],
      },
      { path: 'crm-expense-tracker', element: <CRMExpenseTrackerPage /> },
      { path: 'expense-tracker', element: <ExpenseTrackerPage /> },
      { path: 'holidays', element: <HolidaysPage /> },
      { path: 'reimbursement-claims', element: <ReimbursementClaimsPage /> },
      { path: 'renewals-tracker', element: <RenewalTrackerPage /> },
      { path: 'salary-slips', element: <SalarySlipsPage /> },
      { path: 'job-openings', element: <JobOpeningsPage /> },
      { path: 'job-applicants', element: <JobApplicantsPage /> },
      { path: 'interviews', element: <InterviewPage /> },
      {
        path: 'purchase',
        children: [
          { index: true, element: <PurchaseListPage /> },
          { path: 'new', element: <PurchaseNewPage /> },
          { path: 'edit/:id', element: <PurchaseEditPage /> },
          { path: ':id', element: <PurchaseDetailsPage /> },
        ],
      },

      {
        path: 'invoice-collections',
        children: [
          { index: true, element: <InvoiceCollectionListPage /> },
          { path: 'new', element: <InvoiceCollectionCreatePage /> },
          { path: ':id/edit', element: <InvoiceCollectionEditPage /> },
          { path: ':id/view', element: <InvoiceCollectionDetailsPage /> },
        ],
      },

      {
        path: 'purchase-collections',
        children: [
          { index: true, element: <PurchaseCollectionListPage /> },
          { path: 'new', element: <PurchaseCollectionCreatePage /> },
          { path: ':id/edit', element: <PurchaseCollectionEditPage /> },
          { path: ':id/view', element: <PurchaseCollectionDetailsPage /> },
        ],
      },

      {
        path: 'reports',
        children: [
          { path: 'lead', element: <LeadReportPage /> },
          { path: 'contact', element: <ContactReportPage /> },
          { path: 'account', element: <AccountReportPage /> },
          { path: 'calls', element: <CallsReportPage /> },
          { path: 'meeting', element: <MeetingReportPage /> },
          { path: 'purchase', element: <PurchaseReportPage /> },
          { path: 'expense', element: <ExpenseReportPage /> },
          { path: 'estimation', element: <EstimationReportPage /> },
          { path: 'invoice', element: <InvoiceReportPage /> },
          { path: 'invoice-collection', element: <InvoiceCollectionReportPage /> },
          { path: 'purchase-settlement', element: <PurchaseCollectionReportPage /> },
          { path: 'timesheet', element: <TimesheetReportPage /> },
          { path: 'attendance', element: <AttendanceReportPage /> },
        ],
      },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'access-denied',
    element: (
      <Suspense fallback={renderFallback()}>
        <AccessDeniedPage />
      </Suspense>
    ),
  },
  { path: '404', element: <Page404 /> },
  { path: '*', element: <Page404 /> },
];
