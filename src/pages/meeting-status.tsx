import { CONFIG } from 'src/config-global';

import { MeetingStatusView } from 'src/sections/master/meeting-status';

// ----------------------------------------------------------------------

export default function MeetingStatusPage() {
  return (
    <>
      <title>{`Meeting Status - ${CONFIG.appName}`}</title>

      <MeetingStatusView />
    </>
  );
}
