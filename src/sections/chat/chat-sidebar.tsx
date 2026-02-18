import { useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';

import { stripHtml } from 'src/utils/string';
import { fDateTime, fToChatTime } from 'src/utils/format-time';
import { stringToColor, stringToDarkColor } from 'src/utils/color-utils';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    user: any;
    channels: any[];
    selectedChannel: any;
    onSelectChannel: (channel: any) => void;
    onOpenContacts: () => void;
    loading: boolean;
};

export default function ChatSidebar({ user, channels, selectedChannel, onSelectChannel, onOpenContacts, loading }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChannels = (Array.isArray(channels) ? channels : []).filter((channel) =>
        channel.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const renderLoading = (
        <Stack spacing={2} sx={{ p: 3 }}>
            {[...Array(5)].map((_, index) => (
                <Stack key={index} direction="row" alignItems="center" spacing={2}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Stack spacing={1} sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" sx={{ width: 0.5, height: 16 }} />
                        <Skeleton variant="text" sx={{ width: 0.8, height: 12 }} />
                    </Stack>
                </Stack>
            ))}
        </Stack>
    );


    return (
        <Box
            sx={{
                width: 320,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2, pb: 1 }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'fontWeightBold' }}>InnoChat</Typography>
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" color="inherit" onClick={onOpenContacts}>
                        <Iconify icon="mingcute:add-line" width={24} />
                    </IconButton>
                    <IconButton size="small" color="inherit">
                        <Iconify icon="mingcute:close-line" width={24} />
                    </IconButton>
                </Stack>
            </Stack>

            <Box sx={{ px: 2, pb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                        sx: { bgcolor: 'background.neutral', border: 'none', '& fieldset': { border: 'none' } }
                    }}
                />
            </Box>

            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                // Hide scrollbar for Chrome, Safari and Opera
                '&::-webkit-scrollbar': {
                    display: 'none'
                },
                // Hide scrollbar for IE, Edge and Firefox
                msOverflowStyle: 'none',  // IE and Edge
                scrollbarWidth: 'none',  // Firefox
            }}>
                {loading ? renderLoading : (
                    <List disablePadding>
                        {filteredChannels.map((channel) => (
                            <ListItemButton
                                key={channel.room}
                                selected={selectedChannel?.room === channel.room}
                                onClick={() => onSelectChannel(channel)}
                                sx={{
                                    py: 1,
                                    px: 2.5,
                                    borderRadius: 1.5, // Rounded corners for better aesthetics
                                    mb: 0.5, // Slight spacing between items
                                    '&.Mui-selected': {
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08), // Lighter selected background
                                        '&:hover': {
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                                        }
                                    },
                                }}
                            >
                                <Box sx={{ position: 'relative', mr: 2 }}>
                                    <Badge
                                        color="error"
                                        badgeContent={channel.user_unread_messages}
                                        invisible={channel.user_unread_messages === 0}
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                right: 2,
                                                top: 2,
                                                border: (theme) => `solid 2px ${theme.palette.background.paper}`,
                                            }
                                        }}
                                    >
                                        <Avatar
                                            alt={channel.displayName}
                                            src={channel.channel_info?.avatar}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                fontWeight: 'fontWeightBold',
                                                color: channel.channel_info?.avatar ? 'text.secondary' : stringToDarkColor(channel.displayName || ''),
                                                bgcolor: channel.channel_info?.avatar ? 'transparent' : stringToColor(channel.displayName || ''),
                                            }}
                                        >
                                            {channel.displayName?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Badge>
                                </Box>

                                <ListItemText
                                    primary={channel.displayName}
                                    primaryTypographyProps={{
                                        noWrap: true,
                                        variant: 'subtitle2',
                                        sx: { fontWeight: 'fontWeightBold', fontSize: '14px' }
                                    }}
                                    secondary={
                                        (() => {
                                            const content = channel.last_message || '';
                                            if (content.includes('recording') || content.includes('<audio')) {
                                                return (
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <Iconify icon={"solar:microphone-bold" as any} width={14} />
                                                        <span>Audio Message</span>
                                                    </Stack>
                                                );
                                            }
                                            if (content.includes('<img')) {
                                                return (
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <Iconify icon={"solar:gallery-bold" as any} width={14} />
                                                        <span>Image</span>
                                                    </Stack>
                                                );
                                            }
                                            if (content.includes('<a href')) {
                                                return (
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <Iconify icon={"solar:file-bold" as any} width={14} />
                                                        <span>File</span>
                                                    </Stack>
                                                );
                                            }
                                            return stripHtml(content);
                                        })()
                                    }
                                    secondaryTypographyProps={{
                                        noWrap: true,
                                        component: 'div',
                                        variant: 'caption',
                                        color: channel.user_unread_messages > 0 ? 'text.primary' : 'text.secondary',
                                        fontWeight: channel.user_unread_messages > 0 ? 'fontWeightBold' : 'fontWeightRegular',
                                        sx: { fontSize: '12px' }
                                    }}
                                />

                                <Stack alignItems="flex-end" sx={{ ml: 2, height: 40, justifyContent: 'center' }}>
                                    <Typography
                                        noWrap
                                        variant="caption"
                                        component="span"
                                        sx={{ color: 'text.disabled', fontSize: '11px' }}
                                    >
                                        {fToChatTime(channel.send_date)}
                                    </Typography>
                                </Stack>
                            </ListItemButton>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
}
