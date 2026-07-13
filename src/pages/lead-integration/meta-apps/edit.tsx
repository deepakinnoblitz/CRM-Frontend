import { CONFIG } from 'src/config-global';

import { MetaAppsEditView } from 'src/sections/meta-app/view';

// ----------------------------------------------------------------------

export default function MetaAppsEditPage() {
    return (
        <>
            <title>{`Edit Meta App - ${CONFIG.appName}`}</title>
            <MetaAppsEditView />
        </>
    );
}
