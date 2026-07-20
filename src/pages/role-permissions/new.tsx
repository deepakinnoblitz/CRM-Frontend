import { CONFIG } from 'src/config-global';

import { RolePermissionCreateView } from 'src/sections/user/view/role-permission-create-view';

// ----------------------------------------------------------------------

export default function RolePermissionCreatePage() {
    return (
        <>
            <title>{`New Role Permission - ${CONFIG.appName}`}</title>

            <RolePermissionCreateView />
        </>
    );
}
