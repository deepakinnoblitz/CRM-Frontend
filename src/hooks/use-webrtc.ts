import { Socket } from 'socket.io-client';
import { useState, useRef, useEffect, useCallback } from 'react';

import { chatApi } from 'src/api/chat';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

interface SignalData {
    type: 'offer' | 'answer' | 'ice-candidate' | 'reject' | 'hangup';
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidate;
    from: string;
    to: string;
    room: string;
    callType: 'audio' | 'video';
}

export function useWebRTC(userEmail: string, socket: Socket | null) {
    const [callState, setCallState] = useState<CallState>('idle');
    const [remoteUser, setRemoteUser] = useState<string | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callType, setCallType] = useState<'audio' | 'video'>('audio');

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const pendingCandidates = useRef<RTCIceCandidate[]>([]);
    const currentRoom = useRef<string | null>(null);

    const cleanup = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        setCallState('idle');
        setRemoteUser(null);
        pendingCandidates.current = [];
        currentRoom.current = null;
    }, [localStream]);

    const sendSignal = useCallback(async (data: Partial<SignalData>) => {
        try {
            await chatApi.sendCallSignal(data.to!, {
                ...data,
                from: userEmail,
            });
        } catch (error) {
            console.error('Error sending call signal:', error);
        }
    }, [userEmail]);

    const createPeerConnection = useCallback((targetUser: string, room: string, type: 'audio' | 'video') => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    to: targetUser,
                    room,
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                cleanup();
            }
        };

        pcRef.current = pc;
        return pc;
    }, [sendSignal, cleanup]);

    const startCall = useCallback(async (targetUser: string, room: string, type: 'audio' | 'video') => {
        try {
            setCallType(type);
            setRemoteUser(targetUser);
            setCallState('calling');
            currentRoom.current = room;

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Media devices are not available in this context (possibly insecure context).');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video',
            });
            setLocalStream(stream);

            const pc = createPeerConnection(targetUser, room, type);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            sendSignal({
                type: 'offer',
                sdp: offer,
                to: targetUser,
                room,
                callType: type,
            });
        } catch (error) {
            console.error('Error starting call:', error);
            cleanup();
        }
    }, [createPeerConnection, sendSignal, cleanup]);

    const acceptCall = useCallback(async () => {
        if (!remoteUser || !currentRoom.current) return;

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Media devices are not available in this context.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callType === 'video',
            });
            setLocalStream(stream);

            const pc = pcRef.current;
            if (!pc) return;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendSignal({
                type: 'answer',
                sdp: answer,
                to: remoteUser,
                room: currentRoom.current,
            });

            setCallState('connected');

            // Process any pending candidates
            pendingCandidates.current.forEach(candidate => {
                pc.addIceCandidate(candidate).catch(e => console.error('Error adding pending candidate', e));
            });
            pendingCandidates.current = [];
        } catch (error) {
            console.error('Error accepting call:', error);
            cleanup();
        }
    }, [remoteUser, callType, sendSignal, cleanup]);

    const rejectCall = useCallback(() => {
        if (remoteUser && currentRoom.current) {
            sendSignal({
                type: 'reject',
                to: remoteUser,
                room: currentRoom.current,
            });
        }
        cleanup();
    }, [remoteUser, sendSignal, cleanup]);

    const hangUp = useCallback(() => {
        if (remoteUser && currentRoom.current) {
            sendSignal({
                type: 'hangup',
                to: remoteUser,
                room: currentRoom.current,
            });
        }
        cleanup();
    }, [remoteUser, sendSignal, cleanup]);

    useEffect(() => {
        if (socket) {
            const handleSignal = async (data: SignalData) => {
                // Only process signals intended for us
                if (data.to !== userEmail) return;

                switch (data.type) {
                    case 'offer': {
                        if (callState !== 'idle') {
                            // Busy
                            socket.emit('call_signal', {
                                type: 'reject',
                                from: userEmail,
                                to: data.from,
                                room: data.room,
                                reason: 'busy',
                            });
                            return;
                        }
                        setRemoteUser(data.from);
                        setCallType(data.callType);
                        setCallState('incoming');
                        currentRoom.current = data.room;

                        const pc = createPeerConnection(data.from, data.room, data.callType);
                        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp!));
                        break;
                    }

                    case 'answer':
                        if (pcRef.current) {
                            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp!));
                            setCallState('connected');
                        }
                        break;

                    case 'ice-candidate':
                        if (pcRef.current && pcRef.current.remoteDescription) {
                            await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate!));
                        } else {
                            pendingCandidates.current.push(new RTCIceCandidate(data.candidate!));
                        }
                        break;

                    case 'reject':
                        cleanup();
                        break;

                    case 'hangup':
                        cleanup();
                        break;

                    default:
                        break;
                }
            };

            socket.on('call_signal', handleSignal);

            return () => {
                socket.off('call_signal', handleSignal);
            };
        }
        return undefined;
    }, [socket, userEmail, callState, createPeerConnection, cleanup]);

    return {
        callState,
        remoteUser,
        localStream,
        remoteStream,
        callType,
        startCall,
        acceptCall,
        rejectCall,
        hangUp,
        toggleAudio: () => {
            if (localStream) {
                const audioTrack = localStream.getAudioTracks()[0];
                if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
            }
        },
        toggleVideo: () => {
            if (localStream) {
                const videoTrack = localStream.getVideoTracks()[0];
                if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
            }
        },
    };
}
