import { CONFIG } from 'src/config-global';

import { MetaAppsListView } from 'src/sections/meta-app/view';

// ----------------------------------------------------------------------

export default function MetaAppsListPage() {
    return (
        <>
            <title>{`Meta Apps - ${CONFIG.appName}`}</title>
            <MetaAppsListView />
        </>
    );
}
