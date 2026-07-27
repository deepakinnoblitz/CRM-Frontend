import { CONFIG } from 'src/config-global';

import { RolePermissionListView } from 'src/sections/user/view/role-permission-list-view';

// ----------------------------------------------------------------------

export default function RolePermissionListPage() {
    return (
        <>
            <title>{`Role Permissions - ${CONFIG.appName}`}</title>

            <RolePermissionListView />
        </>
    );
}
