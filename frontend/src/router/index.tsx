import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';

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
        element: <HomePage />,  // Placeholder – will be replaced with dedicated page
      },
      {
        path: 'nghe-thuat',
        element: <HomePage />,  // Placeholder
      },
      {
        path: 'hoi-thao',
        element: <HomePage />,  // Placeholder
      },
    ],
  },
]);

export default router;
