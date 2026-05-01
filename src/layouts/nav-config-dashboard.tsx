
import { FiList } from "react-icons/fi";
import { FaTasks } from "react-icons/fa";
import { CgNotes } from "react-icons/cg";
import { TbReport } from "react-icons/tb";
import { FiUserPlus } from "react-icons/fi";
import { GoTasklist } from "react-icons/go";
import { RiAppsLine } from "react-icons/ri";
import { RxCalendar } from "react-icons/rx";
import { PiMoneyWavy } from "react-icons/pi";
import { LuUsersRound } from "react-icons/lu";
import { IoHomeOutline } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { LuCalendarCheck2 } from "react-icons/lu";
import { TbReportAnalytics } from "react-icons/tb";
import { LuFileSpreadsheet } from "react-icons/lu";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { MdOutlineLaptopWindows } from "react-icons/md";

import { Iconify } from 'src/components/iconify';
// ----------------------------------------------------------------------


export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  children?: {
    title: string;
    path: string;
    info?: React.ReactNode;
  }[];
};


// ----------------------  HR NavBar ---------------------------------------------------
export const hrNavData = [
  {
    title: 'HR Dashboard',
    path: '/',
    icon: <IoHomeOutline />,
  },
  {
    title: 'Task Manager',
    path: '/task-manager?view=all',
    icon: <FaTasks size={18} />,
  },
  {
    title: 'Employee Records',
    path: '/employee',
    icon: <Iconify icon={"solar:users-group-rounded-bold-duotone" as any} />,
    children: [
      { title: 'Employee List', path: '/employee' },
      { title: 'Users List', path: '/users' },
    ],
  },
  {
    title: 'Attendance Records',
    path: '/attendance',
    icon: <Iconify icon={"solar:calendar-mark-bold-duotone" as any} />,
    children: [
      { title: 'Attendance List', path: '/attendance' },
      { title: 'WFH Attendance', path: '/wfh-attendance' },
      { title: 'Daily Log', path: '/daily-log' },
      { title: 'Import Attendance', path: '/import-attendance' },
    ],
  },
  {
    title: 'Leaves Records',
    path: '/leaves',
    icon: <Iconify icon={"solar:calendar-date-bold-duotone" as any} />,
    children: [
      { title: 'Leave Application', path: '/leaves' },
      { title: 'Leave Allocate', path: '/leave-allocations' },
    ],
  },
  {
    title: 'Request List',
    path: '/requests',
    icon: <Iconify icon={"solar:document-text-bold-duotone" as any} />,
  },
  {
    title: 'Timesheets',
    path: '/timesheets',
    icon: <Iconify icon={"solar:clock-circle-bold-duotone" as any} />,
  },
  {
    title: 'Salary Slips',
    path: '/salary-slips',
    icon: <Iconify icon={"solar:bill-list-bold-duotone" as any} />,
  },
  {
    title: 'Timesheets',
    path: '/timesheets',
    icon: <Iconify icon={"solar:clock-circle-bold-duotone" as any} />,
  },
  {
    title: 'Holidays List',
    path: '/holidays',
    icon: <Iconify icon={"solar:list-bold-duotone" as any} />,
  },
  {
    title: 'Announcements',
    path: '/announcements',
    icon: <Iconify icon={"solar:bell-bold-duotone" as any} />,
  },
  {
    title: 'Asset Records',
    path: '/assets',
    icon: <Iconify icon={"solar:laptop-bold-duotone" as any} />,
    children: [
      { title: 'Asset List', path: '/assets/list' },
      { title: 'Asset Assignments', path: '/assets/assignments' },
      { title: 'Asset Requests', path: '/assets/requests' },
    ],
  },
  {
    title: 'Salary Slips',
    path: '/salary-slips',
    icon: <Iconify icon={"solar:bill-list-bold-duotone" as any} />,
  },
  {
    title: 'Expenses',
    path: '/expenses',
    icon: <Iconify icon={"solar:wallet-money-bold-duotone" as any} />,
    children: [
      { title: 'Company Expenses', path: '/expense-tracker' },
      { title: 'Reimbursement Claim List', path: '/reimbursement-claims' },
    ],
  },
  {
    title: 'Employee Performance',
    path: '/employee-evaluation',
    icon: <Iconify icon={"solar:user-speak-bold-duotone" as any} />,
    children: [
      { title: 'Employee Evaluation', path: '/employee-evaluation' },
      { title: 'Badges', path: '/badges' },
      { title: 'Employee Monthly Award', path: '/employee-monthly-award' },
    ],
  },
  {
    title: 'Recruitment',
    path: '/job-openings',
    icon: <Iconify icon={"solar:buildings-bold-duotone" as any} />,
    children: [
      { title: 'Job Opening List', path: '/job-openings' },
      { title: 'Job Applicant List', path: '/job-applicants' },
      { title: 'Interview List', path: '/interviews' },
      { title: 'Employee Referral List', path: '/employee-referrals?view=hr' },
    ],
  },
  {
    title: 'Report',
    path: '/reports',
    icon: <Iconify icon={"solar:laptop-bold-duotone" as any} />,
    children: [
      { title: 'Attendance Report', path: '/reports/attendance' },
      { title: 'Daily Log Report', path: '/reports/daily-log' },
      { title: 'Task Report', path: '/reports/task-manager' },
      { title: 'Timesheet Report', path: '/timesheet-reports' },
    ],
  },
  {
    title: 'Masters',
    path: '/department',
    icon: <Iconify icon={"solar:folder-bold-duotone" as any} />,
    children: [
      { title: 'Department', path: '/department' },
      { title: 'Project', path: '/project' },
      { title: 'Activity Type', path: '/activity-type' },
      { title: 'Claim Type', path: '/claim-type' },
      { title: 'Bank Account', path: '/bank-account' },
      { title: 'Asset Category', path: '/asset-category' },
      { title: 'Criteria Category', path: '/performance-criteria-category' },
      { title: 'Designation', path: '/designation' },
      { title: 'Salary Component', path: '/salary-structure-component' },
    ],
  },
];


