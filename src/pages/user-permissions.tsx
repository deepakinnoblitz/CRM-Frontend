import { CONFIG } from 'src/config-global';

import { UserPermissionView } from 'src/sections/user-permission/view';

// ----------------------------------------------------------------------

const metadata = { title: `User Permission - ${CONFIG.appName}` };

export default function Page() {
    return (
        <>
            <title> {metadata.title}</title>

            <UserPermissionView />
        </>
    );
}
