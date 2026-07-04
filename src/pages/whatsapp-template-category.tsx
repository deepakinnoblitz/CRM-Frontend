import { CONFIG } from 'src/config-global';

import { WhatsAppTemplateCategoryView } from 'src/sections/master/whatsapp-template-category';

// ----------------------------------------------------------------------

export default function WhatsAppTemplateCategoryPage() {
  return (
    <>
      <title>{`WhatsApp Template Category - ${CONFIG.appName}`}</title>

      <WhatsAppTemplateCategoryView />
    </>
  );
}
