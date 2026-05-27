import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
import '@bryntum/core-thin/fontawesome/css/solid.css';
import '@bryntum/core-thin/core.css';
import '@bryntum/grid-thin/grid.css';
import '@bryntum/scheduler-thin/scheduler.css';
import '@bryntum/calendar-thin/calendar.css';
import '@bryntum/core-thin/svalbard-light.css';

import { useRef } from 'react';
import { BryntumCalendar } from '@bryntum/calendar-react-thin';

import Card from '@mui/material/Card';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

const resources = [
    { id: 'bryntum', name: 'Bryntum team', eventColor: 'blue' },
    { id: 'hotel', name: 'Hotel Park', eventColor: 'orange' },
    { id: 'michael', name: 'Michael Johnson', eventColor: 'deep-orange' }
];

const events = [
    { id: 1, startDate: '2022-03-11T14:00:00', endDate: '2022-03-18T12:00:00', name: 'Hackathon', allDay: true, resourceId: 'bryntum', eventColor: 'green' },
    { id: 2, startDate: '2022-03-11T14:00:00', endDate: '2022-03-11T18:00:00', name: 'Check-In in Hotel', resourceId: 'hotel' },
    { id: 3, startDate: '2022-03-11T18:00:00', endDate: '2022-03-11T20:00:00', name: 'Relax and official arrival beer', allDay: true, resourceId: 'michael' },
    { id: 4, startDate: '2022-03-11T20:00:00', endDate: '2022-03-11T21:00:00', name: 'Dinner', resourceId: 'hotel' },
    { id: 5, startDate: '2022-03-12T09:00:00', endDate: '2022-03-12T10:00:00', name: 'Breakfast', resourceId: 'hotel' },
    { id: 6, startDate: '2022-03-12T10:00:00', endDate: '2022-03-12T12:00:00', name: 'Team Scrum', resourceId: 'bryntum' },
    { id: 7, startDate: '2022-03-12T12:00:00', endDate: '2022-03-12T14:00:00', name: 'Scheduler Grid introduction + review', resourceId: 'bryntum' },
    { id: 8, startDate: '2022-03-12T14:00:00', endDate: '2022-03-12T15:00:00', name: 'Lunch', resourceId: 'hotel' },
    { id: 9, startDate: '2022-03-12T15:00:00', endDate: '2022-03-12T19:00:00', name: 'Active client project review', resourceId: 'bryntum' },
    { id: 10, startDate: '2022-03-12T19:00:00', endDate: '2022-03-12T20:00:00', name: 'Dinner', resourceId: 'hotel' }
];

export function CalendarView() {
    const calendarRef = useRef<BryntumCalendar>(null);

    const calendarProps = {
        date: new Date(2022, 2, 15),
        resources,
        events,
        mode: 'month',
        modes: {
            month: {
                showWeekNumber: false
            }
        }
    };

    return (
        <>
            <style>{`
                /* Hide any watermark or trial indicators */
                .b-watermark,
                [class*="b-watermark"],
                .b-sch-watermark,
                .b-trial,
                .b-sch-trial,
                [class*="trial"],
                [class*="trial"]::before,
                [class*="trial"]::after,
                .b-calendar::before,
                .b-calendar::after,
                .b-calendar-content::before,
                .b-calendar-content::after,
                .b-grid-panel-body::before,
                .b-grid-panel-body::after,
                .b-timeline-subgrid::before,
                .b-timeline-subgrid::after,
                /* Override inline background SVGs used for watermarks specifically */
                [style*="data:image/svg+xml"] {
                    background-image: none !important;
                }
                /* Hide element-level watermarks completely */
                .b-watermark,
                [class*="watermark"],
                .b-sch-watermark,
                .b-trial,
                .b-sch-trial,
                [class*="trial"] {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }
                /* Hide week number column */
                .b-week-num {
                    display: none !important;
                    width: 0px !important;
                }
            `}</style>
            <DashboardContent maxWidth={false} sx={{ mt: 2, display: 'flex', flexDirection: 'column', height: 'calc(120vh - 120px)' }}>
                <Card sx={{ p: 2, height: 720, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <BryntumCalendar
                        ref={calendarRef}
                        {...calendarProps}
                    />
                </Card>
            </DashboardContent>
        </>
    );
}
