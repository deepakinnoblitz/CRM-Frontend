import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { ExpenseDetailsView } from 'src/sections/expenses/view';

// ----------------------------------------------------------------------

export default function Page() {
    const { id } = useParams();

    return (
        <>
            <title>{`Expense Details - ${CONFIG.appName}`}</title>

            <ExpenseDetailsView id={id} />
        </>
    );
}
