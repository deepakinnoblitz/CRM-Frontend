import { CONFIG } from 'src/config-global';

import { LeadFromView } from 'src/sections/master/lead-from';

// ----------------------------------------------------------------------

export default function LeadFromPage() {
  return (
    <>
      <title>{`Lead From - ${CONFIG.appName}`}</title>

      <LeadFromView />
    </>
  );
}
