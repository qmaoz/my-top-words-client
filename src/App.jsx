import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { fetchAuthMe } from './redux/slices/auth';
import { Toast } from './components/messages.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
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
import ProfileWordSets from './pages/Profile/ProfileWordSets.jsx';
import ProfileWords from './pages/Profile/ProfileWords.jsx';
import ProfileDashboard from './pages/Profile/ProfileDashboard.jsx';
import DefaultLayout from './components/blocks/DefaultLayout.jsx';
import ExerciseLayout from './components/blocks/ExerciseLayout.jsx';

export default function App() {
  const dispatch = useDispatch();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    if (window.localStorage.getItem('token')) {
      try {
        dispatch(fetchAuthMe()).unwrap();
      } catch (error) {
        console.error(error.message || 'Невідома помилка при отриманні даних користувача');
      }
    }
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
        {/* Scroll to the top when the page is changed */}
        <ScrollToTop />         
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<><HomePage /></>} />
            <Route path="home" element={<><HomePage /></>} />
            <Route path="main" element={<><HomePage /></>} />
            <Route path="/sign-up" element={<><RegistrationFormPage /></>} />
            <Route path="/login" element={<><LoginFormPage /></>} />
            
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfileWordSets />} />
              
              <Route path='word-sets' element={<ProfileWordSets />} />
              <Route path='words' element={<ProfileWords />} />
              <Route path='dashboard' element={<ProfileDashboard />} />

              <Route path='*' element={<ProfileWordSets />} />
            </Route>

            <Route path="/terms" element={<><TermsAndConditionsPage /></>} />
            <Route path="/about" element={<><AboutPage /></>} />
            <Route path="/word-set/:id" element={<><WordSetPage /></>} />
            <Route path='*' element={<NotFoundPage />} />
          </Route>

          <Route element={<ExerciseLayout />}>
            <Route path="/translate-exercise/:id" element={<><TranslationExercisePage /></>} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}