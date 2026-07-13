import { CONFIG } from 'src/config-global';

import { MetaPagesEditView } from 'src/sections/meta-page/view';

// ----------------------------------------------------------------------

export default function MetaPagesEditPage() {
    return (
        <>
            <title>{`Edit Meta Page - ${CONFIG.appName}`}</title>
            <MetaPagesEditView />
        </>
    );
}
