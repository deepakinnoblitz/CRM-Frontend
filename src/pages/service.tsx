import { CONFIG } from 'src/config-global';

import { ServiceView } from 'src/sections/master/service/view/service-view';

// ----------------------------------------------------------------------

export default function ServicePage() {
  return (
    <>
      <title> {`Service - ${CONFIG.appName}`} </title>

      <ServiceView />
    </>
  );
}
