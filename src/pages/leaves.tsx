import { useSearchParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { LeavesView } from 'src/sections/leaves/view/leaves-view';
import { LeaveAllocationView } from 'src/sections/leaves/allocations/leave-allocation-view';

export default function Page() {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const isAllocation = type === 'allocate';

    return (
        <>
            <title>{`${isAllocation ? 'Leave Allocation' : 'Leaves'} - ${CONFIG.appName}`}</title>
            {isAllocation ? <LeaveAllocationView /> : <LeavesView />}
        </>
    );
}
