import { CONFIG } from 'src/config-global';

import { WhatsAppTemplateCreateView } from 'src/sections/whatsapp-templates/view';

// ----------------------------------------------------------------------

export default function WhatsAppTemplateCreatePage() {
    return (
        <>
            <title>{`New WhatsApp Template - ${CONFIG.appName}`}</title>
            <WhatsAppTemplateCreateView />
        </>
    );
}
