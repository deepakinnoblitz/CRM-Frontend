import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useState, useCallback } from 'react';

export function useSocket(userEmail?: string) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (userEmail) {
            // Using port 9025 from common_site_config.json
            // Dynamic site detection for Frappe namespaces
            // Priority: Explicit host mapping -> Window hostname -> Default development site
            const getSiteName = () => {
                const host = window.location.hostname;
                if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('erp.localhost')) {
                    return 'erp.localhost.innoblitz';
                }
                return host; // In production, usually the hostname is the site name
            };

            const siteName = getSiteName();
            const socketHost = window.location.hostname === 'localhost'
                ? `http://localhost:9025/${siteName}`
                : `${window.location.protocol}//${window.location.hostname}:9025/${siteName}`;

            const socket = io(socketHost, {
                path: '/socket.io',
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                withCredentials: true,
                query: { site: siteName }
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                setIsConnected(true);
                socket.emit('subscribe_user', userEmail);
            });

            socket.on('disconnect', () => {
                setIsConnected(false);
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            return () => {
                socket.disconnect();
            };
        }
        return undefined;
    }, [userEmail]);

    const subscribeToRoom = useCallback((roomName: string) => {
        if (socketRef.current) {
            socketRef.current.emit('subscribe_doctype', roomName);
        }
    }, []);

    const subscribeToEvent = useCallback(
        (event: string, handler: (data: any) => void) => {
            socketRef.current?.on(event, handler);
            return () => {
                socketRef.current?.off(event, handler);
            };
        },
        []
    );

    return {
        socket: socketRef.current,
        isConnected,
        subscribeToRoom,
        subscribeToEvent,
    };
}
