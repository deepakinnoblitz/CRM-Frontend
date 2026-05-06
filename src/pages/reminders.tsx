import { CONFIG } from 'src/config-global';

import { RemindersView } from 'src/sections/reminders/view/reminders-view';

// ----------------------------------------------------------------------

export default function RemindersPage() {
  return (
    <>
      <title>{`Reminders List - ${CONFIG.appName}`}</title>
      <RemindersView />
    </>
  );
}
