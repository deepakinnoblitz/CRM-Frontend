import { CONFIG } from 'src/config-global';

import { WhatsAppTemplateDetailsView } from 'src/sections/whatsapp-templates/view';

// ----------------------------------------------------------------------

export default function WhatsAppTemplateDetailsPage() {
    return (
        <>
            <title>{`WhatsApp Template Details - ${CONFIG.appName}`}</title>
            <WhatsAppTemplateDetailsView />
        </>
    );
}
