import { CONFIG } from 'src/config-global';

import { MetaLeadListView } from 'src/sections/meta-lead/view';

// ----------------------------------------------------------------------

export default function MetaLeadPage() {
    return (
        <>
            <title>{`Meta Leads - ${CONFIG.appName}`}</title>
            <MetaLeadListView />
        </>
    );
}
