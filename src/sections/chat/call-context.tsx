import React, { createContext, useContext, ReactNode } from 'react';

import { useWebRTC } from 'src/hooks/use-webrtc';
import { useSocket } from 'src/hooks/use-socket';

import ChatCallDialog from 'src/sections/chat/chat-call-dialog';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

type CallContextType = ReturnType<typeof useWebRTC>;

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};

// ----------------------------------------------------------------------

type Props = {
    children: ReactNode;
};

export function CallProvider({ children }: Props) {
    const { user } = useAuth();
    const { socket } = useSocket(user?.email);

    const webrtc = useWebRTC(user?.email, socket);

    return (
        <CallContext.Provider value={webrtc}>
            {children}
            <ChatCallDialog
                open={webrtc.callState !== 'idle'}
                onClose={() => { }}
                callState={webrtc.callState}
                callType={webrtc.callType}
                remoteUser={webrtc.remoteUser}
                localStream={webrtc.localStream}
                remoteStream={webrtc.remoteStream}
                onAccept={webrtc.acceptCall}
                onReject={webrtc.rejectCall}
                onHangUp={webrtc.hangUp}
                onToggleAudio={webrtc.toggleAudio}
                onToggleVideo={webrtc.toggleVideo}
                isAudioMuted={webrtc.isAudioMuted}
                isVideoDisabled={webrtc.isVideoDisabled}
            />
        </CallContext.Provider>
    );
}
