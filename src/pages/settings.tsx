import { CONFIG } from 'src/config-global';

import { SettingsView } from 'src/sections/settings/view/settings-view';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <>
      <title> {`Settings - ${CONFIG.appName}`} </title>

      <SettingsView />
    </>
  );
}
