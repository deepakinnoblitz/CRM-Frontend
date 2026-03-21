import { CONFIG } from 'src/config-global';

import { ExpenseReportView } from 'src/sections/report/expense/view/expense-report-view';

// ----------------------------------------------------------------------

export default function ExpenseReportPage() {
    return (
        <>
            <title>{`Expense Report - ${CONFIG.appName}`}</title>
            <ExpenseReportView />
        </>
    );
}
