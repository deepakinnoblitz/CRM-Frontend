import { CONFIG } from 'src/config-global';

import { MyProfileView } from 'src/sections/employee/view/my-profile-view';

export default function Page() {
    return (
        <>
            <title>{`My Profile - ${CONFIG.appName}`}</title>
            <MyProfileView />
        </>
    );
}
