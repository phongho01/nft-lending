import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { userRoutes } from './routes';
import { store, persistor } from './redux/store';
import './global.css';
import 'react-loading-skeleton/dist/skeleton.css';

const router = createBrowserRouter(userRoutes);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
);
