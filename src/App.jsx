import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { fetchUserInfo, setAuthStatusError, selectUiLocale } from './redux/slices/auth';
import { changeUiLocale } from './i18n';
import { Toast } from './components/utils/messages.jsx';
import ScrollToTop from './components/utils/ScrollToTop.jsx';
import DocumentTitle from './components/utils/DocumentTitle.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import LoginFormPage from './pages/LoginFormPage.jsx';
import RegistrationFormPage from './pages/RegistrationFormPage.jsx';
import TranslationExercisePage from './pages/TranslationExercisePage.jsx';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage.jsx';
import WordSetPage from './pages/WordSetPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfileLayout from './pages/Profile/ProfileLayout.jsx';
import ProfileOwnWordSets from './pages/Profile/ProfileOwnWordSets.jsx';
import ProfileSavedWordSets from './pages/Profile/ProfileSavedWordSets.jsx';
import ProfileSettings from './pages/Profile/ProfileSettings.jsx';
import ProfileRemarksInbox from './pages/Profile/ProfileRemarksInbox.jsx';
import DefaultLayout from './components/blocks/DefaultLayout.jsx';
import ExerciseLayout from './components/blocks/ExerciseLayout.jsx';
import AdminLayout from './pages/Admin/AdminLayout.jsx';
import AdminOverviewPage from './pages/Admin/AdminOverviewPage.jsx';
import AdminFeedbackPage from './pages/Admin/AdminFeedbackPage.jsx';
import AdminUsersPage from './pages/Admin/AdminUsersPage.jsx';
import { ConfirmProvider } from './components/utils/useConfirm.jsx';

export default function App() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const uiLocale = useSelector(selectUiLocale);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    if (uiLocale) {
      changeUiLocale(uiLocale);
    }
  }, [uiLocale]);

  useEffect(() => {
    (async () => {
      if (window.localStorage.getItem('token')) {
        try {
          await dispatch(fetchUserInfo()).unwrap();
        } catch (error) {
          if (error?.response?.status === 401 || error?.message?.message === 'jwt expired') {
            window.localStorage.removeItem('token');
          } else {
            const message = error?.message?.message || error?.message;
            setToast({ open: true, message: message || t('common.profileLoadError'), severity: 'error' });
          }
        }
      } else {
        dispatch(setAuthStatusError());
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);
  
  return (
    <>
      <BrowserRouter>
        <ConfirmProvider>
        <ScrollToTop />
        <DocumentTitle />
        <Toast {...toast} handleClose={handleCloseToast} />
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<><HomePage /></>} />
            <Route path="home" element={<><HomePage /></>} />
            <Route path="main" element={<><HomePage /></>} />
            <Route path="/sign-up" element={<><RegistrationFormPage /></>} />
            <Route path="/login" element={<><LoginFormPage /></>} />
            
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfileOwnWordSets />} />
              <Route path='saved-word-sets' element={<ProfileSavedWordSets />} />
              <Route path='own-word-sets' element={<ProfileOwnWordSets />} />
              <Route path='remarks' element={<ProfileRemarksInbox />} />
              <Route path='settings' element={<ProfileSettings />} />
            </Route>

            <Route path="/word-set/:id" element={<><WordSetPage /></>} />
            <Route path="/terms" element={<><TermsAndConditionsPage /></>} />
            <Route path="/about" element={<><AboutPage /></>} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="overview" element={<AdminOverviewPage />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
            
            <Route path='*' element={<NotFoundPage />} />
          </Route>

          <Route element={<ExerciseLayout />}>
            <Route path="/translate-exercise/:id" element={<><TranslationExercisePage /></>} />
          </Route>
        </Routes>
        </ConfirmProvider>
      </BrowserRouter>
    </>
  );
}