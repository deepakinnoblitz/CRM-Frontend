import { useState, useEffect, useRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { IconButton, CircularProgress } from '@mui/material';

import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';

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
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const isFirstLoadRef = useRef(true);

    const loadMessages = useCallback(async (start = 0, append = false) => {
        if (!lead?.phone_number) return;
        try {
            const limit = 10;
            const res = await frappeRequest(
                `/api/method/company.company.crm_whatsapp_api.get_whatsapp_messages?phone=${encodeURIComponent(lead.phone_number)}&start=${start}&limit=${limit}`
            );
            if (res.ok) {
                const data = await res.json();
                const fetchedMessages = data.message || [];
                
                if (fetchedMessages.length < limit) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (append) {
                    const container = scrollContainerRef.current;
                    const oldScrollHeight = container ? container.scrollHeight : 0;
                    
                    setMessages((prev) => [...fetchedMessages, ...prev]);
                    
                    setTimeout(() => {
                        if (container) {
                            container.scrollTop = container.scrollHeight - oldScrollHeight;
                        }
                    }, 0);
                } else {
                    setMessages(fetchedMessages);
                    if (isFirstLoadRef.current) {
                        setTimeout(() => {
                            if (chatEndRef.current) {
                                chatEndRef.current.scrollIntoView({ behavior: 'auto' });
                            }
                            isFirstLoadRef.current = false;
                        }, 50);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load WhatsApp messages:', error);
        }
    }, [lead?.phone_number]);

    // Initial load
    useEffect(() => {
        if (open && lead?.phone_number) {
            setLoading(true);
            isFirstLoadRef.current = true;
            setHasMore(true);
            loadMessages(0, false).finally(() => setLoading(false));
        } else {
            setMessages([]);
        }
    }, [open, lead?.phone_number, loadMessages]);

    // Polling for new messages
    useEffect(() => {
        let interval: any;
        if (open && lead?.phone_number) {
            interval = setInterval(async () => {
                try {
                    const res = await frappeRequest(
                        `/api/method/company.company.crm_whatsapp_api.get_whatsapp_messages?phone=${encodeURIComponent(lead.phone_number)}&start=0&limit=10`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        const latestMessages = data.message || [];
                        
                        setMessages((prev) => {
                            const prevIds = new Set(prev.map(m => m.name));
                            const newMsgs = latestMessages.filter((m: any) => !prevIds.has(m.name));
                            if (newMsgs.length > 0) {
                                const container = scrollContainerRef.current;
                                const isNearBottom = container ? (container.scrollHeight - container.scrollTop - container.clientHeight < 120) : false;
                                
                                const updated = [...prev, ...newMsgs];
                                
                                if (isNearBottom) {
                                    setTimeout(() => {
                                        if (chatEndRef.current) {
                                            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }, 50);
                                }
                                return updated;
                            }
                            return prev;
                        });
                    }
                } catch (error) {
                    console.error('Failed to poll WhatsApp messages:', error);
                }
            }, 4000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [open, lead?.phone_number]);

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        if (container.scrollTop === 0 && hasMore && !loadingMore && messages.length > 0) {
            setLoadingMore(true);
            await loadMessages(messages.length, true);
            setLoadingMore(false);
        }
    };

    const handleSend = async () => {
        if (!messageText.trim() || !lead?.phone_number || sending) return;
        setSending(true);
        try {
            const headers = await getAuthHeaders();
            const res = await frappeRequest(
                '/api/method/company.company.crm_whatsapp_api.send_whatsapp',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        phone: lead.phone_number,
                        message: messageText,
                    }),
                }
            );

            if (res.ok) {
                const responseData = await res.json();
                if (responseData.message?.success) {
                    setMessageText('');
                    await loadMessages(0, false);
                    setTimeout(() => {
                        if (chatEndRef.current) {
                            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 50);
                } else {
                    console.error('Error sending WhatsApp message:', responseData.message?.error);
                }
            }
        } catch (error) {
            console.error('Failed to send WhatsApp message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatMessageTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

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

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: 600, overflow: 'hidden' }}>
                <Box
                    sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
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
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    sx={{
                        flexGrow: 1,
                        p: 2,
                        bgcolor: '#ECE5DD',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                    }}
                >
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress size={32} sx={{ color: '#25D366' }} />
                        </Box>
                    ) : messages.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.secondary' }}>
                            <Typography variant="body2">No messages yet. Send a message to start the conversation.</Typography>
                        </Box>
                    ) : (
                        <>
                            {loadingMore && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                                    <CircularProgress size={20} sx={{ color: '#25D366' }} />
                                </Box>
                            )}
                            {messages.map((msg) => {
                                const isOutgoing = msg.message_direction === 'Outgoing';
                                return (
                                    <Box
                                        key={msg.name}
                                        sx={{
                                            maxWidth: '75%',
                                            alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                                            bgcolor: isOutgoing ? '#DCF8C6' : '#fff',
                                            borderRadius: 2,
                                            p: 1.5,
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                                            position: 'relative',
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', pr: 4 }}>
                                            {msg.message_content}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: '0.65rem',
                                                color: 'text.secondary',
                                                display: 'block',
                                                textAlign: 'right',
                                                mt: 0.5,
                                            }}
                                        >
                                            {formatMessageTime(msg.creation)}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </>
                    )}
                    <div ref={chatEndRef} />
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2,
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
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={sending}
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
                        onClick={handleSend}
                        disabled={sending || !messageText.trim()}
                        startIcon={
                            sending ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <Iconify
                                    icon="solar:plain-bold"
                                    width={18}
                                />
                            )
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