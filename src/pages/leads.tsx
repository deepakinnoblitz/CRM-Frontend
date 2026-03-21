import { CONFIG } from 'src/config-global';

import { LeadView } from 'src/sections/lead/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Leads - ${CONFIG.appName}`}</title>

      <LeadView />
    </>
  );
}
