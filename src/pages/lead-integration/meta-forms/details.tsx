import { CONFIG } from 'src/config-global';

import { MetaFormsDetailsView } from 'src/sections/meta-form/view';

// ----------------------------------------------------------------------

export default function MetaFormsDetailsPage() {
    return (
        <>
            <title>{`Meta Form Details - ${CONFIG.appName}`}</title>
            <MetaFormsDetailsView />
        </>
    );
}
