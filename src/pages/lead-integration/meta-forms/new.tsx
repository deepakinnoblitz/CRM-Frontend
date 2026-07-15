import { CONFIG } from 'src/config-global';

import { MetaFormsCreateView } from 'src/sections/meta-form/view';

// ----------------------------------------------------------------------

export default function MetaFormsCreatePage() {
    return (
        <>
            <title>{`Create Meta Form - ${CONFIG.appName}`}</title>
            <MetaFormsCreateView />
        </>
    );
}
