import { CONFIG } from 'src/config-global';

import ExpenseTrackerView from 'src/sections/expense-tracker/view/expense-tracker-view';

// ----------------------------------------------------------------------

export default function ExpenseTrackerPage() {
  return (
    <>
      <title>{`Expense Tracker - ${CONFIG.appName}`}</title>
      <ExpenseTrackerView />
    </>
  );
}
