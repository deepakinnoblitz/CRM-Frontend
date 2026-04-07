import { CONFIG } from 'src/config-global';

import { DesignationView } from 'src/sections/master/designation/view/designation-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Designation - ${CONFIG.appName}`}</title>
      <DesignationView />
    </>
  );
}
