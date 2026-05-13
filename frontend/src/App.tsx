import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RootLayout from '@/layouts/RootLayout';
import Checkout from '@/pages/Checkout';
import Invoices from '@/pages/Invoices';
import TicketDetail from '@/pages/TicketDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Apply RootLayout (Header/Footer + restore session) */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Navigate to="/checkout/123" replace />} />
          <Route path="checkout/:orderId" element={<Checkout />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="ticket/:ticketId" element={<TicketDetail />} />

          {/* Placeholder seat selection page */}
          <Route
            path="seats"
            element={(
              <div className="text-white flex items-center justify-center h-screen bg-[#111111]">
                Trang chọn ghế (Redirected after timeout or cancel)
              </div>
            )}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
