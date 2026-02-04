import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
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
        } else {
            setUser(null);
        }
    }, [open, userId]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>User Profile</Typography>
                <IconButton onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500], bgcolor: 'background.paper', boxShadow: (theme) => theme.customShadows?.z1 }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, m: 0, mt: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : user ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* User Header */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                            <Avatar
                                alt={user.full_name}
                                src={user.user_image}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    border: (theme) => `3px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                                }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{user.full_name}</Typography>
                                    {onEdit && (
                                        <IconButton size="small" onClick={onEdit} sx={{ color: 'primary.main' }}>
                                            <Iconify icon="solar:pen-bold" width={18} />
                                        </IconButton>
                                    )}
                                </Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                                    {user.email}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Label color={user.enabled ? 'success' : 'error'}>
                                        {user.enabled ? 'Enabled' : 'Disabled'}
                                    </Label>
                                    <Label color="info" variant="outlined">
                                        {user.user_type}
                                    </Label>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {/* User Details */}
                        <Box sx={{ margin: 2 }}>
                            <SectionHeader title="Account Information" icon="solar:user-bold" />
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 3,
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                                }}
                            >
                                <DetailItem label="Username" value={user.username} icon="solar:user-id-bold" />
                                <DetailItem label="User Type" value={user.user_type} icon="solar:shield-user-bold" />
                                <DetailItem label="Role Profile" value={user.role_profile_name} icon="solar:shield-bold" />
                                <DetailItem
                                    label="Last Login"
                                    value={user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                    icon="solar:clock-circle-bold"
                                />
                                <DetailItem
                                    label="Created"
                                    value={user.creation ? new Date(user.creation).toLocaleString() : '-'}
                                    icon="solar:calendar-bold"
                                />
                                <DetailItem
                                    label="Modified"
                                    value={user.modified ? new Date(user.modified).toLocaleString() : '-'}
                                    icon="solar:calendar-mark-bold"
                                />
                            </Box>
                        </Box>

                        {/* Additional Info */}
                        {user.bio && (
                            <>
                                <Divider sx={{ borderStyle: 'dashed' }} />
                                <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                                    <SectionHeader title="Bio" icon="solar:document-text-bold" noMargin />
                                    <Typography variant="body2" sx={{ mt: 2, color: 'text.primary', fontWeight: 600 }}>
                                        {user.bio}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>
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

function DetailItem({ label, value, icon }: { label: string; value?: string | null; icon: string }) {
    return (
        <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
