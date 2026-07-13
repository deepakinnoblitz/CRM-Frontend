import { CONFIG } from 'src/config-global';

import { MetaFormsListView } from 'src/sections/meta-form/view';

// ----------------------------------------------------------------------

export default function MetaFormsListPage() {
    return (
        <>
            <title>{`Meta Forms - ${CONFIG.appName}`}</title>
            <MetaFormsListView />
        </>
    );
}
