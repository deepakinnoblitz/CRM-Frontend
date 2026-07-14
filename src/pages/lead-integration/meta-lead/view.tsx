import { CONFIG } from 'src/config-global';

import { MetaLeadDetailsView } from 'src/sections/meta-lead/view';

// ----------------------------------------------------------------------

export default function MetaLeadDetailsPage() {
    return (
        <>
            <title>{`Meta Lead Details - ${CONFIG.appName}`}</title>
            <MetaLeadDetailsView />
        </>
    );
}
