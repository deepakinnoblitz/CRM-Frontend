import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailSettings } from 'src/sections/email-settings/view';

// ----------------------------------------------------------------------

export default function EmailSettingsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Email Settings: ${id} - ${CONFIG.appName}`}</title>

            <EmailSettings />
        </>
    );
}