// ----------------------  Employee NavBar ---------------------------------------------------
export const employeeNavData = [
  {
    title: 'Employee Dashboard',
    path: '/',
    icon: <IoHomeOutline size={18} />,
  },
  {
    title: 'My Profile',
    path: '/my-profile',
    icon: <LuUsersRound size={18} />,
  },
  {
    title: 'My Tasks',
    path: '/task-manager?view=mine',
    icon: <GoTasklist size={22} />,
  },
  {
    title: 'My Attendance',
    path: '/attendance',
    icon: <RiCalendarScheduleLine size={18} />,
  },
  {
    title: 'My Activity Log',
    path: '/daily-log',
    icon: <RxCalendar size={18} />,
  },
  {
    title: 'My Leave Application',
    path: '/leaves',
    icon: <RiAppsLine size={18} />,
  },
  {
    title: 'My Request List',
    path: '/requests',
    icon: <FiList   size={18} />,
  },
  {
    title: 'My Timesheet',
    path: '/timesheets',
    icon: <LuFileSpreadsheet size={18} />,
  },
  {
    title: 'My WFH Attendance',
    path: '/wfh-attendance',
    icon: <LuCalendarCheck2 size={18} />,
  },
  {
    title: 'My Salary Slip',
    path: '/salary-slips',
    icon: <PiMoneyWavy size={18} />,
  },
  {
    title: 'My Reimbursement Claim',
    path: '/reimbursement-claims',
    icon: <CgNotes size={18} />,
  },
  {
    title: 'My Assets',
    path: '/assets',
    icon: <MdOutlineLaptopWindows size={18} />,
    children: [
      { title: 'My Asset List', path: '/assets/assignments' },
      { title: 'My Asset Requests', path: '/assets/requests' },
    ],
  },
  {
    title: 'Refer a Friend',
    path: '/employee-referrals',
    icon: <FiUserPlus size={18} />,
  },
  {
    title: 'Timesheet Report',
    path: '/timesheet-reports',
    icon: <TbReport  size={18} />,
  },
  {
    title: 'Attendance Report',
    path: '/reports/attendance',
    icon: <TbReportSearch size={18} />,
  },
  {
    title: 'Daily Log Report',
    path: '/reports/daily-log',
    icon: <TbReportAnalytics size={18} />,
  }
];

