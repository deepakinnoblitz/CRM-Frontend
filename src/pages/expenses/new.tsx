import { CONFIG } from 'src/config-global';

import { ExpenseCreateView } from 'src/sections/expenses/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`New Expense - ${CONFIG.appName}`}</title>

            <ExpenseCreateView />
        </>
    );
}
