<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Checkout from './pages/Checkout';
import Invoices from './pages/Invoices';
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

    </BrowserRouter>
  );
=======
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/router';

function App() {
  return <RouterProvider router={router} />;
>>>>>>> 6d78811ebddd0ce712089c05142c5986f65cedf6
}

export default App;
