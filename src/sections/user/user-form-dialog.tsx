import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { frappeRequest } from 'src/utils/csrf';

import { getRoles, getModules } from 'src/api/users';
import { fetchUserPermissions, createUserPermission, deleteUserPermission, getDocTypes } from 'src/api/user-permissions';

import { Iconify } from 'src/components/iconify';

import { UserPermissionFormDialog } from '../user-permission/user-permission-form-dialog';

// Android 12 Switch Style
const Android12Switch = styled(Switch)(({ theme }) => ({
    width: 36,
    height: 20,
    padding: 0,
    marginRight: 10,
    marginLeft: 20,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 3,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.primary.main,
                opacity: 1,
                border: 0,
            },
            '& .MuiSwitch-thumb': {
                backgroundColor: theme.palette.primary.contrastText,
                width: 14,
                height: 14,
            },
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.5,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 14,
        height: 14,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600],
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
    },
    '& .MuiSwitch-track': {
        borderRadius: 20 / 2,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 300,
        }),
    },
}));

// Android 12 Button Style
const Android12Button = styled(Button)(({ theme }) => ({
    borderRadius: 20,
    textTransform: 'none',
    fontWeight: 500,
    padding: '4px 12px',
    fontSize: '0.875rem',
    boxShadow: 'none',
    '&:hover': {
        boxShadow: 'none',
    },
}));

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: VoidFunction;
    selectedUser: any;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: VoidFunction;
    onChangePassword?: (userId: string, newPassword: string) => Promise<void>;
};

