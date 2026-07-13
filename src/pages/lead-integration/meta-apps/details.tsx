import { CONFIG } from 'src/config-global';

import { MetaAppsDetailsView } from 'src/sections/meta-app/view';

// ----------------------------------------------------------------------

export default function MetaAppsDetailsPage() {
    return (
        <>
            <title>{`Meta App Details - ${CONFIG.appName}`}</title>
            <MetaAppsDetailsView />
        </>
    );
}
