import { CONFIG } from 'src/config-global';

import { MetaWebhookLogDetailsView } from 'src/sections/meta-webhook-log/view';

// ----------------------------------------------------------------------

export default function MetaWebhookLogViewPage() {
    return (
        <>
            <title>{`Webhook Log Details - ${CONFIG.appName}`}</title>
            <MetaWebhookLogDetailsView />
        </>
    );
}
