import { useState, useEffect, useCallback } from 'react';

import { fetchUnreadCounts, UnreadCounts } from 'src/api/unread-counts';

export function useUnreadCounts() {
    const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
        'Leave Application': 0,
        Request: 0,
        'WFH Attendance': 0,
    });

    const getUnreadCounts = useCallback(async () => {
        const data = await fetchUnreadCounts();
        setUnreadCounts(data);
    }, []);

    useEffect(() => {
        getUnreadCounts();

        // Polling every 30 seconds
        const interval = setInterval(getUnreadCounts, 30000);

        // Listen for manual refresh events
        const handleRefresh = () => {
            getUnreadCounts();
        };

        window.addEventListener('REFRESH_UNREAD_COUNTS', handleRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('REFRESH_UNREAD_COUNTS', handleRefresh);
        };
    }, [getUnreadCounts]);

    return { unreadCounts, refreshUnreadCounts: getUnreadCounts };
}
