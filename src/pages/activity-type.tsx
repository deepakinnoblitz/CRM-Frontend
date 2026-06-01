import { CONFIG } from 'src/config-global';

import { ActivityTypeView } from 'src/sections/master/activity-type/view/activity-type-view';

// ----------------------------------------------------------------------

export default function ActivityTypePage() {
  return (
    <>
      <title>{`Activity Type List - ${CONFIG.appName}`}</title>
      <ActivityTypeView />
    </>
  );
}
