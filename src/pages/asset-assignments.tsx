import { CONFIG } from 'src/config-global';

import { AssetAssignmentsView } from 'src/sections/asset-assignments/view/asset-assignments-view';

export default function Page() {
    return (
        <>
            <title>{`Asset Assignments - ${CONFIG.appName}`}</title>
            <AssetAssignmentsView />
        </>
    );
}
