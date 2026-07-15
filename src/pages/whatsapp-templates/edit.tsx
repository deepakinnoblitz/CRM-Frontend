import { CONFIG } from 'src/config-global';

import { WhatsAppTemplateEditView } from 'src/sections/whatsapp-templates/view';

// ----------------------------------------------------------------------

export default function WhatsAppTemplateEditPage() {
    return (
        <>
            <title>{`Edit WhatsApp Template - ${CONFIG.appName}`}</title>
            <WhatsAppTemplateEditView />
        </>
    );
}
