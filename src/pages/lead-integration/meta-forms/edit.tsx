import { CONFIG } from 'src/config-global';

import { MetaFormsEditView } from 'src/sections/meta-form/view';

// ----------------------------------------------------------------------

export default function MetaFormsEditPage() {
    return (
        <>
            <title>{`Edit Meta Form - ${CONFIG.appName}`}</title>
            <MetaFormsEditView />
        </>
    );
}
