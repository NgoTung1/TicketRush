import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import { AuthPage } from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import OAuthCallback from '@/components/auth/OAuthCallBack';
import AdminLayout from '@/layouts/AdminLayout';
import HomePage from '@/pages/event/HomePage';
import EventList from '@/pages/event/EventList';
import EventDetail from '@/pages/event/EventDetail';
import CreateEventPage from '@/pages/event/CreateEventPage';
import AdminEventList from '@/pages/event/AdminEventList';
import AdminCategoryList from '@/pages/event/AdminCategoryList';
import AdminCreateCategory from '@/pages/event/AdminCreateCategory';
import AdminCategoryDetail from '@/pages/event/AdminCategoryDetail';
import AdminEventDetail from '@/pages/event/AdminEventDetail';
import AdminUpdateEvent from '@/pages/event/AdminUpdateEvent';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { RoomPage } from '@/pages/RoomPage';
import CancelledTicketDetail from '@/pages/CancelledTicketDetail';
import Checkout from '@/pages/Checkout';
import Invoices from '@/pages/Invoices';
import TicketDetail from '@/pages/TicketDetail';
import { AdminRoomPage } from '@/pages/AdminRoomPage';
import { AdminRoomDetail } from '@/pages/event/AdminRoomDetail';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import SeatSelectedPage from '@/pages/SeatSelectedPage';


/**
 * URL Convention cho EventList:
 *   /su-kien                  → Tất cả sự kiện
 *   /su-kien?status=ONCOMING  → Sắp diễn ra
 *   /su-kien?status=ONGOING   → Đang diễn ra
 *   /su-kien?status=COMPLETED → Đã kết thúc
 *   /su-kien?category_id=<id> → Lọc theo danh mục
 *   /su-kien?keyword=<q>      → Tìm kiếm
 *   /su-kien?page=2           → Phân trang
 *
 * Các path danh mục cũ (/am-nhac, /nghe-thuat, /hoi-thao) được redirect về
 * /su-kien để đồng nhất URL (category filter sẽ dùng category_id từ API).
 */

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // ==========================================
      // 1. NHÓM PUBLIC (Bất kỳ ai cũng vào được)
      // ==========================================
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'auth/callback',
        element: <OAuthCallback />,
      },

      // ==========================================
      // 2. NHÓM USER (Bắt buộc phải đăng nhập/có quyền)
      // ==========================================
      {
        // Sử dụng Outlet làm children để RRv6 tự động render các element con bên dưới
        element: (
          <ProtectedRoute requiredRole="user">
            <Outlet />
          </ProtectedRoute>
        ),
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
            path: 'event/:id',
            element: <EventDetail />,
          },
          {
            path: 'events',
            element: <EventList />,
          },
          {
            path: 'am-nhac',
            element: <Navigate to="/events" replace />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'event/:id/room',
            element: <RoomPage />,
          },
          {
            path: 'event/:id/seat-selected',
            element: <SeatSelectedPage />,
          },
          {
            path: 'checkout/:orderId',
            element: <Checkout />,
          },
          {
            path: 'checkout/success/:id',
            element: <CheckoutSuccess />,
          },
          {
            path: 'invoices',
            element: <Invoices />,
          },
          {
            path: 'ticket/:id',
            element: <TicketDetail />,
          },
          {
            path: 'ticket/cancelled/:id',
            element: <CancelledTicketDetail />,
          },
          // Các route Redirect
          {
            path: 'nghe-thuat',
            element: <Navigate to="/event" replace />,
          },
          {
            path: 'hoi-thao',
            element: <Navigate to="/event" replace />,
          },
        ],
      },
    ],
  },

  // ==========================================
  // 3. NHÓM ADMIN (Bắt buộc phải là Admin)
  // ==========================================
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
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
        path: 'event/update/:id',
        element: <AdminUpdateEvent />,
      },
      {
        path: 'event/room/:id',
        element: <AdminRoomPage />,
      },
      {
        path: 'event/:eventId/session/:sessionId/room',
        element: <AdminRoomDetail />,
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
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'categories/:id',
        element: <AdminCategoryDetail />,
      },
    ],
  },
]);

export default router;