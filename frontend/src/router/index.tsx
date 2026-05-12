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
    ],
  },
]);

export default router;
