import { CONFIG } from 'src/config-global';

import { MetaPagesDetailsView } from 'src/sections/meta-page/view';

// ----------------------------------------------------------------------

export default function MetaPagesDetailsPage() {
    return (
        <>
            <title>{`Meta Page Details - ${CONFIG.appName}`}</title>
            <MetaPagesDetailsView />
        </>
    );
}
