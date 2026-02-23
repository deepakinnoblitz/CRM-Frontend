# API Documentation

This document provides a comprehensive overview of the frontend API modules used in the Company application, organized by logical groups.

## Core & Authentication

These APIs handle user authentication, user management, and core metadata.

### Auth API (`auth.ts`)
Handles user session management.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `login(usr, pwd)` | POST | `/api/method/login` | Authenticates a user and creates a session. |
| `getLoggedUser()` | GET | `/api/method/frappe.auth.get_logged_user` | Returns the currently logged-in user name. |
| `logout()` | POST | `/api/method/logout` | Terminates the current user session. |
| `getCurrentUserInfo()` | GET | `/api/method/company.company.frontend_api.get_current_user_info` | Fetches detailed info for the current user. |

### Users API (`users.ts`)
Manages system users and their profiles.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchUsers(params)` | GET | `/api/method/frappe.client.get_list` | Fetches a list of users with filtering and pagination. |
| `createUser(data)` | POST | `/api/method/frappe.client.insert` | Creates a new User document. |
| `updateUser(name, data)` | POST | `/api/method/frappe.client.set_value` | Updates an existing User document. |
| `deleteUser(name)` | POST | `/api/method/frappe.client.delete` | Deletes a User document. |
| `getUser(name)` | GET | `/api/method/frappe.client.get` | Fetches full details of a specific User. |
| `fetchUserPermissions(user)` | GET | `/api/method/frappe.client.get_list` | Fetches permissions for a specific user. |
| `getRoleProfiles()` | GET | `/api/method/frappe.client.get_list` | Fetches available Role Profiles. |
| `getRoles()` | GET | `/api/method/frappe.client.get_list` | Fetches available Roles. |
| `getModules()` | GET | `/api/method/frappe.client.get_list` | Fetches available Module Definitions. |
| `changeUserPassword(uid, pwd)`| POST | `/api/method/company.company.frontend_api.admin_change_user_password` | Changes a user's password (admin action). |

### User Permissions API (`user-permissions.ts`)
Manages granular user permissions.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchUserPermissions(p)`| GET | `/api/method/frappe.client.get_list` | Fetches a paginated list of user permissions. |
| `createUserPermission(d)`| POST | `/api/method/frappe.client.insert` | Creates a new User Permission record. |
| `deleteUserPermission(n)`| POST| `/api/method/frappe.client.delete` | Deletes a User Permission record. |
| `getDocTypes()` | GET | `/api/method/frappe.client.get_list` | Fetches list of available DocTypes. |
| `getUsers()` | GET | `/api/method/frappe.client.get_list` | Fetches list of enabled users. |
| `getForValueOptions(dt)`| GET | `/api/method/frappe.client.get_list` | Fetches options for the 'for_value' field based on DocType. |

### Meta API (`meta.ts`)
Fetches DocType metadata.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `getDoctypeMeta(doctype)` | GET | `/api/method/company.company.frontend_api.get_doctype_fields` | Fetches field definitions for a DocType. |

### Unread Counts API (`unread-counts.ts`)
Manages unread notifications for HR items.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchUnreadCounts()` | GET | `/api/method/company.company.api.get_unread_count` | Fetches counts for unread Leave, Requests, etc. |
| `markAsRead(doctype, name)`| POST | `/api/method/company.company.api.mark_hr_item_as_read` | Marks a specific record as read. |

---

## HR & Employee Management

These APIs manage employee records, attendance, leaves, and salary slips.

### Employees API (`employees.ts`)
Manages employee profiles and information.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchEmployees(p)` | GET | `/api/method/frappe.client.get_list` | Fetches a paginated list of employees. |
| `createEmployee(d)` | POST | `/api/method/frappe.client.insert` | Creates a new Employee record. |
| `updateEmployee(n, d)`| POST | `/api/method/frappe.client.set_value` | Updates an employee record. |
| `deleteEmployee(n)` | POST | `/api/method/frappe.client.delete` | Deletes an employee record. |

