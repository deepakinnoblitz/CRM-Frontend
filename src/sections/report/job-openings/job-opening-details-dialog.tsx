import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    onRefer?: (jobName: string) => void;
    job: any;
};

export function JobOpeningDetailsDialog({ open, onClose, onRefer, job }: Props) {
    if (!job) return null;

    const formatDate = (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    const renderHeader = (
        <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2, mb: 3 , mt: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                        {job.job_title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" color="text.secondary">
                            {job.designation}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                            {job.location}
                        </Typography>
                    </Stack>
                </Box>
                <Label
                    variant="soft"
                    color={(job.status === 'Open' && 'success') || (job.status === 'Closed' && 'error') || 'default'}
                    sx={{ height: 32, px: 2, borderRadius: 1 }}
                >
                    {job.status}
                </Label>
            </Stack>
        </Box>
    );

    const renderDetails = (
        <Box
            sx={{
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                mb: 4,
                ml: 2,
            }}
        >
            <DetailItem icon="solar:calendar-date-bold" label="Posted On" value={formatDate(job.posted_on)} />
            <DetailItem icon="solar:calendar-add-bold" label="Closes On" value={formatDate(job.closes_on)} />
            <DetailItem icon="solar:clock-circle-bold" label="Shift" value={job.shift} />
            <DetailItem icon="solar:ranking-bold" label="Experience" value={job.experience} />
            <DetailItem
                icon="solar:wad-of-money-bold"
                label="Salary Range"
                value={job.lower_range ? `₹${job.lower_range} - ₹${job.upper_range} per ${job.salary_per}` : 'Not Disclosed'}
            />
            <DetailItem icon="solar:settings-bold" label="Skills Required" value={job.skills_required || '-'} />
        </Box>
    );

    const renderDescription = (
        <Stack spacing={3} sx={{ mt: 2, mb: 5, ml: 2 }}>
            <Box>
                <SectionHeader title="Small Description" icon="solar:notes-bold" />
                <Box sx={{ mt: 2, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                    <Typography variant="body2">
                        {job.small_description || 'No small description provided.'}
                    </Typography>
                </Box>
            </Box>

            <Box>
                <SectionHeader title="Job Description" icon="solar:notes-bold" />
                <Box sx={{ mt: 2, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                    <Typography variant="body2">
                        {job.description || 'No description provided.'}
                    </Typography>
                </Box>
            </Box>
        </Stack>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: (themeVar) => themeVar.customShadows.z24,
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                }
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                    Job Opening Details
                </Typography>
                <IconButton onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                    <Iconify icon={"mingcute:close-line" as any} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
                {renderHeader}
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2.5,
                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                        mb: 4,
                        ml: 2
                    }}
                >
                    <DetailItem icon="solar:calendar-date-bold" label="Posted On" value={formatDate(job.posted_on)} />
                    <DetailItem icon="solar:calendar-add-bold" label="Closes On" value={formatDate(job.closes_on)} />
                    <DetailItem icon="solar:clock-circle-bold" label="Shift" value={job.shift} />
                    <DetailItem icon="solar:ranking-bold" label="Experience" value={job.experience} />
                    <DetailItem
                        icon="solar:wad-of-money-bold"
                        label="Salary Range"
                        value={
                            job.lower_range ? (
                                <>
                                    <Box component="span" sx={{ fontFamily: 'Arial' }}>₹</Box>
                                    {job.lower_range} - <Box component="span" sx={{ fontFamily: 'Arial' }}>₹</Box>{job.upper_range} per {job.salary_per}
                                </>
                            ) : (
                                'Not Disclosed'
                            )
                        }
                    />
                    <DetailItem icon="solar:settings-bold" label="Skills Required" value={job.skills_required || '-'} />
                </Box>
                <Divider sx={{ my: 4, borderStyle: 'dashed' }} />
                {renderDescription}
            </DialogContent>

            {onRefer && (
                <DialogActions sx={{ p: 1.5 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<Iconify icon={"solar:user-plus-bold" as any} />}
                        onClick={() => {
                            onRefer(job.name);
                            onClose();
                        }}
                        sx={{ bgcolor: '#00A5D1', '&:hover': { bgcolor: '#0084a7' } }}
                    >
                        Refer a Friend for this Position
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}

// ----------------------------------------------------------------------

function SectionHeader({ title, icon }: { title: string; icon: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Iconify icon={icon as any} width={24} sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Iconify icon={icon as any} width={20} sx={{ color: 'text.disabled', mt: 0.2 }} />
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {value}
                </Typography>
            </Box>
        </Stack>
    );
}
