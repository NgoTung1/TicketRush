import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import AdminLayout from '@/layouts/AdminLayout';
import HomePage from '@/pages/event/HomePage';
import EventList from '@/pages/event/EventList';
import EventDetail from '@/pages/event/EventDetail';
import CreateEventPage from '@/pages/event/CreateEventPage';
import { AuthPage } from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import OAuthCallback from '@/components/auth/OAuthCallBack';
import AdminEventList from '@/pages/event/AdminEventList';
import AdminCategoryList from '@/pages/event/AdminCategoryList';
import AdminCreateCategory from '@/pages/event/AdminCreateCategory';
import AdminCategoryDetail from '@/pages/event/AdminCategoryDetail';
import AdminEventDetail from '@/pages/event/AdminEventDetail';

/**
 * URL Convention cho EventList:
 *   /su-kien                        → Tất cả sự kiện
 *   /su-kien?status=ONCOMING        → Sắp diễn ra
 *   /su-kien?status=ONGOING         → Đang diễn ra
 *   /su-kien?status=COMPLETED       → Đã kết thúc
 *   /su-kien?category_id=<id>       → Lọc theo danh mục
 *   /su-kien?keyword=<q>            → Tìm kiếm
 *   /su-kien?page=2                 → Phân trang
 *
 * Các path danh mục cũ (/am-nhac, /nghe-thuat, /hoi-thao) được redirect về
 * /su-kien để đồng nhất URL (category filter sẽ dùng category_id từ API).
 */

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
        // Trang danh sách sự kiện — filter bằng query params
        path: 'event',
        element: <EventList />,
      },
      {
        // Chi tiết sự kiện
        path: 'event/:id',
        element: <EventDetail />,
      },
      {
        // Legacy paths → redirect về /su-kien
        path: 'am-nhac',
        element: <Navigate to="/event" replace />,
      },
      {
        path: 'nghe-thuat',
        element: <Navigate to="/event" replace />,
      },
      {
        path: 'hoi-thao',
        element: <Navigate to="/event" replace />,
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
        path: '/auth/callback',
        element: <OAuthCallback />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'create-event',
        element: <CreateEventPage />,
      },
      {
        path: 'event-list',
        element: <AdminEventList />,
      },
      {
        path: 'event/:id',
        element: <AdminEventDetail />,
      },
      {
        path: 'categories',
        element: <AdminCategoryList />,
      },
      {
        path: 'categories/create',
        element: <AdminCreateCategory />,
      },
      {
        path: 'categories/:id',
        element: <AdminCategoryDetail />,
      }
    ],
  },
]);

export default router;