### Attendance API (`attendance.ts`)
Manages daily attendance records.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchAttendance(p)` | GET | `/api/method/frappe.client.get_list` | Fetches attendance records. |
| `createAttendance(d)` | POST | `/api/method/frappe.client.insert` | Creates an attendance record. |
| `updateAttendance(n, d)`| POST | `/api/method/frappe.client.set_value` | Updates an attendance record. |
| `deleteAttendance(n)` | POST | `/api/method/frappe.client.delete` | Deletes an attendance record. |
| `getAttendance(n)` | GET | `/api/method/frappe.client.get` | Fetches details of a specific attendance record. |

### Leaves API (`leaves.ts`)
Handles leave applications, balances, and workflows.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchLeaveApplications(p)` | GET | `/api/method/frappe.client.get_list` | Fetches leave applications. |
| `createLeaveApplication(d)` | POST | `/api/method/frappe.client.insert` | Submits a new leave application. |
| `checkLeaveBalance(p)` | GET | `/api/method/company.company.api.check_leave_balance` | Checks available leave balance. |
| `getEmployeeProbationInfo(e)`| GET | `/api/method/company.company.api.get_employee_probation_info` | Fetches probation status for an employee. |
| `getLeaveWorkflowActions(s)`| GET | `/api/method/company.company.frontend_api.get_workflow_states` | Fetches available workflow actions. |
| `applyLeaveWorkflowAction(n, a)`| POST | `/api/method/company.company.frontend_api.apply_workflow_action` | Applies a workflow action (e.g., Approve). |

### Leave Allocations API (`leave-allocations.ts`)
Manages leave quota allocations for employees.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchLeaveAllocations(p)` | GET | `/api/method/frappe.client.get_list` | Fetches leave allocations. |
| `createLeaveAllocation(d)` | POST | `/api/method/frappe.client.insert` | Creates a new leave allocation. |
| `getLeaveAllocationPreview(y, m)`| POST | `/api/method/company.company.api.get_leave_allocation_preview` | Previews monthly allocations. |
| `autoAllocateMonthlyLeaves(y, m)`| POST | `/api/method/company.company.api.auto_allocate_monthly_leaves` | Executes auto-allocation of leaves. |

### Salary Slips API (`salary-slips.ts`)
Manages employee payroll records.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchSalarySlips(p)` | GET | `/api/method/frappe.client.get_list` | Fetches salary slips. |
| `getSalarySlip(n)` | GET | `/api/method/frappe.client.get` | Fetches salary slip details. |
| `getSalarySlipDownloadUrl(n)`| GET | `/api/method/frappe.utils.print_format.download_pdf` | Returns URL to download PDF. |
| `previewSalarySlip(e, s, e2)`| POST | `/api/method/company.company.frontend_api.preview_salary_slip` | Previews a salary slip calculation. |
| `generateSalarySlipsForEmployees(y, m, e)`| POST | `/api/method/company.company.api.generate_salary_slips_from_employee` | Generates slips for multiple employees. |

### WFH Attendance API (`wfh-attendance.ts`)
Manages work-from-home requests and approvals.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchWFHAttendance(p)` | GET | `/api/method/frappe.client.get_list` | Fetches WFH attendance records. |
| `applyWorkflowAction(n, a)` | POST | `/api/method/company.company.frontend_api.apply_workflow_action` | Approves or rejects WFH requests. |

### HR Management API (`hr-management.ts`)
Generic utilities for HR-related DocTypes.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchFrappeList(dt, p)` | GET | `/api/method/frappe.client.get_list` | Generic paginated list fetcher. |
| `getHRDoc(dt, n)` | GET | `/api/method/frappe.client.get` | Fetches a single HR document. |
| `getDocTypeMetadata(dt)` | GET | `/api/method/frappe.desk.form.load.getdoctype` | Fetches DocType metadata. |
| `getHRPermissions(dt)` | GET | `/api/method/company.company.frontend_api.get_doc_permissions` | Fetches user permissions for a DocType. |

---

## Financial & Reporting

These APIs manage accounts, invoices, collections, purchases, and analytical dashboards.

