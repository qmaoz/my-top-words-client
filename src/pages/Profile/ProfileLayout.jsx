import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Tab, Tabs } from '@mui/material';

import { selectIsAuth, selectAuthStatus } from '../../redux/slices/auth';
import { selectQueuedRemarksTotal } from '../../redux/slices/word-set-remarks';
import CircularLoading from '../../components/wrappers/CircularLoading';
import InfoHint from '../../components/InfoHint';
import ProfileLearningSummary from './ProfileLearningSummary';

export default function ProfileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuth = useSelector(selectIsAuth);
  const authStatus = useSelector(selectAuthStatus);
  const queuedRemarksTotal = useSelector(selectQueuedRemarksTotal);
  const isRemarksRoute = location.pathname === '/profile/remarks';
  const showRemarksTab = queuedRemarksTotal > 0 || isRemarksRoute;

  useEffect(() => {
    if (!isAuth && authStatus !== 'loading') {
      navigate('/');
    }
  }, [isAuth, authStatus, navigate]);

  const currentTab = location.pathname === '/profile' || location.pathname === '/profile/own-word-sets'
    ? '/profile/own-word-sets'
    : location.pathname;
  const showLearningSummary = currentTab === '/profile/own-word-sets'
    || currentTab === '/profile/saved-word-sets';

  return (
    <>
        <Box className="container profile-page">
          <CircularLoading isLoading={authStatus === 'loading'}>
            <Box className="df">
              <h2>{t('profile.title')}</h2>
              <Tabs value={currentTab}>
                <Tab label={t('profile.tabOwn')} value="/profile/own-word-sets" component={Link} to="own-word-sets" />
                <Tab label={t('profile.tabSaved')} value="/profile/saved-word-sets" component={Link} to="saved-word-sets" />
                {showRemarksTab && (
                  <Tab
                    label={(
                      <Box
                        component="span"
                        className="heading-with-info"
                        onClick={(event) => {
                          if (event.target.closest('.info-hint-btn')) {
                            event.preventDefault();
                            event.stopPropagation();
                          }
                        }}
                      >
                        {t('profile.tabRemarks')}
                        <InfoHint title={t('setRemark.inboxIntro')} />
                      </Box>
                    )}
                    value="/profile/remarks"
                    component={Link}
                    to="remarks"
                  />
                )}
                <Tab label={t('profile.tabSettings')} value="/profile/settings" component={Link} to="settings" />
              </Tabs>
            </Box>
            {showLearningSummary && <ProfileLearningSummary />}
            <Box className="profile-page__content">
              <Outlet />
            </Box>
          </CircularLoading>
        </Box>
    </>
  );
}
