import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { getUser } from 'src/api/users';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    userId: string | null;
    onEdit?: () => void;
};

export function UserDetailsDialog({ open, onClose, userId, onEdit }: Props) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && userId) {
            setLoading(true);
            getUser(userId)
                .then(setUser)
                .catch((err) => console.error('Failed to fetch user details:', err))
                .finally(() => setLoading(false));
        }
    }, [open, userId]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            TransitionProps={{ onExited: () => setUser(null) }}
        >
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>User Profile</Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                >
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, pb: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : user ? (
                    <Stack spacing={0}>
                        {/* Profile Header */}
                        <Box sx={{ px: 3, pt: 2, pb: 3, bgcolor: 'background.neutral' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                <Avatar
                                    alt={user.full_name}
                                    src={user.user_image}
                                    sx={{
                                        width: 88,
                                        height: 88,
                                        border: (theme) => `4px solid ${theme.palette.background.paper}`,
                                        boxShadow: (theme) => theme.customShadows?.z8,
                                    }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.full_name}</Typography>
                                        {onEdit && (
                                            <IconButton size="small" onClick={onEdit} sx={{ color: 'primary.main' }}>
                                                <Iconify icon="solar:pen-bold" width={18} />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                                        {user.email}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Label color={user.enabled ? 'success' : 'error'} variant="filled">
                                            {user.enabled ? 'Enabled' : 'Disabled'}
                                        </Label>
                                        <Label color="info" variant="soft">
                                            {user.user_type}
                                        </Label>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Account Information Section */}
                        <Box sx={{ px: 3, pt: 3 }}>
                            <SectionHeader title="ACCOUNT INFORMATION" icon="solar:user-bold-duotone" />

                            <Stack spacing={2.5} sx={{ mt: 2 }}>
                                <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                                    <DetailItem
                                        label="USERNAME"
                                        value={user.username || user.email?.split('@')[0]}
                                        icon="solar:user-id-bold"
                                    />
                                    <DetailItem
                                        label="LAST LOGIN"
                                        value={user.last_login ? new Date(user.last_login).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false
                                        }) : 'Never'}
                                        icon="solar:clock-circle-bold"
                                    />
                                </Box>

                                <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                                    <DetailItem
                                        label="CREATED"
                                        value={user.creation ? new Date(user.creation).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false
                                        }) : '-'}
                                        icon="solar:calendar-bold"
                                    />
                                    <DetailItem
                                        label="MODIFIED"
                                        value={user.modified ? new Date(user.modified).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false
                                        }) : '-'}
                                        icon="solar:calendar-mark-bold"
                                    />
                                </Box>
                            </Stack>
                        </Box>

                        {/* Roles Section */}
                        {user.roles && user.roles.length > 0 && (
                            <Box sx={{ px: 3, pt: 3 }}>
                                <SectionHeader title="ROLES & PERMISSIONS" icon="solar:shield-check-bold-duotone" />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                    {user.roles.map((roleItem: any) => {
                                        const roleName = typeof roleItem === 'string' ? roleItem : roleItem.role;
                                        return (
                                            <Label key={roleName} variant="soft" color="primary">
                                                {roleName}
                                            </Label>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}

                        {/* Modules Section */}
                        {user.allowed_modules && user.allowed_modules.length > 0 && (
                            <Box sx={{ px: 3, pt: 3 }}>
                                <SectionHeader title="ALLOWED MODULES" icon="solar:widget-5-bold-duotone" />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                    {user.allowed_modules.map((moduleItem: any) => {
                                        const moduleName = typeof moduleItem === 'string' ? moduleItem : moduleItem.module;
                                        return (
                                            <Label key={moduleName} variant="soft" color="success">
                                                {moduleName}
                                            </Label>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}

                        {/* Bio Section */}
                        {user.bio && (
                            <Box sx={{ px: 3, pt: 3 }}>
                                <SectionHeader title="BIO" icon="solar:document-text-bold-duotone" />
                                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.8 }}>
                                    {user.bio}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>No User Found</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Iconify icon={icon as any} width={22} sx={{ color: 'primary.main' }} />
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: 'text.primary'
                }}
            >
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ label, value, icon }: { label: string; value?: string | null; icon: string }) {
    return (
        <Box>
            <Typography
                variant="caption"
                sx={{
                    color: 'text.disabled',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    mb: 0.75,
                    display: 'block',
                    fontSize: '0.7rem',
                    letterSpacing: 0.5
                }}
            >
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={18} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
