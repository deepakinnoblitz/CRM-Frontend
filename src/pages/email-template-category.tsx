import { CONFIG } from 'src/config-global';

import { EmailTemplateCategoryView } from 'src/sections/master/email-template-category';

// ----------------------------------------------------------------------

export default function EmailTemplateCategoryPage() {
  return (
    <>
      <title>{`Email Template Category - ${CONFIG.appName}`}</title>

      <EmailTemplateCategoryView />
    </>
  );
}
