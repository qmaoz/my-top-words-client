import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { fetchUserInfo, setAuthStatusError } from './redux/slices/auth';
import { Toast } from './components/utils/messages.jsx';
import ScrollToTop from './components/utils/ScrollToTop.jsx';
import Header from './components/blocks/Header.jsx';
import Footer from './components/blocks/Footer.jsx';

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
import DefaultLayout from './components/blocks/DefaultLayout.jsx';
import ExerciseLayout from './components/blocks/ExerciseLayout.jsx';

export default function App() {
  const dispatch = useDispatch();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    (async () => {
      if (window.localStorage.getItem('token')) {
        try {
          await dispatch(fetchUserInfo()).unwrap();
        } catch (error) {
          const message = error?.message?.message || error?.message;
          if (message !== 'jwt expired') {
            setToast({ open: true, message: message || 'Невідома помилка при завантаженні даних користувача', severity: 'error' });
          } else {
            window.localStorage.removeItem('token');
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
        <ScrollToTop />         
        <Toast {...toast} handleClose={handleCloseToast} />
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<><HomePage /></>} />
            <Route path="home" element={<><HomePage /></>} />
            <Route path="main" element={<><HomePage /></>} />
            <Route path="/sign-up" element={<><RegistrationFormPage /></>} />
            <Route path="/login" element={<><LoginFormPage /></>} />
            
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfileSavedWordSets />} />
              <Route path='saved-word-sets' element={<ProfileSavedWordSets />} />
              <Route path='own-word-sets' element={<ProfileOwnWordSets />} />
            </Route>

            <Route path="/word-set/:id" element={<><WordSetPage /></>} />
            
            {/* <Route path="/terms" element={<><TermsAndConditionsPage /></>} /> */}
            {/* <Route path="/about" element={<><AboutPage /></>} /> */}
            
            <Route path='*' element={<NotFoundPage />} />
          </Route>

          <Route element={<ExerciseLayout />}>
            <Route path="/translate-exercise/:id" element={<><TranslationExercisePage /></>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}