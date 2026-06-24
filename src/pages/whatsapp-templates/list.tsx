import { CONFIG } from 'src/config-global';

import { WhatsAppTemplateListView } from 'src/sections/whatsapp-templates/view';

// ----------------------------------------------------------------------

export default function WhatsAppTemplateListPage() {
    return (
        <>
            <title>{`WhatsApp Templates - ${CONFIG.appName}`}</title>
            <WhatsAppTemplateListView />
        </>
    );
}
