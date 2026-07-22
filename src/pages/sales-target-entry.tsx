import { CONFIG } from 'src/config-global';

import { SalesTargetEntryView } from 'src/sections/sales-target-entry/view/sales-target-entry-view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Sales Target Entry - ${CONFIG.appName}`}</title>

            <SalesTargetEntryView />
        </>
    );
}
