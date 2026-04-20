import { CONFIG } from 'src/config-global';

import { RenewalTrackerView } from 'src/sections/renewal-tracker/view/renewal-tracker-view';

// ----------------------------------------------------------------------

export default function RenewalTrackerPage() {
    return (
        <>
            <title>{`Renewal Tracker - ${CONFIG.appName}`}</title>
            <RenewalTrackerView />
        </>
    );
}
