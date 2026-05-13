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
        path: 'su-kien/:id',
        element: <EventDetail />,
      },
      {
        path: 'am-nhac',
        element: <HomePage />,
        element: <EventList />,
      },
      {
        path: 'nghe-thuat',
        element: <HomePage />,
        element: <EventList />,
      },
      {
        path: 'hoi-thao',
        element: <HomePage />,
        element: <EventList />,
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
  {
    path: '/admin/create-event',
    element: <CreateEventPage />,
  }
]);

export default router;
