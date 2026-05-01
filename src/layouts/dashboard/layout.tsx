import type { Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect } from 'react';
import { IoChatbubblesOutline } from "react-icons/io5";

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { useSocket } from 'src/hooks/use-socket';
import { useSettingsContext } from 'src/hooks/settings-context';
import { useDashboardView } from 'src/hooks/dashboard-view-context';
import { useUnreadCountsContext } from 'src/hooks/unread-counts-context';

import { CONFIG } from 'src/config-global';

import { Label } from 'src/components/label';

import { CallProvider } from 'src/sections/chat/call-context';
import ChatNotifications from 'src/sections/chat/chat-notifications';
import { UserStatusBar } from 'src/sections/overview/user-status-bar';
import { DashboardSwitcher } from 'src/sections/overview/dashboard-switcher';

import { useAuth } from 'src/auth/auth-context';

import { NavMobile, NavDesktop } from './nav';
import { layoutClasses } from '../core/classes';
import { _account } from '../nav-config-account';
import { dashboardLayoutVars } from './css-vars';
import { MainSection } from '../core/main-section';
import { getNavData } from '../nav-config-dashboard';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { AccountPopover } from '../components/account-popover';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const { settings } = useSettingsContext();
  const { user } = useAuth();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const { socket } = useSocket(user?.email);

  const { unreadCounts } = useUnreadCountsContext();

  const { view } = useDashboardView();

  const { navData } = useMemo(() => {
    console.log('Recalculating navData for view:', view);
    const result = getNavData(user?.roles, view, settings);

    // Inject unread counts into navData
    result.navData.forEach((item: any) => {
      item.info = undefined;
      // Check main items
      if (
        (item.title === 'Leave Application') &&
        unreadCounts.counts['Leave Application'] > 0
      ) {
        item.info = (
          <Label
            color="error"
            variant="filled"
            sx={{
              height: 20,
              minWidth: 20,
              fontSize: '0.75rem',
              px: 0.5,
              borderRadius: 0.75,
              fontWeight: 'bold',
            }}
          >
            {unreadCounts.counts['Leave Application']}
          </Label>
        );
      }
      if ((item.title === 'Request List') && unreadCounts.counts.Request > 0) {
        item.info = (
          <Label
            color="error"
            variant="filled"
            sx={{
              height: 20,
              minWidth: 20,
              fontSize: '0.75rem',
              px: 0.5,
              borderRadius: 0.75,
              fontWeight: 'bold',
            }}
          >
            {unreadCounts.counts.Request}
          </Label>
        );
      }
      if (
        (item.title === 'WFH Attendance') &&
        unreadCounts.counts['WFH Attendance'] > 0
      ) {
        item.info = (
          <Label
            color="error"
            variant="filled"
            sx={{
              height: 20,
              minWidth: 20,
              fontSize: '0.75rem',
              px: 0.5,
              borderRadius: 0.75,
              fontWeight: 'bold',
            }}
          >
            {unreadCounts.counts['WFH Attendance']}
          </Label>
        );
      }

      // Aggregation for Parent Items
      if (item.children) {
        let groupCount = 0;
        item.children.forEach((child: any) => {
          child.info = undefined;
          if (child.title === 'Leave Application' && unreadCounts.counts['Leave Application'] > 0) {
            child.info = (
              <Label
                color="error"
                variant="filled"
                sx={{
                  height: 18,
                  minWidth: 18,
                  fontSize: '0.7rem',
                  px: 0.5,
                  borderRadius: 0.5,
                  fontWeight: 'bold',
                }}
              >
                {unreadCounts.counts['Leave Application']}
              </Label>
            );
            groupCount += unreadCounts.counts['Leave Application'];
          }
          if (child.title === 'WFH Attendance' && unreadCounts.counts['WFH Attendance'] > 0) {
            child.info = (
              <Label
                color="error"
                variant="filled"
                sx={{
                  height: 18,
                  minWidth: 18,
                  fontSize: '0.7rem',
                  px: 0.5,
                  borderRadius: 0.5,
                  fontWeight: 'bold',
                }}
              >
                {unreadCounts.counts['WFH Attendance']}
              </Label>
            );
            groupCount += unreadCounts.counts['WFH Attendance'];
          }
          if (child.title === 'Request List' && unreadCounts.counts.Request > 0) {
            child.info = (
              <Label
                color="error"
                variant="filled"
                sx={{
                  height: 18,
                  minWidth: 18,
                  fontSize: '0.7rem',
                  px: 0.5,
                  borderRadius: 0.5,
                  fontWeight: 'bold',
                }}
              >
                {unreadCounts.counts.Request}
              </Label>
            );
            groupCount += unreadCounts.counts.Request;
          }
          if (child.title === 'Reimbursement Claim List' && unreadCounts.counts['Reimbursement Claim'] > 0) {
            child.info = (
              <Label
                color="error"
                variant="filled"
                sx={{
                  height: 18,
                  minWidth: 18,
                  fontSize: '0.7rem',
                  px: 0.5,
                  borderRadius: 0.5,
                  fontWeight: 'bold',
                }}
              >
                {unreadCounts.counts['Reimbursement Claim']}
              </Label>
            );
            groupCount += unreadCounts.counts['Reimbursement Claim'];
          }
        });


        // If any children had unread counts, show the total on the parent item
        if (groupCount > 0) {
          item.info = (
            <Label
              color="error"
              variant="filled"
              sx={{
                height: 20,
                minWidth: 20,
                fontSize: '0.75rem',
                px: 0.5,
                borderRadius: 0.75,
                fontWeight: 'bold',
              }}
            >
              {groupCount}
            </Label>
          );
        }
      }
    });

    return result;
  }, [user?.roles, view, unreadCounts, settings]);


  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile key={view} data={navData} open={open} onClose={onClose} />

          <Box sx={{ ml: 2, display: 'inline-flex' }}>
            <DashboardSwitcher />
          </Box>
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 2 } }}>
          <UserStatusBar />

          <ChatNotifications>
            <Box
              component={RouterLink as any}
              href="/chat"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 2,
                py: 0.7,
                borderRadius: '999px',
                textDecoration:"none",

                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.2px',

                color: '#2563eb',
                background: 'linear-gradient(135deg, #e0ecff 0%, #c7dbff 100%)',

                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',

                '& svg': {
                  fontSize: '1.2rem',
                  transition: 'transform 0.25s ease',
                },

                '&:hover': {
                  color: '#ffffff',
                  background: '#08a3cd',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',

                  '& svg': {
                    transform: 'scale(1.15)',
                  },
                },

                '&:active': {
                  transform: 'scale(0.96)',
                },

                // shine effect
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-75%',
                  width: '50%',
                  height: '100%',
                  background: 'rgba(255,255,255,0.3)',
                  transform: 'skewX(-20deg)',
                  transition: '0.5s',
                },

                '&:hover::after': {
                  left: '130%',
                },
              }}
            >
              <IoChatbubblesOutline />
             InnoChat
            </Box>
          </ChatNotifications>


          {/** @slot Account drawer */}
          <AccountPopover
            data={(_account || []).filter((item) => {
              if (item.label === 'Settings') {
                return (user?.roles || []).some((role: string) =>
                  ['HR', 'Administrator', 'System Manager'].includes(role)
                );
              }
              return true;
            })}
          />
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <CallProvider>
      <Fade in timeout={700} key={view}>
        <Box
          sx={{
            height: 1,
            animation: 'fadeIn 0.6s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 },
            },
          }}
        >
          <LayoutSection
            headerSection={renderHeader()}
            sidebarSection={<NavDesktop key={view} data={navData} layoutQuery={layoutQuery} />}
            footerSection={renderFooter()}
            cssVars={{ ...dashboardLayoutVars(theme), ...cssVars }}
            sx={[
              {
                bgcolor: 'common.white',
                [`& .${layoutClasses.sidebarContainer}`]: {
                  [theme.breakpoints.up(layoutQuery)]: {
                    pl: 'var(--layout-nav-vertical-width)',
                    transition: theme.transitions.create(['padding-left'], {
                      easing: 'var(--layout-transition-easing)',
                      duration: 'var(--layout-transition-duration)',
                    }),
                  },
                },
              },
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
          >
            {renderMain()}
          </LayoutSection>
        </Box>
      </Fade>
    </CallProvider>
  );
}
