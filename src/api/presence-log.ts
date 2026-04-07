import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

// ----------------------------------------------------------------------

export async function fetchDetailedSessions(
    limitStart: number = 0,
    limitPageLength: number = 20,
    dateSearch: string = '',
    status: string = 'all',
    sortBy: string = 'login_date_desc',
    employee?: string,
    day?: string,
    date?: string
) {
    const params = new URLSearchParams();
    params.append('limit_start', limitStart.toString());
    params.append('limit_page_length', limitPageLength.toString());
    if (dateSearch) params.append('date_search', dateSearch);
    if (status !== 'all') params.append('status', status);
    if (sortBy) params.append('sort_by', sortBy);
    if (employee && employee !== 'all') params.append('employee', employee);
    if (day && day !== 'all') params.append('day', day);
    if (date) params.append('date', date);

    const res = await frappeRequest(`/api/method/company.company.presence_api.get_detailed_sessions?${params.toString()}`);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, 'Failed to fetch detailed sessions'));
    }

    const data = await res.json();
    return data.message || { data: [], total_count: 0 };
}
