import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Checkout from './pages/Checkout';
import Invoices from './pages/Invoices';
import TicketDetail from './pages/TicketDetail';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/checkout/123" />} />
        <Route path="/checkout/:orderId" element={<Checkout />} />
        <Route path="/seats" element={<div className="text-white flex items-center justify-center h-screen bg-[#111111]">Trang chọn ghế (Redirected after timeout or cancel)</div>} />
      </Routes>

      <Routes>
        <Route path="/" element={<Navigate to="/invoices"/>} />
        <Route path="/invoices" element={<Invoices/>} />
        <Route path="/seats" element={<div className="text-white flex items-center justify-center h-screen bg-[#111111]">Trang chọn ghế (Redirected after timeout or cancel)</div>} />
      </Routes>

      <Routes>
        <Route path="/" element={<Navigate to="/ticket/123"/>} />
        <Route path="/ticket/:ticketId" element={<TicketDetail />} />
        <Route path="/ticket" element={<div className="text-white flex items-center justify-center h-screen bg-[#111111]">Trang xem vé (Redirected after timeout or cancel)</div>} />
      </Routes>


    </BrowserRouter>
  );
}

export default App;
