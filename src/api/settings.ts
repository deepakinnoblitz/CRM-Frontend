import { getHRDoc } from './hr-management';

export async function getHRMSSettings() {
    try {
        const settings = await getHRDoc('HRMS Settings', 'HRMS Settings');
        return settings;
    } catch (error) {
        console.error('Failed to fetch HRMS Settings:', error);
        return null;
    }
}
