import { CONFIG } from 'src/config-global';

import { AssetRequestsView } from 'src/sections/asset-requests/view/asset-requests-view';

export default function AssetRequestsPage() {
    return (
        <>
            <title>{`Assets - ${CONFIG.appName}`}</title>
            <AssetRequestsView />
        </>
    );
}