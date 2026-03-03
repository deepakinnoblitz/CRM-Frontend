import { CONFIG } from 'src/config-global';

import ChatView from 'src/sections/chat/view/chat-view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Chat - ${CONFIG.appName}`}</title>
            <ChatView />
        </>
    );
}