// ----------------------  Sales NavBar ---------------------------------------------------
export const salesNavData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Iconify icon={"solar:widget-5-bold-duotone" as any} />,
  },
  {
    title: 'Purchases',
    path: '/purchase',
    icon: <Iconify icon={"solar:bag-bold-duotone" as any} />,
  },
  {
    title: 'Purchase Settlements',
    path: '/purchase-collections',
    icon: <Iconify icon={"solar:wad-of-money-bold-duotone" as any} />,
  },
  {
    title: 'Expense Tracker',
    path: '/crm-expense-tracker',
    icon: <Iconify icon={"solar:wallet-money-bold-duotone" as any} />,
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: <Iconify icon={"solar:chart-square-bold-duotone" as any} />,
    children: [
      { title: 'Purchase Report', path: '/reports/purchase' },
      { title: 'Estimation Report', path: '/reports/estimation' },
      { title: 'Invoice Report', path: '/reports/invoice' },
      { title: 'Invoice Collection Summary', path: '/reports/invoice-collection' },
      { title: 'Purchase Settlement Report', path: '/reports/purchase-settlement' }
    ]
  }
];


// ----------------------  CRM NavBar ---------------------------------------------------
export const crmNavData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Iconify icon={"solar:widget-5-bold-duotone" as any} />,
  },
  {
    title: 'Expense Tracker',
    path: '/crm-expense-tracker',
    icon: <Iconify icon={"solar:wallet-money-bold-duotone" as any} />,
  },
  {
    title: 'Leads',
    path: '/leads',
    icon: <Iconify icon={"solar:target-bold-duotone" as any} />,
  },
  {
    title: 'Contacts',
    path: '/contacts',
    icon: <Iconify icon={"solar:users-group-rounded-bold-duotone" as any} />,
  },
  {
    title: 'Accounts',
    path: '/accounts',
    icon: <Iconify icon={"solar:buildings-2-bold-duotone" as any} />,
  },
  {
    title: 'Deals',
    path: '/deals',
    icon: <Iconify icon={"solar:hand-money-bold-duotone" as any} />,
  },
  {
    title: 'Events',
    path: '/events',
    icon: <Iconify icon={"solar:calendar-mark-bold-duotone" as any} />,
  },
  {
    title: 'Calls',
    path: '/calls',
    icon: <Iconify icon={"solar:phone-calling-rounded-bold-duotone" as any} />,
  },
  {
    title: 'ToDo',
    path: '/todo',
    icon: <Iconify icon={"solar:list-bold-duotone" as any} />,
  },
  {
    title: 'Meetings',
    path: '/meetings',
    icon: <Iconify icon={"solar:videocamera-record-bold-duotone" as any} />,
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: <Iconify icon={"solar:chart-square-bold-duotone" as any} />,
    children: [
      { title: 'Lead Report', path: '/reports/lead' },
      { title: 'Contact Report', path: '/reports/contact' },
      { title: 'Accounts Report', path: '/reports/account' },
      { title: 'Calls Report', path: '/reports/calls' },
      { title: 'Meeting Report', path: '/reports/meeting' }
    ]
  },
  {
    title: 'Chat',
    path: '/chat',
    icon: <Iconify icon={"solar:chat-round-dots-bold-duotone" as any} />,
  },
];

