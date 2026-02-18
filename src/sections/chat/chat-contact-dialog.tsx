import { useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import InputAdornment from '@mui/material/InputAdornment';

import { stringToColor, stringToDarkColor } from 'src/utils/color-utils';

import { Iconify } from 'src/components/iconify';
// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    contacts: any[];
    onSelectContact: (contact: any) => void;
};

export default function ChatContactDialog({ open, onClose, contacts, onSelectContact }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredContacts = contacts.filter((contact) =>
        contact.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">New Conversation</Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <Box sx={{ p: 3, pt: 0 }}>
                <TextField
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contacts..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                            '& fieldset': { border: 'none' }, // Cleaner look
                            '&.Mui-focused': {
                                bgcolor: 'transparent',
                                '& fieldset': { border: (theme) => `solid 1px ${theme.palette.primary.main}` }
                            }
                        }
                    }}
                />

                <Box sx={{ height: 400, overflowY: 'auto' }}>
                    {filteredContacts.length > 0 ? (
                        <List disablePadding>
                            {filteredContacts.map((contact) => (
                                <ListItemButton
                                    key={contact.profile_id}
                                    onClick={() => onSelectContact(contact)}
                                    sx={{
                                        py: 1.5,
                                        px: 2,
                                        mb: 1,
                                        borderRadius: 1.5,
                                        '&:hover': {
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                        }
                                    }}
                                >
                                    <Avatar
                                        alt={contact.full_name}
                                        src={contact.user_image}
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            mr: 2,
                                            fontWeight: 'fontWeightBold',
                                            color: contact.user_image ? 'text.secondary' : stringToDarkColor(contact.full_name || ''),
                                            bgcolor: contact.user_image ? 'transparent' : stringToColor(contact.full_name || ''),
                                        }}
                                    >
                                        {contact.full_name?.charAt(0).toUpperCase()}
                                    </Avatar>

                                    <ListItemText
                                        primary={contact.full_name}
                                        secondary={contact.user_id}
                                        primaryTypographyProps={{ variant: 'subtitle2', sx: { mb: 0.5 } }}
                                        secondaryTypographyProps={{ variant: 'caption', noWrap: true, display: 'block' }}
                                    />

                                    <Iconify
                                        icon={"solar:chat-round-line-duotone" as any}
                                        sx={{
                                            color: 'primary.main',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            '.MuiListItemButton-root:hover &': { opacity: 1 }
                                        }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    ) : (
                        <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
                            <Iconify icon={"solar:user-block-rounded-line-duotone" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                No contacts found
                            </Typography>
                        </Stack>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
}
