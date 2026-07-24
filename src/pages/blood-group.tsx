import { CONFIG } from 'src/config-global';

import { BloodGroupView } from 'src/sections/master/blood-group/view/blood-group-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Blood Group List - ${CONFIG.appName}`}</title>
      <BloodGroupView />
    </>
  );
}
