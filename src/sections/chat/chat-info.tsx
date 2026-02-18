import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { stringToColor, stringToDarkColor } from 'src/utils/color-utils';

import { Iconify } from 'src/components/iconify';
// ----------------------------------------------------------------------

type Props = {
    channel: any;
    messages: any[];
    onClose: () => void;
    onCloseChannel: () => void;
    onReopenChannel: () => void;
};

export default function ChatInfo({ channel, messages, onClose, onCloseChannel, onReopenChannel }: Props) {
    const [view, setView] = useState<'info' | 'media'>('info');
    const [tab, setTab] = useState(0);

    const isClosed = channel.chat_status === 'Closed';

    const sharedContent = useMemo(() => {
        const images: string[] = [];
        const links: { title: string; url: string }[] = [];
        const docs: { name: string; url: string }[] = [];

        messages.forEach((msg) => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = msg.content;

            // Extract Images
            const imgs = tempDiv.getElementsByTagName('img');
            for (let i = 0; i < imgs.length; i += 1) {
                images.push(imgs[i].src);
            }

            // Extract Links and Docs
            const anchors = tempDiv.getElementsByTagName('a');
            for (let i = 0; i < anchors.length; i += 1) {
                const { href } = anchors[i];
                const text = anchors[i].innerText || href;
                if (href.includes('/files/') || href.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/i)) {
                    docs.push({ name: text, url: href });
                } else {
                    links.push({ title: text, url: href });
                }
            }
        });

        return { images, links, docs };
    }, [messages]);

    if (view === 'media') {
        return (
            <Stack sx={{ height: 1, position: 'relative', bgcolor: 'background.paper' }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ py: 2, px: 2, bgcolor: 'background.neutral' }}
                >
                    <IconButton onClick={() => setView('info')} sx={{ mr: 1 }}>
                        <Iconify icon={"solar:arrow-left-outline" as any} />
                    </IconButton>
                    <Typography variant="h6">{channel.displayName}</Typography>
                </Stack>

                <Tabs
                    value={tab}
                    onChange={(e, newValue) => setTab(newValue)}
                    sx={{
                        px: 2,
                        bgcolor: 'background.neutral',
                        '& .MuiTabs-indicator': { bgcolor: 'primary.main' }
                    }}
                >
                    <Tab label="Media" />
                    <Tab label="Links" />
                    <Tab label="Docs" />
                </Tabs>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                    {tab === 0 && (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 1,
                            }}
                        >
                            {sharedContent.images.map((img, index) => (
                                <Box
                                    key={index}
                                    component="img"
                                    src={img}
                                    sx={{
                                        width: 1,
                                        aspectRatio: '1/1',
                                        borderRadius: 1,
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        bgcolor: 'background.neutral',
                                    }}
                                    onClick={() => window.open(img, '_blank')}
                                />
                            ))}
                            {sharedContent.images.length === 0 && (
                                <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', width: 1, mt: 4 }}>
                                    No shared media
                                </Typography>
                            )}
                        </Box>
                    )}

                    {tab === 1 && (
                        <Stack spacing={1}>
                            {sharedContent.links.map((link, index) => (
                                <Box
                                    key={index}
                                    component="a"
                                    href={link.url}
                                    target="_blank"
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1,
                                        bgcolor: 'background.neutral',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Typography variant="subtitle2" noWrap>{link.title}</Typography>
                                </Box>
                            ))}
                            {sharedContent.links.length === 0 && (
                                <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', mt: 4 }}>
                                    No shared links
                                </Typography>
                            )}
                        </Stack>
                    )}

                    {tab === 2 && (
                        <Stack spacing={1}>
                            {sharedContent.docs.map((doc, index) => (
                                <Stack
                                    key={index}
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                    component="a"
                                    href={doc.url}
                                    target="_blank"
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1,
                                        bgcolor: 'background.neutral',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Iconify
                                        icon={"solar:file-text-bold-duotone" as any}
                                        sx={{ color: 'primary.main', width: 28, height: 28 }}
                                    />
                                    <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1 }}>
                                        {doc.name}
                                    </Typography>
                                </Stack>
                            ))}
                            {sharedContent.docs.length === 0 && (
                                <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', mt: 4 }}>
                                    No shared documents
                                </Typography>
                            )}
                        </Stack>
                    )}
                </Box>
            </Stack>
        );
    }

    return (
        <Stack sx={{ height: 1, position: 'relative', bgcolor: 'background.paper' }}>
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                sx={{ py: 2, px: 2, bgcolor: 'background.neutral' }}
            >
                <IconButton onClick={onClose} sx={{ mr: 1 }}>
                    <Iconify icon={"solar:arrow-left-outline" as any} />
                </IconButton>
                <Typography variant="h6">Contact Info</Typography>
            </Stack>

            <Divider />

            {/* Body */}
            <Stack sx={{ p: 4, alignItems: 'center' }} spacing={2}>
                <Avatar
                    alt={channel.displayName}
                    src={channel.channel_info?.avatar}
                    sx={{
                        width: 120,
                        height: 120,
                        fontSize: '3rem',
                        fontWeight: 'fontWeightBold',
                        color: channel.channel_info?.avatar ? 'text.secondary' : stringToDarkColor(channel.displayName || ''),
                        bgcolor: channel.channel_info?.avatar ? 'transparent' : stringToColor(channel.displayName || ''),
                    }}
                >
                    {channel.displayName?.charAt(0).toUpperCase()}
                </Avatar>

                <Stack alignItems="center">
                    <Typography variant="h6">{channel.displayName}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {channel.contact || ''}
                    </Typography>
                </Stack>
            </Stack>

            <Divider />

            {/* Media/Links Section */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => setView('media')}
                sx={{ px: 3, py: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            >
                <Typography variant="subtitle2">Media, links and docs</Typography>
                <Iconify icon={"eva:chevron-right-fill" as any} />
            </Stack>

            <Divider />

            {/* Actions */}
            <Box sx={{ p: 4, mt: 'auto', textAlign: 'center' }}>
                {isClosed ? (
                    <Stack direction="row" spacing={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="inherit"
                            size="large"
                            disabled
                            sx={{ borderRadius: 2, py: 1.5 }}
                        >
                            Closed
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={onReopenChannel}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: 'fontWeightBold',
                            }}
                        >
                            Reopen
                        </Button>
                    </Stack>
                ) : (
                    <Button
                        fullWidth
                        variant="contained"
                        color="error" // Fallback
                        size="large"
                        onClick={onCloseChannel}
                        sx={{
                            borderRadius: 2,
                            py: 1.5,
                            bgcolor: '#FF5630',
                            '&:hover': { bgcolor: '#B71D18' },
                            fontWeight: 'fontWeightBold',
                            boxShadow: 'none',
                        }}
                    >
                        Close Channel
                    </Button>
                )}
            </Box>
        </Stack>
    );
}
