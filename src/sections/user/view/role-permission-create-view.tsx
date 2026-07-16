import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { IoMdArrowBack } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { alpha, styled } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

// Android 12 Switch Style
const Android12Switch = styled(Switch)(({ theme }) => ({
    width: 40,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 4,
        transitionDuration: '200ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.primary.main,
                opacity: 1,
                border: 0,
            },
            '& .MuiSwitch-thumb': {
                backgroundColor: '#fff',
                width: 16,
                height: 16,
            },
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.5,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 16,
        height: 16,
        backgroundColor: '#fff',
        boxShadow: 'none',
    },
    '& .MuiSwitch-track': {
        borderRadius: 24 / 2,
        backgroundColor: '#cbd5e1',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 200,
        }),
    },
}));


import { DashboardContent } from 'src/layouts/dashboard';
import { createRolePermission, type PermissionAccess } from 'src/api/permission-management';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

interface RolePermissionCreateViewProps {
    onBack?: () => void;
}

export function RolePermissionCreateView({ onBack }: RolePermissionCreateViewProps = {}) {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [frontendRoleName, setFrontendRoleName] = useState('');
    const [backendMasterRole, setBackendMasterRole] = useState('');
    const [status, setStatus] = useState<'Enabled' | 'Disabled'>('Enabled');
    const [permissions, setPermissions] = useState<PermissionAccess[]>([]);

    const [frontendRoleNameError, setFrontendRoleNameError] = useState(false);
    const [backendMasterRoleError, setBackendMasterRoleError] = useState(false);

    const handleMasterRoleChange = (newRole: string) => {
        setBackendMasterRole(newRole);
        setFormError(null);

        const modulesList: { module: string; screen: string }[] = [];
        if (newRole === 'HR') {
            modulesList.push(
                { module: "dashboard", screen: "HR Dashboard" },
                { module: "task_manager", screen: "Task Manager" },
                { module: "employee", screen: "Employee List" },
                { module: "employee", screen: "Users List" },
                { module: "attendance", screen: "Attendance List" },
                { module: "attendance", screen: "Daily Log" },
                { module: "attendance", screen: "WFH Attendance" },
                { module: "leaves", screen: "Leave Application" },
                { module: "leaves", screen: "Leave Allocate" },
                { module: "requests", screen: "Request List" },
                { module: "timesheets", screen: "Timesheets" },
                { module: "salary_slips", screen: "Salary Slips" },
                { module: "holidays", screen: "Holidays List" },
                { module: "announcements", screen: "Announcements" },
                { module: "asset", screen: "Asset List" },
                { module: "asset", screen: "Asset Assignments" },
                { module: "asset", screen: "Asset Requests" },
                { module: "expenses", screen: "Company Expenses" },
                { module: "expenses", screen: "Reimbursement Claim List" },
                { module: "employee_performance", screen: "Employee Evaluation" },
                { module: "employee_performance", screen: "Badges" },
                { module: "employee_performance", screen: "Employee Monthly Award" },
                { module: "recruitment", screen: "Job Opening List" },
                { module: "recruitment", screen: "Job Applicant List" },
                { module: "recruitment", screen: "Interview List" },
                { module: "recruitment", screen: "Employee Referral List" },
                { module: "reports", screen: "Attendance Report" },
                { module: "reports", screen: "Daily Log Report" },
                { module: "reports", screen: "Task Report" },
                { module: "reports", screen: "Timesheet Report" },
                { module: "reports", screen: "Leave Allocation Report" },
                { module: "reports", screen: "Employee Overall Report" },
                { module: "reports", screen: "Salary Slip Report" },
                { module: "masters", screen: "Department" },
                { module: "masters", screen: "Project" },
                { module: "masters", screen: "Activity Type" },
                { module: "masters", screen: "Claim Type" },
                { module: "masters", screen: "Bank Account" },
                { module: "masters", screen: "Asset Category" },
                { module: "masters", screen: "Criteria Category" },
                { module: "masters", screen: "Designation" },
                { module: "masters", screen: "Salary Component" },
                { module: "masters", screen: "Leave Type" },
                { module: "reminders", screen: "Reminders" }
            );
        } else if (newRole === 'Employee') {
            modulesList.push(
                { module: "dashboard", screen: "Employee Dashboard" },
                { module: "profile", screen: "My Profile" },
                { module: "tasks", screen: "My Tasks" },
                { module: "attendance", screen: "My Attendance" },
                { module: "daily_log", screen: "My Daily Log" },
                { module: "leaves", screen: "My Leave Application" },
                { module: "requests", screen: "My Request List" },
                { module: "timesheets", screen: "My Timesheet" },
                { module: "wfh_attendance", screen: "My WFH Attendance" },
                { module: "salary_slips", screen: "My Salary Slip" },
                { module: "reimbursement_claims", screen: "My Reimbursement Claim" },
                { module: "asset", screen: "My Asset List" },
                { module: "asset", screen: "My Asset Requests" },
                { module: "recruitment", screen: "Refer a Friend" },
                { module: "reports", screen: "My Attendance Report" },
                { module: "reports", screen: "My Daily Log Report" },
                { module: "reports", screen: "My Timesheet Report" }
            );
        } else if (['CRM And Sales', 'Sales', 'CRM User'].includes(newRole)) {
            modulesList.push(
                { module: "dashboard", screen: "Dashboard" },
                { module: "lead", screen: "Leads" },
                { module: "contact", screen: "Clients" },
                { module: "account", screen: "Company" },
                { module: "proposal", screen: "Proposal" },
                { module: "deal", screen: "Prospects" },
                { module: "purchase", screen: "Purchases" },
                { module: "expenses", screen: "Expense Tracker" },
                { module: "events", screen: "Calendar" },
                { module: "mail_automation", screen: "Email Templates" },
                { module: "mail_automation", screen: "Email Campaigns" },
                { module: "mail_automation", screen: "Email Automations" },
                { module: "mail_automation", screen: "Email Settings" },
                { module: "whatsapp_automation", screen: "WhatsApp Templates" },
                { module: "whatsapp_automation", screen: "WhatsApp Campaigns" },
                { module: "whatsapp_automation", screen: "WhatsApp Automation" },
                { module: "whatsapp_automation", screen: "WhatsApp Settings" },
                { module: "lead_integration", screen: "Meta Apps" },
                { module: "lead_integration", screen: "Meta Pages" },
                { module: "lead_integration", screen: "Meta Forms" },
                { module: "lead_integration", screen: "Meta Leads" },
                { module: "lead_integration", screen: "Webhook Logs" },
                { module: "lead_integration", screen: "Meta Queue" },
                { module: "masters", screen: "Lead From" },
                { module: "masters", screen: "Service" },
                { module: "masters", screen: "Item" },
                { module: "masters", screen: "Payment Terms" },
                { module: "masters", screen: "Payment Type" },
                { module: "masters", screen: "Tax Types" },
                { module: "masters", screen: "Company Bank Account" },
                { module: "masters", screen: "Email Template Category" },
                { module: "masters", screen: "WhatsApp Template Category" },
                { module: "reports", screen: "Lead Report" },
                { module: "reports", screen: "Clients Report" },
                { module: "reports", screen: "Company Report" },
                { module: "reports", screen: "Calls Report" },
                { module: "reports", screen: "Meeting Report" },
                { module: "reports", screen: "Proposal Report" },
                { module: "reports", screen: "Prospects Report" },
                { module: "reports", screen: "Estimation Report" },
                { module: "reports", screen: "Invoice Report" },
                { module: "reports", screen: "Purchase Report" },
                { module: "reports", screen: "Invoice Collection Summary" },
                { module: "reports", screen: "Purchase Settlement Report" }
            );
        }

        const generated: PermissionAccess[] = modulesList.map((m) => ({
            module_id: m.module,
            screen_id: m.screen,
            add_permission: 0,
            edit_permission: 0,
            view_permission: m.screen === 'Dashboard' || m.screen.includes('Dashboard') ? 1 : 0,
            delete_permission: 0,
            export_permission: 0,
            import_permission: 0,
        }));
        setPermissions(generated);
    };

    const togglePermission = (idx: number, field: keyof PermissionAccess) => {
        const updated = [...permissions];
        const val = updated[idx][field] as number;
        const newVal = val ? 0 : 1;
        updated[idx] = {
            ...updated[idx],
            [field]: newVal
        };

        if (field !== 'view_permission' && newVal === 1) {
            updated[idx]['view_permission'] = 1;
        }

        setPermissions(updated);
    };

    const getRowSpan = (rows: PermissionAccess[], index: number) => {
        const currentModule = rows[index].module_id;
        if (index > 0 && rows[index - 1].module_id === currentModule) {
            return 0;
        }
        let span = 1;
        for (let i = index + 1; i < rows.length; i++) {
            if (rows[i].module_id === currentModule) {
                span++;
            } else {
                break;
            }
        }
        return span;
    };

    const getFriendlyModuleName = (module: string) =>
        module.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const handleSave = async () => {
        let hasError = false;
        if (!frontendRoleName.trim()) {
            setFrontendRoleNameError(true);
            hasError = true;
        }
        if (!backendMasterRole) {
            setBackendMasterRoleError(true);
            hasError = true;
        }
        if (hasError) {
            enqueueSnackbar('Please fill all required fields', { variant: 'error' });
            return;
        }
        setSaving(true);
        setFormError(null);
        try {
            const payload = {
                frontend_role_name: frontendRoleName,
                backend_master_role: backendMasterRole,
                status,
                permissions,
            };
            await createRolePermission(payload);
            enqueueSnackbar('Role permission created successfully', { variant: 'success' });
            if (onBack) {
                onBack();
            } else {
                router.push('/users?subtab=role_permissions');
            }
        } catch (err: any) {
            setFormError(err.message || 'Failed to save configuration.');
        } finally {
            setSaving(false);
        }
    };

    const handleGoBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.push('/users?subtab=role_permissions');
        }
    };

    const renderToggleCell = (row: PermissionAccess, idx: number, key: keyof PermissionAccess) => {
        const value = row[key];
        return (
            <TableCell align="center" sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                <Android12Switch
                    checked={!!value}
                    onChange={() => togglePermission(idx, key)}
                />
            </TableCell>
        );
    };

    return (
        <DashboardContent maxWidth="xl">
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Typography variant="h4">New Role Permission</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleGoBack}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                                borderColor: 'text.primary',
                            }
                        }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            borderRadius: 1.5,
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2.5,
                            '&:hover': { bgcolor: '#068fb3' }
                        }}
                    >
                        {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Role Permission'}
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ p: 3 }}>
                {formError && <Alert severity="error" sx={{ mb: 3 }}>{formError}</Alert>}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
                    <TextField
                        required
                        fullWidth
                        label="Frontend Role Name"
                        value={frontendRoleName}
                        error={frontendRoleNameError}
                        helperText={frontendRoleNameError ? 'Frontend Role Name is required' : ''}
                        onChange={(e) => {
                            setFrontendRoleName(e.target.value);
                            if (frontendRoleNameError) setFrontendRoleNameError(false);
                        }}
                    />

                    <FormControl fullWidth required error={backendMasterRoleError}>
                        <InputLabel id="backend-master-role-select-label">Backend Master Role</InputLabel>
                        <Select
                            labelId="backend-master-role-select-label"
                            label="Backend Master Role"
                            value={backendMasterRole}
                            onChange={(e) => {
                                handleMasterRoleChange(e.target.value);
                                if (backendMasterRoleError) setBackendMasterRoleError(false);
                            }}
                        >
                            <MenuItem value="HR">HR</MenuItem>
                            <MenuItem value="Employee">Employee</MenuItem>
                            <MenuItem value="CRM And Sales">CRM And Sales</MenuItem>
                        </Select>
                        {backendMasterRoleError && (
                            <FormHelperText>Please select a backend master role</FormHelperText>
                        )}
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="status-select-label">Status</InputLabel>
                        <Select
                            labelId="status-select-label"
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                        >
                            <MenuItem value="Enabled">Enabled</MenuItem>
                            <MenuItem value="Disabled">Disabled</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <TableContainer sx={{ border: '1px solid rgba(224, 224, 224, 1)', borderRadius: 2 }}>
                    <Scrollbar>
                        <Table size="medium">
                            <TableRow sx={{ bgcolor: '#08a3cd' }}>
                                <TableCell sx={{ fontWeight: 800, color: 'common.white', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Menu Name</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'common.white', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Access Name</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: 'common.white', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Add</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: 'common.white', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Edit</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: 'common.white', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>View</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: 'common.white', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Delete</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: 'common.white', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Export</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: 'common.white', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Import</TableCell>
                            </TableRow>

                            <TableBody>
                                {permissions.length > 0 ? (
                                    permissions.map((row, idx) => {
                                        const span = getRowSpan(permissions, idx);
                                        return (
                                            <TableRow key={idx} hover sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                                {span > 0 && (
                                                    <TableCell
                                                        rowSpan={span}
                                                        sx={{
                                                            verticalAlign: 'middle',
                                                            borderRight: '1px solid rgba(224, 224, 224, 1)',
                                                            fontWeight: 'bold',
                                                            color: 'text.primary',
                                                            bgcolor: 'rgba(244, 246, 248, 0.4)'
                                                        }}
                                                    >
                                                        {getFriendlyModuleName(row.module_id)}
                                                    </TableCell>
                                                )}
                                                <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    {row.screen_id}
                                                </TableCell>
                                                {renderToggleCell(row, idx, 'add_permission')}
                                                {renderToggleCell(row, idx, 'edit_permission')}
                                                {renderToggleCell(row, idx, 'view_permission')}
                                                {renderToggleCell(row, idx, 'delete_permission')}
                                                {renderToggleCell(row, idx, 'export_permission')}
                                                {renderToggleCell(row, idx, 'import_permission')}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                            <EmptyContent
                                                title="Select Backend Master Role to load the fields."
                                                icon="solar:video-library-bold-duotone"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </TableContainer>
            </Card>
        </DashboardContent>
    );
}
