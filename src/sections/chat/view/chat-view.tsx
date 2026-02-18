import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSocket } from 'src/hooks/use-socket';

import { chatApi } from 'src/api/chat';
import { getCurrentUserInfo } from 'src/api/auth';

import { Iconify } from 'src/components/iconify';

import ChatWindow from 'src/sections/chat/chat-window';
import ChatSidebar from 'src/sections/chat/chat-sidebar';
import ChatContactDialog from 'src/sections/chat/chat-contact-dialog';
import ChatPlaceholderIcon from 'src/sections/chat/chat-placeholder-icon';

// ----------------------------------------------------------------------

export default function ChatView() {
    const [user, setUser] = useState<any>(null);
    const [channels, setChannels] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<any>(null);
    const [openContacts, setOpenContacts] = useState(false);
    const [loading, setLoading] = useState(true);

    const { socket, isConnected, subscribeToRoom } = useSocket(user?.email);

    useEffect(() => {
        if (isConnected && channels.length > 0) {
            channels.forEach(channel => {
                subscribeToRoom(channel.room);
            });
        }
    }, [isConnected, channels, subscribeToRoom]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userInfo = await getCurrentUserInfo();
                setUser(userInfo);
            } catch (error) {
                console.error('Failed to fetch user info', error);
            }
        };
        fetchUser();
    }, []);

    const fetchChannels = useCallback(async () => {
        if (!user?.email) return;
        try {
            const data = await chatApi.getChannelsList(user.email);
            const channelList = data?.message?.results || [];
            setChannels(channelList);
        } catch (error) {
            console.error('Failed to fetch channels', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchContacts = useCallback(async () => {
        if (!user?.email) return;
        try {
            const data = await chatApi.getContacts(user.email);
            // Frappe returns {"message": {"results": [{"contacts": [...]}]}}
            const contactList = data?.message?.results?.[0]?.contacts || [];
            setContacts(contactList);
        } catch (error) {
            console.error('Failed to fetch contacts', error);
        }
    }, [user]);

    useEffect(() => {
        fetchChannels();
        fetchContacts();
    }, [fetchChannels, fetchContacts]);

    const enrichedChannels = channels.map(channel => {
        let displayName = channel.channel_name || channel.room;
        if (channel.type === 'Direct' && channel.contact) {
            const contact = contacts.find(c => c.user_id === channel.contact);
            if (contact) {
                displayName = contact.full_name;
            }
        }
        return { ...channel, displayName };
    });

    const enrichedSelectedChannel = selectedChannel
        ? enrichedChannels.find(c => c.room === selectedChannel.room) || selectedChannel
        : null;

    const handleStartConversation = useCallback(async (contact: any) => {
        if (!user?.email) return;

        // Check if a direct channel with this contact already exists
        const existingChannel = channels.find(c => c.type === 'Direct' && c.contact === contact.user_id);

        if (existingChannel) {
            setSelectedChannel(existingChannel);
            setOpenContacts(false);
            return;
        }

        try {
            const data = await chatApi.createChannel({
                channel_name: contact.full_name,
                users: JSON.stringify([
                    { email: user.email, platform: 'Chat' },
                    { email: contact.user_id, platform: 'Chat' }
                ]),
                type: 'Direct',
                last_message: '',
                creator_email: user.email,
                creator: user.full_name,
            });

            const newRoom = data?.message?.results?.[0]?.room;
            if (newRoom) {
                await fetchChannels();
                setOpenContacts(false);
                // We'll let enrichedChannels update and then we can select it
                // Or find it manually after fetch
            }
        } catch (error) {
            console.error('Failed to start conversation', error);
        }
    }, [user, channels, fetchChannels]);


    const selectedRef = useRef(selectedChannel);
    useEffect(() => {
        selectedRef.current = selectedChannel;
    }, [selectedChannel]);

    useEffect(() => {
        if (socket) {
            const handleGlobalMsg = (data: any) => {
                console.log('Socket global msg received:', data);

                setChannels((prev) => {
                    const index = prev.findIndex((c) => c.room === (data.room || data.room_name));
                    if (index !== -1) {
                        const updated = [...prev];
                        const isCurrentRoom = (data.room || data.room_name) === selectedRef.current?.room;

                        updated[index] = {
                            ...updated[index],
                            last_message: data.content || data.last_message,
                            send_date: data.send_date || data.utc_message_date || new Date().toISOString(),
                            user_unread_messages: isCurrentRoom
                                ? 0
                                : (updated[index].user_unread_messages || 0) + (data.sender_email !== user?.email ? 1 : 0),
                        };
                        return updated.sort((a, b) => new Date(b.send_date).getTime() - new Date(a.send_date).getTime());
                    }
                    // If it's a new room or we missed it, fetch everything
                    fetchChannels();
                    return prev;
                });
            };

            socket.on('msg', handleGlobalMsg);
            socket.on('update_room', handleGlobalMsg);

            return () => {
                socket.off('msg', handleGlobalMsg);
                socket.off('update_room', handleGlobalMsg);
            };
        }
        return undefined;
    }, [socket, fetchChannels, user?.email]);


    return (
        <Container maxWidth="xl">

            <Card sx={{ height: '82vh', display: 'flex', mt: 1 }}>
                <ChatSidebar
                    user={user}
                    channels={enrichedChannels}
                    selectedChannel={enrichedSelectedChannel}
                    onSelectChannel={setSelectedChannel}
                    onOpenContacts={() => setOpenContacts(true)}
                    loading={loading}
                />

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {enrichedSelectedChannel ? (
                        <ChatWindow
                            user={user}
                            channel={enrichedSelectedChannel}
                            socket={socket}
                            isConnected={isConnected}
                            onRefresh={fetchChannels}
                        />
                    ) : (
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            sx={{ height: 1, textAlign: 'center' }}
                        >
                            <Box
                                sx={{
                                    width: 300,
                                    height: 300,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mt: -10,
                                }}
                            >
                                <ChatPlaceholderIcon />
                            </Box>
                            <Typography variant="h5" sx={{ color: 'text.primary', mb: 1, mt: -3, }}>
                                Select a conversation
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Choose a contact from the left to start chatting
                            </Typography>
                        </Stack>
                    )}
                </Box>
            </Card>

            <ChatContactDialog
                open={openContacts}
                onClose={() => setOpenContacts(false)}
                contacts={contacts}
                onSelectContact={handleStartConversation}
            />
        </Container>
    );
}
