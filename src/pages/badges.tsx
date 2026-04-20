import { CONFIG } from 'src/config-global';

import { BadgesView } from 'src/sections/badges/view/badges-view';

// ----------------------------------------------------------------------

export default function BadgesPage() {
  return (
    <>
      <title>{`Badges - ${CONFIG.appName}`}</title>
      <BadgesView />
    </>
  );
}