// ----------------------  CRM and Sales NavBar ---------------------------------------------------
export const crmAndSalesNavData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Iconify icon={"solar:widget-5-bold-duotone" as any} />,
  },
  {
    title: 'Leads',
    path: '/leads',
    icon: <Iconify icon={"solar:target-bold-duotone" as any} />,
  },
  {
    title: 'Contacts',
    path: '/contacts',
    icon: <Iconify icon={"solar:users-group-rounded-bold-duotone" as any} />,
  },
  {
    title: 'Accounts',
    path: '/accounts',
    icon: <Iconify icon={"solar:buildings-2-bold-duotone" as any} />,
  },
  {
    title: 'Deals',
    path: '/deals',
    icon: <Iconify icon={"solar:hand-money-bold-duotone" as any} />,
  },
  {
    title: 'Purchases',
    path: '/purchase',
    icon: <Iconify icon={"solar:bag-bold-duotone" as any} />,
  },
  {
    title: 'Expense Tracker',
    path: '/crm-expense-tracker',
    icon: <Iconify icon={"solar:wallet-money-bold-duotone" as any} />,
  },
  {
    title: 'Calendar',
    path: '/events',
    icon: <Iconify icon={"solar:calendar-mark-bold-duotone" as any} />,
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: <Iconify icon={"solar:chart-square-bold-duotone" as any} />,
    children: [
      { title: 'Lead Report', path: '/reports/lead' },
      { title: 'Contact Report', path: '/reports/contact' },
      { title: 'Accounts Report', path: '/reports/account' },
      { title: 'Calls Report', path: '/reports/calls' },
      { title: 'Meeting Report', path: '/reports/meeting' },
      { title: 'Purchase Report', path: '/reports/purchase' },
      { title: 'Estimation Report', path: '/reports/estimation' },
      { title: 'Invoice Report', path: '/reports/invoice' },
      { title: 'Invoice Collection Summary', path: '/reports/invoice-collection' },
      { title: 'Purchase Settlement Report', path: '/reports/purchase-settlement' }
    ]
  }
];

export const commonNavData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Iconify icon={"solar:widget-5-bold-duotone" as any} />,
  },
];


// Helper function to check if user has any valid role
export function hasValidRole(roles: string[] = []): boolean {
  if (roles.includes('Administrator')) {
    return true;
  }

  const validRolePatterns = ['HR', 'Employee', 'Sales', 'CRM User', 'CRM And Sales'];
  const hasValid = roles.some((role) => {
    const matches = validRolePatterns.includes(role);
    return matches;
  });
  return hasValid;
}

