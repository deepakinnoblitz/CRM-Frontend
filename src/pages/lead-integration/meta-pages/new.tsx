import { CONFIG } from 'src/config-global';

import { MetaPagesCreateView } from 'src/sections/meta-page/view';

// ----------------------------------------------------------------------

export default function MetaPagesCreatePage() {
    return (
        <>
            <title>{`Create Meta Page - ${CONFIG.appName}`}</title>
            <MetaPagesCreateView />
        </>
    );
}
