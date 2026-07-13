import { CONFIG } from 'src/config-global';

import { MetaQueueListView } from 'src/sections/meta-queue/view';

// ----------------------------------------------------------------------

export default function MetaQueuePage() {
    return (
        <>
            <title>{`Meta Queue - ${CONFIG.appName}`}</title>
            <MetaQueueListView />
        </>
    );
}