export function getNavData(roles: string[] = [], view?: 'HR' | 'CRM', settings?: any) {
  console.log('getNavData called with view:', view, 'roles:', roles);
  const mergedNav: NavItem[] = [];
  const seenPaths = new Set<string>();

  const addItems = (data: NavItem[]) => {
    data.forEach((item) => {
      // Clone the item to avoid mutating the original data
      const itemClone = {
        ...item,
        ...(item.children && {
          children: item.children.map((child) => ({ ...child })),
        }),
      };

      // Sidebar visibility filtering
      if ((itemClone.title === 'Attendance Records' || itemClone.title === 'Attendance Report' || itemClone.title === 'Daily Log Report') && itemClone.children) {
        itemClone.children = itemClone.children.filter(child => {
          if ((child.title === 'Attendance List' || child.title === 'My Attendance') && settings?.show_attendance_list === 0) return false;
          if ((child.title === 'Daily Log' || child.title === 'My Activity Log') && settings?.show_daily_log === 0) return false;
          return true;
        });
        if (itemClone.children.length === 0) return;
      }

      // Handle top-level items for Employee View
      if ((itemClone.title === 'My Attendance' || itemClone.title === 'Attendance List') && settings?.show_attendance_list === 0) return;
      if ((itemClone.title === 'My Activity Log' || itemClone.title === 'Daily Log') && settings?.show_daily_log === 0) return;

      if (itemClone.title === 'Report' && itemClone.children) {
        itemClone.children = itemClone.children.filter(child => {
          if (child.title === 'Attendance Report' && settings?.show_attendance_report === 0) return false;
          if (child.title === 'Daily Log Report' && settings?.show_daily_log_report === 0) return false;
          return true;
        });
        if (itemClone.children.length === 0) return;
      }

      // Handle top-level report items if any
      if (itemClone.title === 'Attendance Report' && settings?.show_attendance_report === 0) return;
      if (itemClone.title === 'Daily Log Report' && settings?.show_daily_log_report === 0) return;

      if (!seenPaths.has(itemClone.path)) {
        mergedNav.push(itemClone);
        seenPaths.add(itemClone.path);
      } else {
        const existingItem = mergedNav.find((i) => i.path === itemClone.path);
        if (existingItem && itemClone.children && existingItem.children) {
          const childPaths = new Set(existingItem.children.map((c) => c.path));
          itemClone.children.forEach((child) => {
            if (!childPaths.has(child.path)) {
              existingItem.children!.push({ ...child });
            }
          });
        }
      }
    });
  };

  // Check if user has valid access
  const hasAccess = hasValidRole(roles);

  // If no valid role, return empty navigation with no access flag
  if (!hasAccess) {
    return { hasAccess: false, navData: [] };
  }

  // If Administrator, show view-specific navigation or EVERYTHING
  const isAdmin = roles.some(role => ['administrator', 'system manager'].includes(role.toLowerCase()));

  if (isAdmin) {
    if (view === 'HR') {
      addItems(hrNavData);
    } else if (view === 'CRM') {
      addItems(crmAndSalesNavData);
    } else {
      addItems(hrNavData);
      addItems(employeeNavData);
      addItems(crmAndSalesNavData);
    }
    addItems([
      {
        title: 'User Management',
        path: '/users',
        icon: <Iconify icon={"solar:settings-bold-duotone" as any} />,
      }
    ]);
    return { hasAccess: true, navData: mergedNav };
  }

  let hasCustomRole = false;
  const hasRole = (pattern: string) => roles.some(role => role.toLowerCase() === pattern.toLowerCase());

  const hasHR = hasRole('HR');
  const hasSalesOrCRM = hasRole('Sales') || hasRole('CRM User') || hasRole('CRM And Sales');

  if (view === 'HR' && hasHR) {
    let filteredHrNav = hrNavData;
    if (!hasRole('Task Manager')) {
      filteredHrNav = hrNavData.filter(
        (item) => item.title !== 'Task Manager' && item.title !== 'Employee Evaluation'
      );
    }
    addItems(filteredHrNav);
    hasCustomRole = true;
  } else if (view === 'CRM' && hasSalesOrCRM) {
    addItems(crmAndSalesNavData);
    hasCustomRole = true;
  } else {
    // Default logic (merged or first available)
    if (hasHR) {
      let filteredHrNav = hrNavData;
      if (!hasRole('Task Manager')) {
        filteredHrNav = hrNavData.filter(
          (item) => item.title !== 'Task Manager' && item.title !== 'Employee Evaluation'
        );
      }
      addItems(filteredHrNav);
      hasCustomRole = true;
    }

    if (hasRole('Employee')) {
      const processedEmployeeNav = [...employeeNavData];
      if (hasRole('Task Manager')) {
        const taskManagerItem = hrNavData.find((item) => item.title === 'Task Manager');
        if (taskManagerItem) {
          processedEmployeeNav.splice(1, 0, taskManagerItem);
        }
      }
      addItems(processedEmployeeNav);
      hasCustomRole = true;
    }

    if (hasRole('Sales')) {
      addItems(salesNavData);
      hasCustomRole = true;
    }

    if (hasRole('CRM User')) {
      addItems(crmNavData);
      hasCustomRole = true;
    }

    if (hasRole('CRM And Sales')) {
      addItems(crmAndSalesNavData);
      hasCustomRole = true;
    }
  }

  if (!hasCustomRole) {
    return { hasAccess: true, navData: commonNavData };
  }

  return { hasAccess: true, navData: mergedNav };
}
