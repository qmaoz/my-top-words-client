import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import store from './redux/store';
import { applyCssVariables } from './theme/applyCssVariables.js';
import AppThemeProvider from './theme/AppThemeProvider.jsx';
import './i18n';
import './index.css';

applyCssVariables();

createRoot(document.getElementById('root')).render(
  <AppThemeProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </AppThemeProvider>,
);
