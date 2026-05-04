import dayjs from 'dayjs';
import { useState, useEffect, useRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { frappeRequest } from 'src/utils/csrf';
import { fNumber } from 'src/utils/format-number';

import { runReport } from 'src/api/reports';
import { getEmployee } from 'src/api/employees';
import { fetchDetailedSessions } from 'src/api/presence-log';
import { getHRSettings, fetchFrappeList } from 'src/api/hr-management';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  employeeId: string | null;
};

export function EmployeeReportDetailsDialog({ open, onClose, employeeId }: Props) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('details');

  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [records, setRecords] = useState<{
    timesheets: any[];
    leaves: any[];
    assets: any[];
    attendance: any[];
    salaries: any[];
    dailylogs: any[];
  }>({
    timesheets: [],
    leaves: [],
    assets: [],
    attendance: [],
    salaries: [],
    dailylogs: [],
  });

  const [hrSettings, setHRSettings] = useState<any>({
    default_currency: 'INR',
    currency_symbol: '₹',
    default_locale: 'en-IN'
  });

  const [stats, setStats] = useState({
    attendance: { total: 0, present: 0, absent: 0, leaves: 0, workingHours: 0 },
    timesheets: { total: 0, hours: 0, projects: 0, activities: 0 },
    leaves: { total: 0, approved: 0, pending: 0, rejected: 0 },
    assets: { total: 0, active: 0, returned: 0 },
    salaries: { total: 0, totalNet: 0 },
    dailylogs: { total: 0, totalHours: 0 }
  });

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []); const [leaveMeta, setLeaveMeta] = useState<any[]>([]);
  const [attMeta, setAttMeta] = useState<any[]>([]);

  useEffect(() => {
    import('src/api/hr-management').then(m => {
      // Fetch Leave Metadata
      m.getDocTypeMetadata('Leave Application').then(meta => {
        if (isMounted.current) {
          setLeaveMeta(meta.fields || []);
          console.log('Leave Application Metadata Fields:', (meta.fields || []).map((f: any) => f.fieldname));
        }
      }).catch(console.error);

      // Fetch Attendance Metadata
      m.getDocTypeMetadata('Attendance').then(meta => {
        if (isMounted.current) {
          setAttMeta(meta.fields || []);
          console.log('Attendance Metadata Fields:', (meta.fields || []).map((f: any) => f.fieldname));
        }
      }).catch(console.error);
    });
  }, []);

  const fetchData = useCallback(async () => {
    console.log('>>> [FETCH_DATA_START] Component State:', { employeeId, open });
    if (!employeeId) {
      console.warn('>>> [FETCH_DATA_ABORT] No Employee ID provided');
      return;
    }

    if (isMounted.current) setLoading(true);

    console.log('--- STARTING COMPREHENSIVE DATA FETCH ---');
    console.log('Employee ID (Prop):', employeeId);

    try {
      // Tab 1: Details
      const empData = await getEmployee(employeeId);
      console.log('Employee Object:', empData);
      if (isMounted.current) setEmployee(empData);

      // Try to determine the best ID to use for filters
      const filterId = empData?.name || employeeId;
      console.log('Using Filter ID:', filterId);

      // Construct Leave fields dynamically
      const leaveFields = ['name', 'employee', 'leave_type', 'from_date', 'to_date', 'total_days', 'docstatus', 'workflow_state'];

      // Construct Attendance fields dynamically
      const attFields = ['name', 'employee', 'attendance_date'];
      if (attMeta.length > 0) {
        const fieldnames = attMeta.map(f => f.fieldname);
        if (fieldnames.includes('status')) attFields.push('status');
        if (fieldnames.includes('working_hours_display')) attFields.push('working_hours_display');
        if (fieldnames.includes('in_time')) attFields.push('in_time');
        if (fieldnames.includes('out_time')) attFields.push('out_time');
      }

      // Parallel Fetch for all modules
      console.log('Executing Parallel Requests...');
      const [attendanceData, timesheetReport, leaves, assets, checkinsData, salariesData, dailylogsData] = await Promise.all([
        fetchFrappeList('Attendance', {
          page: 1,
          page_size: 1000,
          filters: [['employee', '=', filterId]],
          fields: attFields,
        }),
        runReport('Timesheet Report', { employee: filterId }),
        fetchFrappeList('Leave Application', {
          page: 1,
          page_size: 1000,
          filters: [['employee', '=', filterId]],
          fields: leaveFields,
        }),
        fetchFrappeList('Asset Assignment', {
          page: 1,
          page_size: 1000,
          filters: [['assigned_to', '=', filterId]],
          fields: ['name', 'asset_name', 'assigned_on', 'returned_on'],
        }),
        fetchFrappeList('Employee Checkin', {
          page: 1,
          page_size: 2000,
          filters: [['employee', '=', filterId]],
          fields: ['name', 'employee', 'time', 'log_type', 'attendance'],
        }).catch(() => ({ data: [], total: 0 })),
        fetchFrappeList('Salary Slip', {
          page: 1,
          page_size: 1000,
          filters: [['employee', '=', filterId]],
          fields: ['name', 'pay_period_start', 'pay_period_end', 'grand_gross_pay', 'grand_net_pay', 'docstatus'],
        }),
        fetchDetailedSessions(0, 1000, '', 'all', 'login_date_desc', filterId),
      ]);

      console.log('--- API RESPONSES ---');
      console.log('Attendance Records Count:', attendanceData.data.length);
      console.log('Timesheet Records Count (Result):', timesheetReport?.result?.length || 0);
      console.log('Leave Records Count (Initial):', leaves.data.length);
      console.log('Asset Records Count:', assets.data.length);

      // Deep fetch for Leave Applications to get restricted 'reason' fields
      let enrichedLeaves = leaves.data;
      if (leaves.data.length > 0) {
        console.log('--- STARTING DEEP FETCH FOR LEAVES ---', leaves.data.length, 'records');
        enrichedLeaves = await Promise.all(
          leaves.data.map(async (l: any) => {
            console.log('FETCHING FULL LEAVE:', l.name);
            try {
              const url = `/api/method/frappe.client.get?doctype=Leave Application&name=${encodeURIComponent(l.name)}`;
              console.log('Deep Fetch URL:', url);
              const res = await frappeRequest(url);
              if (res.ok) {
                const doc = (await res.json()).message;
                console.log('FULL LEAVE DOC:', doc);
                return {
                  ...l,
                  ...doc,
                  mappedStatus: doc.workflow_state || l.workflow_state || "-",
                  mappedReason: doc.reson || l.reason || "-"
                };
              } else {
                console.error('Deep Fetch Failed for:', l.name, 'Status:', res.status);
              }
            } catch (e) {
              console.error('Deep Fetch Error for:', l.name, e);
            }
            return l;
          })
        );
        console.log('Leave Records After Deep Fetch:', enrichedLeaves.length);
      }

      const tsData = (timesheetReport?.result || [])
        .filter((t: any) => t.timesheet_date && t.timesheet_date !== 'TOTAL')
        .sort((a: any, b: any) => (b.timesheet_date || '').localeCompare(a.timesheet_date || ''));

      if (isMounted.current) {
        const enrichedAttendance = attendanceData.data.map((att: any) => {
          const attCheckins = (checkinsData?.data || []).filter((c: any) => c.attendance === att.name || (c.employee === att.employee && dayjs(c.time).format('YYYY-MM-DD') === att.attendance_date));
          const inCheckins = attCheckins.filter((c: any) => c.log_type === 'IN').sort((a: any, b: any) => dayjs(a.time).diff(dayjs(b.time)));
          const outCheckins = attCheckins.filter((c: any) => c.log_type === 'OUT').sort((a: any, b: any) => dayjs(a.time).diff(dayjs(b.time)));

          return {
            ...att,
            in_time: att.in_time || (inCheckins.length > 0 ? inCheckins[0].time : '-'),
            out_time: att.out_time || (outCheckins.length > 0 ? outCheckins[outCheckins.length - 1].time : '-'),
            working_hours_display: att.working_hours_display || '-',
          };
        });

        setRecords({
          timesheets: tsData,
          leaves: enrichedLeaves,
          assets: assets.data,
          attendance: enrichedAttendance,
          salaries: salariesData.data,
          dailylogs: dailylogsData.data || [],
        });

        // Calculate Stats
        const attStats = {
          total: attendanceData.data.length,
          present: attendanceData.data.filter((a: any) => a.status === 'Present').length,
          absent: attendanceData.data.filter((a: any) => a.status === 'Absent').length,
          leaves: attendanceData.data.filter((a: any) => ['On Leave', 'Half Day'].includes(a.status)).length,
          workingHours: attendanceData.data.reduce((acc: number, cur: any) => acc + (parseFloat(cur.working_hours_display?.split(':')[0] || '0') + (parseFloat(cur.working_hours_display?.split(':')[1] || '0') / 60)), 0)
        };

        const tsStats = {
          total: tsData.length,
          hours: tsData.reduce((acc: number, cur: any) => acc + (parseFloat(cur.hours) || 0), 0),
          projects: new Set(tsData.map((t: any) => t.project).filter(Boolean)).size,
          activities: tsData.length
        };

        const leaveStats = {
          total: enrichedLeaves.length,
          approved: enrichedLeaves.filter((l: any) => l.mappedStatus === 'Approved' || l.docstatus === 1).length,
          pending: enrichedLeaves.filter((l: any) => l.mappedStatus === 'Pending' || (l.mappedStatus !== 'Rejected' && l.docstatus === 0)).length,
          rejected: enrichedLeaves.filter((l: any) => l.mappedStatus === 'Rejected' || l.docstatus === 2).length
        };

        const assetStats = {
          total: assets.data.length,
          active: assets.data.filter((ass: any) => !ass.returned_on).length,
          returned: assets.data.filter((ass: any) => ass.returned_on).length
        };

        const salaryStats = {
          total: salariesData.data.length,
          totalNet: salariesData.data.reduce((acc: number, cur: any) => acc + (parseFloat(cur.grand_net_pay) || 0), 0)
        };

        const dailyLogStats = {
          total: (dailylogsData.data || []).length,
          totalHours: (dailylogsData.data || []).reduce((acc: number, cur: any) => acc + (parseFloat(cur.total_work_hours) || 0), 0)
        };

        setStats({
          attendance: attStats,
          timesheets: tsStats,
          leaves: leaveStats,
          assets: assetStats,
          salaries: salaryStats,
          dailylogs: dailyLogStats
        });

        console.log('--- STATS SUMMARY ---', { attendance: attStats, timesheets: tsStats, leaves: leaveStats, assets: assetStats });
      }

    } catch (error) {
      console.error('Failed to fetch employee report details:', error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [employeeId, attMeta, leaveMeta]);

  useEffect(() => {
    getHRSettings().then(res => {
      if (isMounted.current) setHRSettings(res);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (open && employeeId) {
      fetchData();
    } else {
      if (isMounted.current) {
        setEmployee(null);
        setCurrentTab('details');
      }
    }
  }, [open, employeeId, fetchData]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '90vw',
          maxWidth: '1200px',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle component="div" sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
        <Typography variant="h6">Employee Overall Report - {employee?.employee_name || 'Loading...'}</Typography>
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          px: 3,
          bgcolor: 'background.neutral',
          borderBottom: (t: any) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Tab label="Employee Details" value="details" />
        <Tab label="Attendance" value="attendance" />
        <Tab label="Daily Log" value="dailylog" />
        <Tab label="Timesheets" value="timesheets" />
        <Tab label="Leave Applications" value="leaves" />
        <Tab label="Assigned Assets" value="assets" />
        <Tab label="Salary Slips" value="salaries" />
      </Tabs>

      <DialogContent sx={{ p: 3, minHeight: 400 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {currentTab === 'details' && employee && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {/* Header Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    src={employee.profile_picture || ''}
                    alt={employee.employee_name}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      fontSize: 40,
                      fontWeight: 'bold',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      border: (t: any) => `4px solid ${t.palette.background.paper}`,
                      boxShadow: (t: any) => t.customShadows?.z8,
                    }}
                  >
                    {employee.employee_name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{employee.employee_name}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{employee.designation} at {employee.department}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Label variant="soft" color={employee.status === 'Active' ? 'success' : 'error'}>{employee.status}</Label>
                      <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.disabled', fontWeight: 700 }}>
                        ID: {employee.name}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Contact Information */}
                <Box>
                  <SectionHeader title="Contact Information" icon="solar:phone-calling-bold" />
                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                    <ProfileDetailItem label="Official Email" value={employee.email} icon="solar:letter-bold" />
                    <ProfileDetailItem label="Personal Email" value={employee.personal_email} icon="solar:letter-bold" />
                    <ProfileDetailItem label="Personal Phone" value={employee.phone} icon="solar:phone-bold" />
                    <ProfileDetailItem label="Office Phone" value={employee.office_phone_number} icon="solar:phone-bold" />
                    <ProfileDetailItem label="User Login" value={employee.user} icon="solar:user-bold" />
                  </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Employment Details */}
                <Box>
                  <SectionHeader title="Employment Details" icon="solar:case-bold" />
                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                    <ProfileDetailItem label="Department" value={employee.department} icon="solar:buildings-bold" />
                    <ProfileDetailItem label="Designation" value={employee.designation} icon="solar:medal-star-bold" />
                    <ProfileDetailItem label="Joining Date" value={fDate(employee.date_of_joining, 'DD-MM-YYYY')} icon="solar:calendar-bold" />
                    <ProfileDetailItem label="Status" value={employee.status} icon="solar:info-circle-bold" />
                    <ProfileDetailItem label="Date of Birth" value={fDate(employee.dob, 'DD-MM-YYYY')} icon="solar:calendar-bold" />
                    <ProfileDetailItem label="Employment Type" value={employee.employment_type} icon="solar:case-bold" />
                  </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Location Details */}
                <Box>
                  <SectionHeader title="Location Details" icon="solar:earth-bold" />
                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                    <ProfileDetailItem label="Country" value={employee.country} icon="solar:earth-bold" />
                    <ProfileDetailItem label="State" value={employee.state} icon="solar:map-point-bold" />
                    <ProfileDetailItem label="City" value={employee.city} icon="solar:map-point-bold" />
                    <ProfileDetailItem label="Permanent Address" value={employee.permanent_address} icon="solar:home-bold" />
                    <ProfileDetailItem label="Current Address" value={employee.current_address} icon="solar:home-bold" />
                  </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Bank & Identification */}
                <Box>
                  <SectionHeader title="Bank & Identification" icon="solar:card-bold" />
                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                    <ProfileDetailItem label="Bank Name" value={employee.bank_name} icon="solar:buildings-bold" />
                    <ProfileDetailItem label="Bank Account" value={employee.bank_account} icon="solar:card-bold" />
                    <ProfileDetailItem label="PF Number" value={employee.pf_number} icon="solar:document-bold" />
                    <ProfileDetailItem label="ESI No" value={employee.esi_no} icon="solar:health-bold" />
                  </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Financial Summary */}
                <Box>
                  <SectionHeader title="Financial Summary" icon="solar:wallet-money-bold" />

                  {/* CTC Card */}
                  <Box sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: (t: any) => t.palette.mode === 'light' ? 'grey.50' : 'grey.900', border: (t: any) => `1px solid ${t.palette.divider}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Iconify icon={"solar:dollar-minimalistic-bold" as any} width={20} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Cost to Company (Monthly)</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                      <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mr: 1, fontSize: '0.8em' }}>{hrSettings.currency_symbol}</Box>
                      {employee.ctc ? fNumber(parseFloat(employee.ctc), { locale: hrSettings.default_locale }) : '-'}
                    </Typography>
                  </Box>

                  {/* Earnings & Deductions Grid */}
                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
                    <Box sx={{ p: 3, borderRadius: 2, bgcolor: (t: any) => t.palette.mode === 'light' ? 'success.lighter' : 'grey.900', border: (t: any) => `1px solid ${t.palette.success.light}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'success.main', color: 'white' }}>
                          <Iconify icon={"solar:chart-2-bold" as any} width={18} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.darker' }}>Earnings</Typography>
                      </Box>
                      <Stack spacing={1.5}>
                        {(employee.earnings || []).map((item: any, idx: number) => (
                          <SalaryItem key={idx} label={item.component_name} value={item.amount} hrSettings={hrSettings} />
                        ))}
                        {(!employee.earnings || employee.earnings.length === 0) && (
                          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>No earnings defined</Typography>
                        )}
                      </Stack>
                    </Box>

                    <Box sx={{ p: 3, borderRadius: 2, bgcolor: (t: any) => t.palette.mode === 'light' ? 'warning.lighter' : 'grey.900', border: (t: any) => `1px solid ${t.palette.warning.light}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'warning.main', color: 'white' }}>
                          <Iconify icon={"solar:chart-square-bold" as any} width={18} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'warning.darker' }}>Deductions</Typography>
                      </Box>
                      <Stack spacing={1.5}>
                        {(employee.deductions || []).map((item: any, idx: number) => (
                          <SalaryItem key={idx} label={item.component_name} value={item.amount} hrSettings={hrSettings} />
                        ))}
                        {(!employee.deductions || employee.deductions.length === 0) && (
                          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>No deductions defined</Typography>
                        )}
                      </Stack>
                    </Box>
                  </Box>

                  {/* Net Salary Summary */}
                  <Box sx={{ p: 3, borderRadius: 2, bgcolor: (t: any) => alpha(t.palette.primary.main, 0.05), border: (t: any) => `1px dashed ${alpha(t.palette.primary.main, 0.3)}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Net Salary (Monthly)</Typography>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                          <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mr: 1, fontSize: '0.8em' }}>{hrSettings.currency_symbol}</Box>
                          {fNumber(employee.net_salary || 0, { locale: hrSettings.default_locale })}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={4}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Earnings</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main', display: 'flex', alignItems: 'center' }}>
                            + <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mx: 0.5 }}>{hrSettings.currency_symbol}</Box>
                            {fNumber(employee.total_earnings || 0, { locale: hrSettings.default_locale })}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Deductions</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main', display: 'flex', alignItems: 'center' }}>
                            - <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mx: 0.5 }}>{hrSettings.currency_symbol}</Box>
                            {fNumber(employee.total_deductions || 0, { locale: hrSettings.default_locale })}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            )}

            {currentTab === 'attendance' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' } }}>
                    <SummaryCard label="Total Days" value={stats.attendance.total} icon="solar:calendar-bold" color="info" />
                    <SummaryCard label="Present" value={stats.attendance.present} icon="solar:check-circle-bold" color="success" />
                    <SummaryCard label="Absent" value={stats.attendance.absent} icon="solar:close-circle-bold" color="error" />
                    <SummaryCard label="Leaves" value={stats.attendance.leaves} icon="solar:palm-tree-bold" color="warning" />
                    <SummaryCard label="Working Hours" value={`${stats.attendance.workingHours.toFixed(1)}h`} icon="solar:stopwatch-bold" color="secondary" />
                  </Box>

                <Card sx={{ p: 2, border: (t: any) => `1px solid ${t.palette.divider}`, boxShadow: 'none' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Attendance Records</Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: 'background.neutral' }}>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>In Time</TableCell>
                          <TableCell>Out Time</TableCell>
                          <TableCell>Working Hours</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.attendance.length > 0 ? (
                          records.attendance.map((att: any) => (
                            <TableRow key={att.name}>
                              <TableCell>{fDate(att.attendance_date)}</TableCell>
                              <TableCell>
                                <Label color={(att.status === 'Present' && 'success') || (att.status === 'Absent' && 'error') || 'warning'}>
                                  {att.status}
                                </Label>
                              </TableCell>
                              <TableCell>{att.in_time || '-'}</TableCell>
                              <TableCell>{att.out_time || '-'}</TableCell>
                              <TableCell>{att.working_hours_display || '-'}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3 }}>No attendance records found</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Box>
            )}

            {currentTab === 'timesheets' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
                  <SummaryCard label="Total Entries" value={stats.timesheets.total} icon="solar:notes-bold" color="info" />
                  <SummaryCard label="Total Hours" value={`${stats.timesheets.hours.toFixed(1)}h`} icon="solar:clock-circle-bold" color="success" />
                  <SummaryCard label="Projects" value={stats.timesheets.projects} icon="solar:case-bold" color="warning" />
                  <SummaryCard label="Activities" value={stats.timesheets.activities} icon="solar:running-bold" color="secondary" />
                </Box>

                <Card sx={{ p: 2, border: (t: any) => `1px solid ${t.palette.divider}`, boxShadow: 'none' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Timesheets</Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: 'background.neutral' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Activity Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.timesheets.length > 0 ? (
                          records.timesheets.map((ts: any, index: number) => {
                            const showDate = index === 0 || fDate(ts.timesheet_date) !== fDate(records.timesheets[index - 1].timesheet_date);
                            return (
                              <TableRow key={index}>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {showDate ? fDate(ts.timesheet_date) : ''}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{ts.project || '-'}</TableCell>
                                <TableCell>{ts.activity_type || '-'}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>{ts.hours} hrs</TableCell>
                                <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ts.description || '-'}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No timesheets found</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Box>
            )}

            {currentTab === 'leaves' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
                  <SummaryCard label="Total Leaves" value={stats.leaves.total} icon="solar:palm-tree-bold" color="info" />
                  <SummaryCard label="Approved" value={stats.leaves.approved} icon="solar:check-circle-bold" color="success" />
                  <SummaryCard label="Pending" value={stats.leaves.pending} icon="solar:clock-circle-bold" color="warning" />
                  <SummaryCard label="Rejected" value={stats.leaves.rejected} icon="solar:close-circle-bold" color="error" />
                </Box>

                <Card sx={{ p: 2, border: (t: any) => `1px solid ${t.palette.divider}`, boxShadow: 'none' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Leave Applications</Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: 'background.neutral' }}>
                        <TableRow>
                          <TableCell>Leave Type</TableCell>
                          <TableCell>From Date</TableCell>
                          <TableCell>To Date</TableCell>
                          <TableCell>Total Days</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Reason</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.leaves.length > 0 ? (
                          records.leaves.map((l: any) => {
                            console.log('TABLE LEAVE ROW:', l);

                            const totalDays = l.total_days || l.total_leave_days || (l.from_date && l.to_date ? dayjs(l.to_date).diff(dayjs(l.from_date), 'day') + 1 : 0);
                            const status = l.mappedStatus || '-';
                            const reason = l.mappedReason || '-';

                            return (
                              <TableRow key={l.name}>
                                <TableCell>{l.leave_type}</TableCell>
                                <TableCell>{fDate(l.from_date)}</TableCell>
                                <TableCell>{fDate(l.to_date)}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{totalDays}</TableCell>
                                <TableCell>
                                  <Label
                                    variant="soft"
                                    color={(status === 'Approved' && 'success') || (status === 'Rejected' && 'error') || (['Pending', 'Open'].includes(status) && 'warning') || 'default'}
                                  >
                                    {status}
                                  </Label>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {reason}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>No leave applications found</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Box>
            )}

            {currentTab === 'assets' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                  <SummaryCard label="Total Assets" value={stats.assets.total} icon="solar:box-bold" color="info" />
                  <SummaryCard label="Active Assets" value={stats.assets.active} icon="solar:check-circle-bold" color="success" />
                  <SummaryCard label="Returned Assets" value={stats.assets.returned} icon="solar:backspace-bold" color="warning" />
                </Box>

                <Card sx={{ p: 2, border: (t: any) => `1px solid ${t.palette.divider}`, boxShadow: 'none' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Assigned Assets</Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: 'background.neutral' }}>
                        <TableRow>
                          <TableCell>Asset Name</TableCell>
                          <TableCell>Asset Category</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Assigned On</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.assets.length > 0 ? (
                          records.assets.map((a: any) => (
                            <TableRow key={a.name}>
                              <TableCell>{a.asset_name}</TableCell>
                              <TableCell>{a.asset_category || '-'}</TableCell>
                              <TableCell>{a.serial_no || '-'}</TableCell>
                              <TableCell>{fDate(a.assigned_on)}</TableCell>
                              <TableCell><Label color={a.returned_on ? 'warning' : 'info'}>{a.returned_on ? 'Returned' : 'Active'}</Label></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No assets assigned</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Box>
            )}

            {currentTab === 'salaries' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' } }}>
                  <SummaryCard label="Total Slips" value={stats.salaries.total} icon="solar:file-text-bold" color="info" />
                  <SummaryCard 
                    label="Total Net Paid" 
                    value={`${hrSettings.currency_symbol}${fNumber(stats.salaries.totalNet, { locale: hrSettings.default_locale })}`} 
                    icon="solar:wallet-money-bold" 
                    color="success" 
                  />
                </Box>

                <Card sx={{ p: 2, border: (t: any) => `1px solid ${t.palette.divider}`, boxShadow: 'none' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Salary Slips History</Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: 'background.neutral' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Slip ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Gross Pay</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Net Pay</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.salaries.length > 0 ? (
                          records.salaries.map((s: any) => (
                            <TableRow key={s.name}>
                              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{s.name}</TableCell>
                              <TableCell>{fDate(s.pay_period_start)} - {fDate(s.pay_period_end)}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{hrSettings.currency_symbol}{fNumber(s.grand_gross_pay, { locale: hrSettings.default_locale })}</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: 'success.main' }}>{hrSettings.currency_symbol}{fNumber(s.grand_net_pay, { locale: hrSettings.default_locale })}</TableCell>
                              <TableCell>
                                <Label color={s.docstatus === 1 ? 'success' : 'warning'}>
                                  {s.docstatus === 1 ? 'Submitted' : 'Draft'}
                                </Label>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No salary slips found</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Box>
            )}

            {currentTab === 'dailylog' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' } }}>
                  <SummaryCard label="Total Logs" value={stats.dailylogs.total} icon="solar:clipboard-list-bold" color="info" />
                  <SummaryCard label="Total Work Hours" value={`${stats.dailylogs.totalHours.toFixed(1)}h`} icon="solar:clock-circle-bold" color="warning" />
                </Box>

                <Card sx={{ p: 2, border: (t: any) => `1px solid ${t.palette.divider}`, boxShadow: 'none' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Daily Activity Logs</Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: 'background.neutral' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Login</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Logout</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Work Hours</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Break Hours</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.dailylogs.length > 0 ? (
                          records.dailylogs.map((log: any) => (
                            <TableRow key={log.name}>
                              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{fDate(log.login_date)}</TableCell>
                              <TableCell>{log.login_time ? dayjs(log.login_time).format('HH:mm:ss') : '--:--'}</TableCell>
                              <TableCell>{log.logout_time ? dayjs(log.logout_time).format('HH:mm:ss') : '--:--'}</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{log.total_work_hours?.toFixed(2) || '0.00'}h</TableCell>
                              <TableCell>{log.total_break_hours?.toFixed(2) || '0.00'}h</TableCell>
                              <TableCell>
                                <Label color={log.status === 'Active' ? 'success' : 'error'} variant="soft">
                                  {log.status}
                                </Label>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>No daily logs found</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({ title, icon, noMargin = false }: { title: string; icon: string, noMargin?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: noMargin ? 0 : 2.5 }}>
      <Iconify icon={icon as any} width={20} sx={{ color: 'primary.main' }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Typography>
    </Box>
  );
}

function ProfileDetailItem({ label, value, icon, color = 'text.primary' }: { label: string; value?: string | null; icon: string; color?: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon={icon as any} width={16} sx={{ color: 'text.disabled' }} />
        <Typography variant="body2" sx={{ fontWeight: 700, color }}>
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );
}

function SalaryItem({ label, value, hrSettings }: { label: string; value?: string | number | null, hrSettings: any }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mr: 0.5, fontSize: '0.9em', color: 'text.primary' }}>{hrSettings.currency_symbol}</Box>
        {value ? fNumber(parseFloat(value.toString()), { locale: hrSettings.default_locale }) : '-'}
      </Typography>
    </Box>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const theme = useTheme();
  const mainColor = (theme.palette as any)[color]?.main || theme.palette.primary.main;

  return (
    <Card sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      boxShadow: 'none',
      border: `1px solid ${alpha(mainColor, 0.2)}`,
      bgcolor: alpha(mainColor, 0.05)
    }}>
      <Box sx={{
        width: 48,
        height: 48,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: mainColor,
        color: 'white'
      }}>
        <Iconify icon={icon as any} width={24} />
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</Typography>
      </Box>
    </Card>
  );
}
