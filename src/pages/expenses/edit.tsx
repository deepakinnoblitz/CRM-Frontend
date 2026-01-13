import { CONFIG } from 'src/config-global';

import { ExpenseEditView } from 'src/sections/expenses/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Edit Expense - ${CONFIG.appName}`}</title>

            <ExpenseEditView />
        </>
    );
}
