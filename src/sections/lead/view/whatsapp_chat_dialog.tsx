import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';

type Props = {
    open: boolean;
    onClose: () => void;
    lead: any;
};

export function WhatsappChatDialog({
    open,
    onClose,
    lead,
}: Props) {
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: (theme) => theme.customShadows.z24,
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                WhatsApp
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                color: (theme) => theme.palette.grey[500],
                }}
            >
                <Iconify icon="mingcute:close-line" />
            </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            bgcolor: '#25D366',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                        }}
                    >
                        {lead?.lead_name?.charAt(0)}
                    </Box>

                    <Box>
                        <Typography fontWeight={700}>
                            {lead?.lead_name}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {lead?.phone_number}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        height: 400,
                        p: 2,
                        bgcolor: '#ECE5DD',
                        overflowY: 'auto',
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: '75%',
                            ml: 'auto',
                            mb: 2,
                            p: 1.5,
                            bgcolor: '#DCF8C6',
                            borderRadius: 2,
                        }}
                    >
                        Hello 👋
                    </Box>

                    <Box
                        sx={{
                            maxWidth: '75%',
                            mb: 2,
                            p: 1.5,
                            bgcolor: '#fff',
                            borderRadius: 2,
                        }}
                    >
                        Welcome to our CRM.
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#FAFBFC',
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="Write your WhatsApp message..."
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 4,
                                height: 50,
                                bgcolor: '#fff',
                            },
                        }}
                    />

                    <Button
                        variant="contained"
                        startIcon={
                            <Iconify
                                icon="solar:plain-bold"
                                width={18}
                            />
                        }
                        sx={{
                            height: 44,
                            px: 3,
                            borderRadius: 3,
                            fontWeight: 700,
                            textTransform: 'none',
                            bgcolor: '#25D366',
                            '&:hover': {
                                bgcolor: '#1FB857',
                            },
                        }}
                    >
                        Send
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}