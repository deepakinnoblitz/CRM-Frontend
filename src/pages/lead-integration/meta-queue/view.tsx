import { CONFIG } from 'src/config-global';

import { MetaQueueDetailsView } from 'src/sections/meta-queue/view';

// ----------------------------------------------------------------------

export default function MetaQueueViewPage() {
    return (
        <>
            <title>{`Meta Queue Details - ${CONFIG.appName}`}</title>
            <MetaQueueDetailsView />
        </>
    );
}
