import { useParams } from 'react-router-dom';

import { ExpenseForm } from '../expenses-form';

// ----------------------------------------------------------------------

export function ExpenseEditView() {
    const { id } = useParams();

    return <ExpenseForm id={id} />;
}
