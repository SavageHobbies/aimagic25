import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { CircularProgress, Box } from '@mui/material';
import { theme } from './theme/theme';
import { store } from './store/store';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NewListing = React.lazy(() => import('./pages/NewListing'));
const Drafts = React.lazy(() => import('./pages/Drafts'));
const History = React.lazy(() => import('./pages/History'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));

const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <BrowserRouter>
              <ErrorBoundary>
                <React.Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route
                        path="dashboard"
                        element={
                          <ErrorBoundary>
                            <React.Suspense fallback={<LoadingFallback />}>
                              <Dashboard />
                            </React.Suspense>
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="new-listing"
                        element={
                          <ErrorBoundary>
                            <React.Suspense fallback={<LoadingFallback />}>
                              <NewListing />
                            </React.Suspense>
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="drafts"
                        element={
                          <ErrorBoundary>
                            <React.Suspense fallback={<LoadingFallback />}>
                              <Drafts />
                            </React.Suspense>
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="history"
                        element={
                          <ErrorBoundary>
                            <React.Suspense fallback={<LoadingFallback />}>
                              <History />
                            </React.Suspense>
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="analytics"
                        element={
                          <ErrorBoundary>
                            <React.Suspense fallback={<LoadingFallback />}>
                              <Analytics />
                            </React.Suspense>
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="settings"
                        element={
                          <ErrorBoundary>
                            <React.Suspense fallback={<LoadingFallback />}>
                              <Settings />
                            </React.Suspense>
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <ErrorBoundary>
                            <React.Suspense fallback={<LoadingFallback />}>
                              <Profile />
                            </React.Suspense>
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="product-details"
                        element={
                          <ErrorBoundary>
                            <React.Suspense fallback={<LoadingFallback />}>
                              <ProductDetails />
                            </React.Suspense>
                          </ErrorBoundary>
                        }
                      />
                    </Route>
                  </Routes>
                </React.Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
