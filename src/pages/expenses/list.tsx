import { CONFIG } from 'src/config-global';

import { ExpenseListView } from 'src/sections/expenses/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Expenses - ${CONFIG.appName}`}</title>

            <ExpenseListView />
        </>
    );
}
