import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

/**
 * Fetch all countries from Frappe Country doctype
 */
export async function getCountries(): Promise<string[]> {
    try {
        const res = await frappeRequest('/api/method/frappe.client.get_list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                doctype: 'Country',
                fields: ['name'],
                limit_page_length: 0, // Get all countries
                order_by: 'name asc'
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(handleFrappeError(error, 'Failed to fetch countries'));
        }

        const data = await res.json();
        return data.message?.map((country: any) => country.name) || [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
}

/**
 * Fetch states for a given country
 */
export async function getStates(country: string): Promise<string[]> {
    try {
        const res = await frappeRequest('/api/method/company.company.api.get_states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(handleFrappeError(error, 'Failed to fetch states'));
        }

        const data = await res.json();
        return data.message || [];
    } catch (error) {
        console.error('Error fetching states:', error);
        return [];
    }
}

/**
 * Fetch cities for a given country and state
 */
export async function getCities(country: string, state: string): Promise<string[]> {
    try {
        const res = await frappeRequest('/api/method/company.company.api.get_cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country, state }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(handleFrappeError(error, 'Failed to fetch cities'));
        }

        const data = await res.json();
        return data.message || [];
    } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
}
