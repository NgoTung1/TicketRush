import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/event/HomePage';
import EventList from '@/pages/event/EventList';
import EventDetail from '@/pages/event/EventDetail';
import CreateEventPage from '@/pages/event/CreateEventPage';

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
        element: <EventList />,
      },
      {
        path: 'nghe-thuat',
        element: <EventList />,
      },
      {
        path: 'hoi-thao',
        element: <EventList />,
      },
    ],
  },
  {
    path: '/admin/create-event',
    element: <CreateEventPage />,
  }
]);

export default router;
