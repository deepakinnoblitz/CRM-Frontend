import { CONFIG } from 'src/config-global';

import { JobOpeningsView } from 'src/sections/job-openings/view/job-openings-view';

// ----------------------------------------------------------------------

export default function JobOpeningsPage() {
    return (
        <>
        <title>{`Job Openings - ${CONFIG.appName}`}</title>
        <JobOpeningsView />
        </>
    );
}
