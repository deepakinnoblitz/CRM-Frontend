import type { Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { useUnreadCounts } from 'src/hooks/useUnreadCounts';

import { Label } from 'src/components/label';

import ChatNotifications from 'src/sections/chat/chat-notifications';

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

  const { user } = useAuth();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const { unreadCounts } = useUnreadCounts();

  const { navData } = getNavData(user?.roles);

  // Inject unread counts into navData
  navData.forEach((item: any) => {
    // Check main items
    if (
      (item.title === 'Leave Application') &&
      unreadCounts['Leave Application'] > 0
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
            ml: 1,
            fontWeight: 'bold',
          }}
        >
          {unreadCounts['Leave Application']}
        </Label>
      );
    }
    if ((item.title === 'Request List') && unreadCounts.Request > 0) {
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
            ml: 1,
            fontWeight: 'bold',
          }}
        >
          {unreadCounts.Request}
        </Label>
      );
    }
    if (
      (item.title === 'WFH Attendance') &&
      unreadCounts['WFH Attendance'] > 0
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
            ml: 1,
            fontWeight: 'bold',
          }}
        >
          {unreadCounts['WFH Attendance']}
        </Label>
      );
    }

    // Aggregation for Parent Items
    if (item.children) {
      let groupCount = 0;
      item.children.forEach((child: any) => {
        if (child.title === 'Leave Application' && unreadCounts['Leave Application'] > 0) {
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
              {unreadCounts['Leave Application']}
            </Label>
          );
          groupCount += unreadCounts['Leave Application'];
        }
        if (child.title === 'WFH Attendance' && unreadCounts['WFH Attendance'] > 0) {
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
              {unreadCounts['WFH Attendance']}
            </Label>
          );
          groupCount += unreadCounts['WFH Attendance'];
        }
        if (child.title === 'Request List' && unreadCounts.Request > 0) {
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
              {unreadCounts.Request}
            </Label>
          );
          groupCount += unreadCounts.Request;
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
              ml: -1,
              fontWeight: 'bold',
            }}
          >
            {groupCount}
          </Label>
        );
      }
    }
  });


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
          <NavMobile data={navData} open={open} onClose={onClose} />

        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Searchbar */}
          {/* <Searchbar /> */}

          <ChatNotifications>
            <Box
              component={RouterLink as any}
              href="/chat"
              sx={{
                lineHeight: 0,
                display: 'inline-flex',
                mr: 3,
                transition: theme.transitions.create(['all'], {
                  duration: theme.transitions.duration.shorter,
                }),
                '&:hover': {
                  transform: 'translateY(-1px)',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                },
                '&:active': {
                  transform: 'translateY(0) scale(0.98)',
                },
              }}
            >
              <Box
                component="img"
                src="/assets/icons/Innochat_button.png"
                sx={{
                  width: 140, // Increased size as requested by intent
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Box>
          </ChatNotifications>


          {/** @slot Account drawer */}
          <AccountPopover data={_account} />
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
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop data={navData} layoutQuery={layoutQuery} />
      }

      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
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
  );
}