### Accounts & Invoicing (`accounts.ts`, `invoice.ts`, `estimation.ts`)
Handles client accounts, sales invoices, and price estimations.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchAccounts(p)` | GET | `/api/method/frappe.client.get_list` | Fetches client account records. |
| `createInvoice(d)` | POST | `/api/method/frappe.client.insert` | Generates a new sales invoice. |
| `convertEstimationToInvoice(n)`| POST | `/api/method/.../convert_estimation_to_invoice` | Converts estimate to invoice. |

### Collections & Purchases (`invoice-collection.ts`, `purchase.ts`, `purchase-collection.ts`)
Manages incoming payments and outgoing purchase orders.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `createInvoiceCollection(d)`| POST | `/api/method/frappe.client.insert` | Records a payment from a client. |
| `fetchPurchases(p)` | GET | `/api/method/frappe.client.get_list` | Fetches purchase records. |
| `createPurchaseCollection(d)`| POST | `/api/method/frappe.client.insert` | Records a payment to a vendor. |

### Reporting & Dashboards (`reports.ts`, `dashboard.ts`, `renewal-tracker.ts`)
Provides high-level insights and tracks renewals.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `runReport(n, f)` | POST | `/api/method/frappe.desk.query_report.run` | Executes a specific Frappe report. |
| `fetchDashboardStats()` | GET | `/api/method/.../get_dashboard_stats` | Fetches core KPI data. |
| `fetchRenewals(p)` | GET | `/api/method/frappe.client.get_list` | Tracks upcoming item renewals. |

---

## System Utilities

Generic APIs for data management and system settings.

### Data Import & Files (`data-import.ts`, `location.ts`)
Handles bulk data imports and geographic data.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `uploadFile(f)` | POST | `/api/method/upload_file` | General file upload utility. |
| `startDataImport(n)` | POST | `/api/method/.../form_start_import` | Triggers a bulk data import. |
| `getCountries()` | POST | `/api/method/frappe.client.get_list` | Fetches list of all countries. |

---

## CRM & Recruitment

These APIs manage sales leads, deals, contacts, and recruitment processes.

### Leads API (`leads.ts`)
Manages sales leads and their lifecycle.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchLeads(p)` | GET | `/api/method/frappe.client.get_list` | Fetches a list of leads. |
| `createLead(d)` | POST | `/api/method/frappe.client.insert` | Registers a new lead. |
| `convertLead(n)` | POST | `/api/method/company.company.crm_api.convert_lead` | Converts a lead to Account/Contact. |

### Deals API (`deals.ts`)
Handles sales opportunities and deals.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchDeals(p)` | POST | `/api/method/.../get_deals_list` | Fetches deals with custom logic. |
| `createDeal(d)` | POST | `/api/method/frappe.client.insert` | Creates a new deal. |
| `getDeal(n)` | POST | `/api/method/.../get_deal_details` | Fetches full deal details. |

### Recruitment APIs (`interviews.ts`, `job-applicants.ts`, `job-openings.ts`)
Manages hiring processes.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchJobOpenings(p)` | GET | `/api/method/frappe.client.get_list` | Fetches active job openings. |
| `fetchJobApplicants(p)`| GET | `/api/method/frappe.client.get_list` | Fetches applicants for jobs. |
| `fetchInterviews(p)` | GET | `/api/method/frappe.client.get_list` | Fetches scheduled interviews. |

### CRM Expense Tracker API (`crm-expense-tracker.ts`)
Tracks expenses specifically associated with CRM activities.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchCRMExpenseTrackerStats(f)`| GET | `/api/method/.../get_crm_expense_tracker_stats` | Fetches CRM expense stats. |
| `fetchCRMExpenseTrackerList(p)`| GET | `/api/method/frappe.client.get_list` | Fetches CRM expense records. |

---

## Project & Task Management

These APIs handle timesheets, todos, meetings, events, and internal communications.

### Timesheets API (`timesheets.ts`)
Tracks employee working hours on projects.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchTimesheets(p)` | GET | `/api/method/frappe.client.get_list` | Fetches timesheet records. |
| `createTimesheet(d)` | POST | `/api/method/frappe.client.insert` | Creates a new timesheet. |
| `fetchProjects(p)` | GET | `/api/method/frappe.client.get_list` | Fetches list of projects. |

### Calendar & Meetings (`events.ts`, `meetings.ts`, `calls.ts`)
Manages schedules and appointments.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchEvents(s, e)` | GET | `/api/method/frappe.client.get_list` | Fetches calendar events. |
| `fetchMeetings(s, e)`| GET | `/api/method/frappe.client.get_list` | Fetches meeting records. |
| `fetchCalls(s, e)` | GET | `/api/method/frappe.client.get_list` | Fetches call logs. |

### Communication APIs (`announcements.ts`, `chat.ts`)
Handles internal announcements and real-time chat.

| Function | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `fetchAnnouncements(p)`| GET | `/api/method/frappe.client.get_list` | Fetches active announcements. |
| `chatApi.sendMessage(d)`| POST | `/api/method/clefincode_chat...` | Sends a chat message. |

---
