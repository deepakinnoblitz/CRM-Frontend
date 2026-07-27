import { CONFIG } from 'src/config-global';

import { CallStatusView } from 'src/sections/master/call-status';

// ----------------------------------------------------------------------

export default function CallStatusPage() {
  return (
    <>
      <title>{`Call Status - ${CONFIG.appName}`}</title>

      <CallStatusView />
    </>
  );
}
