import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { fTime } from 'src/utils/format-time';

import { logout } from 'src/api/auth';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

export function UserStatusBar() {
    const theme = useTheme();
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [isLogoutDialog, setIsLogoutDialog] = useState(false);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleInfoClick = () => {
        setInfoDialogOpen(true);
        setIsLogoutDialog(false);
    };

    const handleInfoDialogClose = () => {
        setInfoDialogOpen(false);
        setIsLogoutDialog(false);
    };

    const handleLogout = async () => {
        setIsLogoutDialog(true);
        setInfoDialogOpen(true);
    };

    const handleConfirmLogout = async () => {
        setInfoDialogOpen(false);
        setIsLogoutDialog(false);
        try {
            await logout();
            window.location.href = '/login';
        } catch (error) {
            console.error(error);
        }
    };

    const loginTime = user?.last_login ? fTime(user.last_login) : 'N/A';

    const [dummyTimer, setDummyTimer] = useState(0); // seconds elapsed

    const formatTimer = (totalSeconds: number) => {
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setDummyTimer((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Dummy user data
    const userData = {
        name: user?.name || 'Mani Kandan',
        email: user?.email || 'manikandangm.innoblitz@gmail.com',
        avatar: (user as any)?.avatar || 'MK',
    };

    const statusOptions = [
        { label: 'Available', color: 'success.main', icon: 'solar:check-read-bold' },
        { label: 'Busy', color: 'error.main', icon: 'fluent:presence-dnd-16-filled' },
        { label: 'Do not disturb', color: 'error.dark', icon: 'eva:slash-circle-fill' },
        { label: 'Be right back', color: 'warning.main', icon: 'eva:clock-outline' },
        { label: 'Appear away', color: 'warning.dark', icon: 'eva:clock-fill' },
        { label: 'Appear offline', color: 'grey.500', icon: 'eva:close-circle-fill' },
    ];

    const [status, setStatus] = useState(statusOptions[0]);

    return (
        <>
            <Box
                sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Login active time
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatTimer(dummyTimer)}
                </Typography>
            </Box>
            <Button
                onClick={handleClick}
                sx={{
                    pl: 1,
                    pr: 1.5,
                    py: 0.75,
                    borderRadius: 10,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    textTransform: 'none',
                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 10,
                            bgcolor: status.color,
                            color: 'common.white',
                        }}
                    >
                        <Iconify icon={status.icon as any} width={16} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                            {status.label}
                        </Typography>
                    </Stack>

                    <Iconify icon={"eva:chevron-down-fill" as any} width={20} />
                </Stack>
            </Button>

            <IconButton
                onClick={handleInfoClick}
                sx={{
                    ml: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    animation: 'attentionBlink 1.5s ease-in-out infinite',
                    boxShadow: `0 0 0 0 ${alpha(theme.palette.info.main, 0.4)}`,
                    '@keyframes attentionBlink': {
                        '0%, 100%': {
                            opacity: 1,
                            transform: 'scale(1) rotate(0deg)',
                            boxShadow: `0 0 0 0 ${alpha(theme.palette.info.main, 0.4)}`,
                        },
                        '25%': {
                            opacity: 0.8,
                            transform: 'scale(1.1) rotate(-5deg)',
                            boxShadow: `0 0 0 8px ${alpha(theme.palette.info.main, 0)}`,
                        },
                        '50%': {
                            opacity: 0.6,
                            transform: 'scale(1.2) rotate(5deg)',
                            boxShadow: `0 0 0 12px ${alpha(theme.palette.info.main, 0.1)}`,
                        },
                        '75%': {
                            opacity: 0.8,
                            transform: 'scale(1.1) rotate(-5deg)',
                            boxShadow: `0 0 0 8px ${alpha(theme.palette.info.main, 0)}`,
                        },
                    },
                    '&:hover': {
                        animation: 'none',
                        transform: 'scale(1.1)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
                        transition: 'all 0.2s ease',
                    },
                }}
            >
                <Iconify
                    icon={"eva:info-outline" as any}
                    width={20}
                    sx={{
                        color: 'info.main',
                        filter: 'drop-shadow(0 0 4px rgba(25, 118, 210, 0.3))',
                    }}
                />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        minWidth: 320,
                        boxShadow: theme.shadows[20],
                    },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Personal
                    </Typography>
                    <Button
                        size="small"
                        onClick={handleLogout}
                        sx={{
                            textTransform: 'none',
                            color: 'primary.main',
                            fontSize: '0.85rem',
                            padding: 0,
                            '&:hover': {
                                backgroundColor: 'transparent',
                            },
                        }}
                    >
                        Sign out
                    </Button>
                </Box>

                <Divider />

                {/* User Card */}
                <Box sx={{ px: 1.5, py: 1.5 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: alpha(theme.palette.primary.main, 0.3),
                                color: 'primary.main',
                                fontWeight: 'bold',
                            }}
                        >
                            {userData.avatar}
                        </Avatar>

                        <Stack spacing={0.5} flex={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {userData.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {userData.email}
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>

                <Divider />

                {/* Status Option */}
                <Box sx={{ px: 1, py: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        Set a status
                    </Typography>
                </Box>
                {statusOptions.map((item) => (
                    <MenuItem
                        key={item.label}
                        onClick={() => {
                            setStatus(item);
                            handleClose();
                        }}
                        sx={{
                            mx: 1,
                            mt: 0.5,
                            mb: 0.5,
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.grey[500], 0.08),
                            },
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                                sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: item.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'common.white',
                                }}
                            >
                                <Iconify icon={item.icon as any} width={12} />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.label}
                            </Typography>
                        </Stack>
                        {status.label === item.label && (
                            <Typography variant="caption" sx={{ color: 'primary.main' }}>
                                Selected
                            </Typography>
                        )}
                    </MenuItem>
                ))}

                <Divider />

                {/* Set Status Message */}
                <MenuItem
                    sx={{
                        mx: 1,
                        mb: 1,
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.grey[500], 0.08),
                        },
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon={"eva:edit-2-outline" as any} width={20} sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Set status message
                        </Typography>
                    </Stack>
                    <Iconify icon="eva:chevron-right-fill" width={20} sx={{ color: 'text.secondary' }} />
                </MenuItem>

                <Divider />

            </Menu>

            <Dialog
                open={infoDialogOpen}
                onClose={handleInfoDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
                    {isLogoutDialog ? 'Logout Confirmation' : 'Information'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                        Please login just inform
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    {isLogoutDialog ? (
                        <>
                            <Button
                                onClick={handleInfoDialogClose}
                                sx={{ minWidth: 100, mr: 1 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmLogout}
                                variant="contained"
                                color="error"
                                sx={{ minWidth: 100 }}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleInfoDialogClose}
                            variant="contained"
                            sx={{ minWidth: 100 }}
                        >
                            OK
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}
