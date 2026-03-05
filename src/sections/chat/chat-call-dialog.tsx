import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    callState: 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';
    callType: 'audio' | 'video';
    remoteUser: string | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    onAccept: () => void;
    onReject: () => void;
    onHangUp: () => void;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
};

export default function ChatCallDialog({
    open,
    onClose,
    callState,
    callType,
    remoteUser,
    localStream,
    remoteStream,
    onAccept,
    onReject,
    onHangUp,
    onToggleAudio,
    onToggleVideo,
}: Props) {
    const theme = useTheme();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const renderContent = () => {
        if (callState === 'incoming') {
            return (
                <Stack spacing={3} alignItems="center" sx={{ p: 4 }}>
                    <Avatar
                        sx={{ width: 80, height: 80, fontSize: 32 }}
                    >
                        {remoteUser?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6">Incoming {callType} call...</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {remoteUser} is calling you
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={onReject}
                            startIcon={<Iconify icon={"solar:phone-bold" as any} />}
                            sx={{ borderRadius: 1.5 }}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={onAccept}
                            startIcon={<Iconify icon="solar:phone-calling-bold" />}
                            sx={{ borderRadius: 1.5 }}
                        >
                            Accept
                        </Button>
                    </Stack>
                </Stack>
            );
        }

        if (callState === 'calling') {
            return (
                <Stack spacing={3} alignItems="center" sx={{ p: 4 }}>
                    <Avatar
                        sx={{ width: 80, height: 80, fontSize: 32 }}
                    >
                        {remoteUser?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6">Calling {remoteUser}...</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Waiting for answer
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={onHangUp}
                        startIcon={<Iconify icon={"solar:phone-calling-cancel-bold" as any} />}
                        sx={{ borderRadius: 1.5 }}
                    >
                        Cancel
                    </Button>
                </Stack>
            );
        }

        return (
            <Box sx={{ position: 'relative', width: 1, height: 480, bgcolor: 'common.black' }}>
                {/* Remote Video */}
                {callType === 'video' ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
                        <Avatar sx={{ width: 120, height: 120, fontSize: 48 }}>
                            {remoteUser?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h5" sx={{ mt: 2, color: 'common.white' }}>
                            {remoteUser}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'grey.500' }}>
                            On Air
                        </Typography>
                    </Stack>
                )}

                {/* Local Video Thumbnail */}
                {callType === 'video' && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            width: 120,
                            height: 160,
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            boxShadow: (t) => t.customShadows?.z24,
                            bgcolor: 'grey.800',
                            border: (t) => `solid 2px ${t.palette.common.white}`,
                        }}
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Box>
                )}

                {/* Controls Overlay */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                    sx={{
                        position: 'absolute',
                        bottom: 40,
                        left: 0,
                        right: 0,
                    }}
                >
                    <IconButton
                        onClick={onToggleAudio}
                        sx={{
                            bgcolor: alpha(theme.palette.common.white, 0.15),
                            color: 'common.white',
                            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.25) },
                        }}
                    >
                        <Iconify icon="solar:microphone-bold" />
                    </IconButton>

                    {callType === 'video' && (
                        <IconButton
                            onClick={onToggleVideo}
                            sx={{
                                bgcolor: alpha(theme.palette.common.white, 0.15),
                                color: 'common.white',
                                '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.25) },
                            }}
                        >
                            <Iconify icon={"solar:videocamera-record-bold-duotone" as any} />
                        </IconButton>
                    )}

                    <IconButton
                        onClick={onHangUp}
                        sx={{
                            bgcolor: 'error.main',
                            color: 'common.white',
                            '&:hover': { bgcolor: 'error.dark' },
                            width: 56,
                            height: 56,
                        }}
                    >
                        <Iconify icon={"solar:phone-bold" as any} width={28} />
                    </IconButton>
                </Stack>
            </Box>
        );
    };

    return (
        <Dialog
            fullWidth
            maxWidth={callState === 'connected' ? 'md' : 'xs'}
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') onClose();
            }}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: callState === 'connected' ? 'common.black' : 'background.paper',
                },
            }}
        >
            {renderContent()}
        </Dialog>
    );
}
