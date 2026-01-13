import { useBoolean } from 'minimal-shared/hooks';
import { useState, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { frappeRequest } from 'src/utils/csrf';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';

export function ProfileView() {
    const { user, setUser } = useAuth();

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Dialog state
    const changePassword = useBoolean();

    // Form state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [oldPasswordError, setOldPasswordError] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    // Password visibility state
    const showOldPassword = useBoolean();
    const showNewPassword = useBoolean();
    const showConfirmPassword = useBoolean();

    // Handler for password change
    const handleChangePassword = async () => {
        setErrorMessage('');
        setOldPasswordError(false);

        if (newPassword !== confirmPassword) {
            setErrorMessage('New passwords do not match');
            return;
        }

        try {
            const response = await frappeRequest('/api/method/company.company.frontend_api.update_my_password', {
                method: 'POST',
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (data.message && data.message.status === 'success') {
                setSnackbar({ open: true, message: 'Password updated successfully', severity: 'success' });
                changePassword.onFalse();
                // Reset form
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setErrorMessage('');
            } else {
                let msg = 'Failed to update password';

                if (data.exception) {
                    if (data.exception.includes('Incorrect old password')) {
                        setOldPasswordError(true);
                        msg = 'Incorrect old password';
                    } else {
                        const parts = data.exception.split(':');
                        msg = parts.length > 1 ? parts.slice(1).join(':').trim() : data.exception;
                    }
                } else if (data._server_messages) {
                    try {
                        const messages = JSON.parse(data._server_messages);
                        if (Array.isArray(messages) && messages.length > 0) {
                            const firstMsg = JSON.parse(messages[0]);
                            // Strip HTML tags if present
                            msg = firstMsg.message.replace(/<[^>]*>?/gm, '');
                        }
                    } catch (e) {
                        // Fallback
                    }
                } else if (data.message) {
                    // Check if the generic message is actually a structured error object
                    if (typeof data.message === 'object' && data.message.status === 'failed') {
                        msg = data.message.message;
                    } else {
                        msg = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
                    }
                }

                setErrorMessage(msg);
                // Also show snackbar for good measure, or maybe skip it if alert is there?
                // enqueueSnackbar(msg, { variant: 'error' }); 
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.message || 'An error occurred';
            setErrorMessage(msg);
        }
    };

    // Profile Edit State
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '');
            setMiddleName(user.middle_name || '');
            setLastName(user.last_name || '');
        }
    }, [user]);

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('doctype', 'User');
        formData.append('docname', user?.email || '');
        formData.append('fieldname', 'user_image');
        formData.append('is_private', '0');
        formData.append('folder', 'Home');

        try {
            const response = await frappeRequest('/api/method/company.company.frontend_api.upload_profile_image', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.message && data.message.status === 'success') {
                setSnackbar({ open: true, message: 'Profile picture updated!', severity: 'success' });
                // Update global user context
                if (user) {
                    const updatedUser = {
                        ...user,
                        user_image: data.message.file_url
                    };
                    setUser(updatedUser);
                }
            } else {
                setSnackbar({ open: true, message: 'Failed to upload image', severity: 'error' });
            }

        } catch (error) {
            console.error(error);
            setSnackbar({ open: true, message: 'Error uploading image', severity: 'error' });
        }
    };

    const handleSaveProfile = async () => {
        try {
            const response = await frappeRequest('/api/method/company.company.frontend_api.update_profile_info', {
                method: 'POST',
                body: JSON.stringify({
                    first_name: firstName,
                    middle_name: middleName,
                    last_name: lastName
                })
            });

            const data = await response.json();

            if (data.message && data.message.status === 'success') {
                setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
                // Update global user context so sidebar/header reflect changes immediately
                if (user) {
                    setUser({
                        ...user,
                        first_name: firstName,
                        middle_name: middleName,
                        last_name: lastName,
                        full_name: fullName
                    });
                }
            } else {
                setSnackbar({ open: true, message: data.message?.message || 'Failed to update profile', severity: 'error' });
            }

        } catch (error) {
            console.error(error);
            setSnackbar({ open: true, message: 'An error occurred while saving profile', severity: 'error' });
        }
    };

    if (!user) {
        return null;
    }

    return (
        <DashboardContent>
            <Container maxWidth="lg">
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
                    <Typography variant="h4">
                        My Profile
                    </Typography>
                </Stack>

                <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Card>
                        <CardHeader
                            title="Basic Info"
                            subheader="Review your personal details"
                            action={
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        onClick={changePassword.onTrue}
                                        startIcon={<Iconify icon="solar:shield-keyhole-bold-duotone" />}
                                    >
                                        Change Password
                                    </Button>
                                    <Button variant="contained" color="primary" onClick={handleSaveProfile}>
                                        Save Changes
                                    </Button>
                                </Stack>
                            }
                        />

                        <CardContent>
                            <Stack alignItems="center" sx={{ mb: 5, position: 'relative' }}>
                                <input
                                    type="file"
                                    ref={fileRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />

                                <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                        alt={user.full_name}
                                        src={user.user_image}
                                        sx={{
                                            width: 144,
                                            height: 144,
                                            mb: 3,
                                            border: (theme) => `solid 2px ${theme.palette.background.default}`,
                                        }}
                                    />
                                    <IconButton
                                        onClick={() => fileRef.current?.click()}
                                        sx={{
                                            position: 'absolute',
                                            bottom: 24,
                                            right: 0,
                                            width: 40,
                                            height: 40,
                                            bgcolor: 'common.white',
                                            boxShadow: (theme) => theme.customShadows.z8,
                                            '&:hover': {
                                                bgcolor: 'grey.200',
                                            },
                                        }}
                                    >
                                        <Iconify icon="solar:pen-bold" color="text.secondary" width={24} />
                                    </IconButton>
                                </Box>
                            </Stack>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Middle Name"
                                        value={middleName}
                                        onChange={(e) => setMiddleName(e.target.value)}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={fullName}
                                        InputProps={{ readOnly: true }}
                                        helperText="Automatically generated"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        value={user.username || ''}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={user.email || ''}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Access & Permissions" subheader="Roles and allowed modules" />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                        Roles
                                    </Typography>
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {user.roles.map((role) => (
                                            <Chip key={role} label={role} size="small" variant="outlined" />
                                        ))}
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                        Allowed Modules
                                    </Typography>
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {user.allowed_modules.length > 0 ? (
                                            user.allowed_modules.map((module) => (
                                                <Chip key={module} label={module} size="small" color="primary" variant="filled" />
                                            ))
                                        ) : (
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No extra modules allowed</Typography>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>

            <Dialog open={changePassword.value} onClose={changePassword.onFalse} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {errorMessage && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errorMessage}
                            </Alert>
                        )}
                        <TextField
                            fullWidth
                            label="Current Password"
                            type={showOldPassword.value ? 'text' : 'password'}
                            value={oldPassword}
                            error={oldPasswordError}
                            helperText={oldPasswordError ? "Incorrect old password" : ""}
                            onChange={(e) => {
                                setOldPassword(e.target.value);
                                setOldPasswordError(false);
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={showOldPassword.onToggle} edge="end">
                                            <Iconify icon={showOldPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="New Password"
                            type={showNewPassword.value ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={changePassword.onFalse} variant="outlined" color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleChangePassword} variant="contained" color="inherit">
                        Update Password
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}
