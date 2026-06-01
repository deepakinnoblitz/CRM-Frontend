import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    announcement: any;
};

export function AnnouncementDetailsDialog({ open, onClose, announcement }: Props) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 2, boxShadow: (themeVar) => themeVar.customShadows.z24, } }}>
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: (theme) => `1px solid ${theme.palette.divider}`}}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Announcement Details</Typography>
                <IconButton onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500], bgcolor: 'background.paper', boxShadow: (theme) => theme.customShadows?.z1 }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, m: 2, mt: 4 }}>
                {announcement ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {/* Header Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box
                                sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'info.lighter',
                                    color: 'info.main',
                                }}
                            >
                                <Iconify icon={"solar:bell-bold" as any} width={30} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>{announcement.announcement_name}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Published on {announcement.creation ? new Date(announcement.creation).toLocaleDateString() : '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                <Label
                                    variant="soft"
                                    color={(announcement.is_active === 1 && 'success') || 'error'}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {announcement.is_active === 1 ? 'Active' : 'Hidden'}
                                </Label>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontWeight: 700 }}>
                                    ID: {announcement.name}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {/* Announcement Content */}
                        <Box>
                            <SectionHeader title="Announcement" icon="" />
                            <Box
                                sx={{
                                    p: 3,
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                    borderRadius: 2,
                                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        lineHeight: 1.8,
                                        '& p': { margin: 0, marginBottom: 1 },
                                        '& p:last-child': { marginBottom: 0 },
                                        '& ul, & ol': { paddingLeft: 3, marginBottom: 1 },
                                        '& li': { marginBottom: 0.5 }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: announcement.announcement || '-' }}
                                />
                            </Box>
                        </Box>

                        {/* Metadata */}
                        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <DetailItem
                                label="Created On"
                                value={announcement.creation ? new Date(announcement.creation).toLocaleString() : '-'}
                                icon="solar:calendar-bold"
                                color="warning"
                            />
                            <DetailItem
                                label="Last Modified"
                                value={announcement.modified ? new Date(announcement.modified).toLocaleString() : '-'}
                                icon="solar:clock-circle-bold"
                                color="warning"
                            />
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Announcement Found</Typography>
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
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '14px', letterSpacing: 0.25 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ label, value, icon, color = 'info' }: { label: string; value?: string | null; icon: string; color?: 'info' | 'warning' | 'primary' | 'success' | 'secondary' }) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette[color].main, 0.04),
                border: (theme) => `1px solid ${alpha(theme.palette[color].main, 0.12)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
                    color: (theme) => theme.palette[color].main,
                    flexShrink: 0,
                }}
            >
                <Iconify icon={icon as any} width={20} />
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        display: 'block',
                        fontSize: 11,
                        mb: 0.2,
                    }}
                >
                    {label}
                </Typography>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 800,
                        color: 'text.primary',
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
