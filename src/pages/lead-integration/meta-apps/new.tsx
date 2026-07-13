import { CONFIG } from 'src/config-global';

import { MetaAppsCreateView } from 'src/sections/meta-app/view';

// ----------------------------------------------------------------------

export default function MetaAppsNewPage() {
    return (
        <>
            <title>{`New Meta App - ${CONFIG.appName}`}</title>
            <MetaAppsCreateView />
        </>
    );
}
