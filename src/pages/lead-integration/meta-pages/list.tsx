import { CONFIG } from 'src/config-global';

import { MetaPagesListView } from 'src/sections/meta-page/view';

// ----------------------------------------------------------------------

export default function MetaPagesListPage() {
    return (
        <>
            <title>{`Meta Pages - ${CONFIG.appName}`}</title>
            <MetaPagesListView />
        </>
    );
}