export function UserFormDialog({
    open,
    onClose,
    selectedUser,
    formData,
    setFormData,
    onSubmit,
    onChangePassword,
}: Props) {
    const [currentTab, setCurrentTab] = useState('details');
    const [roles, setRoles] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);

    // User Permissions state
    const [userPermissions, setUserPermissions] = useState<any[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
    const [permissionFormData, setPermissionFormData] = useState({
        allow: '',
        for_value: ''
    });

    // Password change state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const showNewPassword = useBoolean();
    const showConfirmPassword = useBoolean();

    // Validation state
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.first_name) {
            newErrors.first_name = 'First Name is required';
        }

        // New user password validation
        if (!selectedUser) {
            if (!newPassword) {
                newErrors.password = 'Password is required';
            } else if (newPassword.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            } else if (newPassword !== confirmPassword) {
                newErrors.password = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitWrapper = () => {
        if (validate()) {
            onSubmit();
        }
    };

    useEffect(() => {
        if (open) {
            // Fetch roles and modules when dialog opens
            getRoles()
                .then(setRoles)
                .catch((err: any) => console.error('Failed to fetch roles:', err));

            getModules()
                .then(setModules)
                .catch((err: any) => console.error('Failed to fetch modules:', err));

            // Fetch user permissions if editing existing user
            if (selectedUser) {
                loadUserPermissions();
            }
        }
    }, [open, selectedUser]);

    useEffect(() => {
        const fullName = [formData.first_name, formData.middle_name, formData.last_name]
            .filter(Boolean)
            .join(' ');
        if (formData.full_name !== fullName) {
            setFormData({ ...formData, full_name: fullName });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.first_name, formData.middle_name, formData.last_name]);

    useEffect(() => {
        if (newPassword && confirmPassword && newPassword === confirmPassword) {
            // Only sync if it meets minimum length to prevent backend crash on super-weak passwords
            if (newPassword.length >= 6) {
                if (formData.new_password !== newPassword) {
                    setFormData({ ...formData, new_password: newPassword });
                }
            } else if (formData.new_password !== '') {
                setFormData({ ...formData, new_password: '' });
            }
        } else if (!newPassword && !confirmPassword) {
            if (formData.new_password !== '') {
                setFormData({ ...formData, new_password: '' });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newPassword, confirmPassword]);

    const loadUserPermissions = async () => {
        if (!selectedUser?.email) return;
        setLoadingPermissions(true);
        try {
            const result = await fetchUserPermissions({
                page: 1,
                page_size: 100,
                filters: { user: selectedUser.email }
            });
            setUserPermissions(result.data);
        } catch (error: any) {
            console.error('Failed to load user permissions:', error);
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    const handleRoleToggle = (roleName: string) => {
        const currentRoles = formData.roles || [];
        const newRoles = currentRoles.includes(roleName)
            ? currentRoles.filter((r: string) => r !== roleName)
            : [...currentRoles, roleName];
        setFormData({ ...formData, roles: newRoles });
    };

    const handleModuleToggle = (moduleName: string) => {
        const currentModules = formData.block_modules || [];
        const newModules = currentModules.includes(moduleName)
            ? currentModules.filter((m: string) => m !== moduleName)
            : [...currentModules, moduleName];
        setFormData({ ...formData, block_modules: newModules });
    };

    const handleSelectAllRoles = () => {
        setFormData({ ...formData, roles: roles.map((r) => r.name) });
    };

    const handleUnselectAllRoles = () => {
        setFormData({ ...formData, roles: [] });
    };

    const handleAllowAllModules = () => {
        setFormData({ ...formData, block_modules: [] });
    };

    const handleBlockAllModules = () => {
        setFormData({ ...formData, block_modules: modules.map((m) => m.name) });
    };

    const handlePasswordChange = async () => {
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        if (onChangePassword && selectedUser) {
            try {
                await onChangePassword(selectedUser.name, newPassword);
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError('');
            } catch (error: any) {
                setPasswordError(error.message || 'Failed to change password');
            }
        } else {
            // For new user, update formData
            if (newPassword.length < 6) {
                setFormData({ ...formData, new_password: '' }); // Reset if invalid
            } else {
                setFormData({ ...formData, new_password: newPassword });
            }
            // Don't reset newPassword/confirmPassword yet, let user see it's synced
            setPasswordError('');
        }
    };



    const handleCreatePermission = async () => {
        if (!selectedUser?.email || !permissionFormData.allow || !permissionFormData.for_value) return;

        try {
            await createUserPermission({
                user: selectedUser.email,
                allow: permissionFormData.allow,
                for_value: permissionFormData.for_value,
            });
            setOpenPermissionDialog(false);
            setPermissionFormData({ allow: '', for_value: '' });
            loadUserPermissions();
        } catch (error: any) {
            console.error('Failed to create permission:', error);
        }
    };

    const handleDeletePermission = async (permissionName: string) => {
        try {
            await deleteUserPermission(permissionName);
            loadUserPermissions();
        } catch (error: any) {
            console.error('Failed to delete permission:', error);
        }
    };

    const renderUserDetailsTab = (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                        control={
                            <Android12Switch
                                checked={formData.enabled === 1}
                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked ? 1 : 0 })}
                            />
                        }
                        label="Enabled"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        required
                        label="Email"
                        value={formData.email || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        disabled={!!selectedUser}
                        error={!!errors.email}
                        helperText={errors.email || (selectedUser ? 'Email cannot be changed' : '')}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        value={formData.full_name || ''}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        required
                        label="First Name"
                        value={formData.first_name || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, first_name: e.target.value });
                            if (errors.first_name) setErrors({ ...errors, first_name: '' });
                        }}
                        error={!!errors.first_name}
                        helperText={errors.first_name}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={formData.username || ''}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Middle Name"
                        value={formData.middle_name || ''}
                        onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.last_name || ''}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        select
                        fullWidth
                        label="User Type"
                        value={formData.user_type || 'System User'}
                        onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                        SelectProps={{ native: true }}
                    >
                        <option value="System User">System User</option>
                        <option value="Website User">Website User</option>
                    </TextField>
                </Grid>

                {!selectedUser && (
                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={
                                <Android12Switch
                                    checked={formData.send_welcome_email === 1}
                                    onChange={(e) => setFormData({ ...formData, send_welcome_email: e.target.checked ? 1 : 0 })}
                                />
                            }
                            label="Send Welcome Email"
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );

    const renderRolesTab = (
        <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
                <Stack direction="row" spacing={2}>
                    <Android12Button variant="outlined" size="small" onClick={handleSelectAllRoles}>
                        Select All
                    </Android12Button>
                    <Android12Button variant="outlined" size="small" onClick={handleUnselectAllRoles}>
                        Unselect All
                    </Android12Button>
                </Stack>

                <Grid container spacing={3}>
                    {roles.map((role) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={role.name}>
                            <FormControlLabel
                                control={
                                    <Android12Switch
                                        checked={(formData.roles || []).includes(role.name)}
                                        onChange={() => handleRoleToggle(role.name)}
                                        size="small"
                                    />
                                }
                                label={role.name}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Box>
    );

    const renderModulesTab = (
        <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
                <Typography variant="body2" color="text.secondary">
                    Select modules to allow. Unselected modules will be blocked.
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Android12Button variant="outlined" size="small" onClick={handleAllowAllModules}>
                        Allow All
                    </Android12Button>
                    <Android12Button variant="outlined" size="small" onClick={handleBlockAllModules}>
                        Block All
                    </Android12Button>
                </Stack>

                <Grid container spacing={1}>
                    {modules.map((module) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={module.name}>
                            <FormControlLabel
                                control={
                                    <Android12Switch
                                        checked={!(formData.block_modules || []).includes(module.name)}
                                        onChange={() => handleModuleToggle(module.name)}
                                        size="small"
                                    />
                                }
                                label={module.name}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Box>
    );

    const renderPasswordTab = (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>{selectedUser ? 'Change Password' : 'Set Password'}</Typography>
            <Stack spacing={3}>
                {passwordError && (
                    <Alert severity="error">{passwordError}</Alert>
                )}

                <TextField
                    fullWidth
                    label="New Password"
                    type={showNewPassword.value ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    autoComplete="new-password"
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={showNewPassword.onToggle} edge="end">
                                    <Iconify icon={showNewPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword.value ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    error={!!newPassword && !!confirmPassword && newPassword !== confirmPassword}
                    helperText={!!newPassword && !!confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={showConfirmPassword.onToggle} edge="end">
                                    <Iconify icon={showConfirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Password button removed, synced to formData and triggered by main Update/Create button */}
            </Stack>
        </Box>
    );

    const renderUserPermissionsTab = (
        <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
                <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                        <Typography variant="h6">User Permissions</Typography>
                        {selectedUser && (
                            <Button
                                variant="contained"
                                startIcon={<Iconify icon="mingcute:add-line" />}
                                onClick={() => setOpenPermissionDialog(true)}
                            >
                                Add Permission
                            </Button>
                        )}
                    </Stack>

                    {!selectedUser && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Permissions can be added once the user has been created.
                        </Alert>
                    )}
                </Box>

                {loadingPermissions ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <Typography>Loading permissions...</Typography>
                    </Box>
                ) : userPermissions.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            No permissions found
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
                            {userPermissions.map((permission) => (
                                <Box key={permission.name} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2">{permission.allow}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            For Value: {permission.for_value}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => handleDeletePermission(permission.name)}
                                    >
                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Stack>

            <UserPermissionFormDialog
                open={openPermissionDialog}
                onClose={() => setOpenPermissionDialog(false)}
                formData={{ ...permissionFormData, user: selectedUser?.email }}
                setFormData={(data) => setPermissionFormData({
                    allow: data.allow,
                    for_value: data.for_value
                })}
                onSubmit={handleCreatePermission}
                hideUserField
            />
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {selectedUser ? 'Edit User' : 'New User'}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <Tabs value={currentTab} onChange={handleTabChange} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="User Details" value="details" />
                <Tab label="Roles & Permissions" value="roles" />
                <Tab label="Allow Modules" value="modules" />
                {selectedUser && <Tab label="User Permissions" value="permissions" />}
                <Tab label="Password" value="password" />
            </Tabs>

            <DialogContent sx={{ p: 0 }}>
                {currentTab === 'details' && renderUserDetailsTab}
                {currentTab === 'roles' && renderRolesTab}
                {currentTab === 'modules' && renderModulesTab}
                {currentTab === 'permissions' && selectedUser && renderUserPermissionsTab}
                {currentTab === 'password' && renderPasswordTab}
            </DialogContent>

            <DialogActions>
                <Button variant="contained" onClick={handleSubmitWrapper}>
                    {selectedUser ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
