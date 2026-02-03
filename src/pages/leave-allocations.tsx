import { CONFIG } from 'src/config-global';

import { LeaveAllocationView } from 'src/sections/leaves/allocations/leave-allocation-view';

// ----------------------------------------------------------------------

export default function LeaveAllocationsPage() {
    return (
        <>
            <title>{`Leave Allocations - ${CONFIG.appName}`}</title>

            <LeaveAllocationView />
        </>
    );
}
