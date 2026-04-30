import { CONFIG } from 'src/config-global';

import { LeaveTypeView } from 'src/sections/master/leave-type/view/leave-type-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Leave Type - ${CONFIG.appName}`}</title>
      <LeaveTypeView />
    </>
  );
}
