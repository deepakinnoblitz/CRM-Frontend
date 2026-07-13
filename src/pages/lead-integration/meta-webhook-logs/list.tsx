import { CONFIG } from 'src/config-global';

import { MetaWebhookLogListView } from 'src/sections/meta-webhook-log/view';

// ----------------------------------------------------------------------

export default function MetaWebhookLogsPage() {
    return (
        <>
            <title>{`Webhook Logs - ${CONFIG.appName}`}</title>
            <MetaWebhookLogListView />
        </>
    );
}
