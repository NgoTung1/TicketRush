import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import OAuthCallback from '@/components/auth/OAuthCallBack';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'am-nhac',
        element: <HomePage />,
      },
      {
        path: 'nghe-thuat',
        element: <HomePage />,
      },
      {
        path: 'hoi-thao',
        element: <HomePage />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: "/auth/callback",
        element: <OAuthCallback />,
      }
    ],
  },
]);

export default router;
