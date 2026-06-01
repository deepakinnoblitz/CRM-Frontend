import { CONFIG } from 'src/config-global';

import CRMExpenseTrackerView from 'src/sections/crm-expense-tracker/view/crm-expense-tracker-view';

// ----------------------------------------------------------------------

export default function CRMExpenseTrackerPage() {
    return (
        <>
            <title>{`Expense Tracker - ${CONFIG.appName}`}</title>
            <CRMExpenseTrackerView />
        </>
    );
}
