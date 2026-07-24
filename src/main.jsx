import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import App from './App.jsx';
import store from './redux/store';
import { applyCssVariables } from './theme/applyCssVariables.js';
import theme from './theme/muiTheme.js';
import './i18n';
import './index.css';

applyCssVariables();

createRoot(document.getElementById('root')).render(
  <>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </>,
);
