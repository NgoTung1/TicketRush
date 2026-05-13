import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import EventOfTicket from '../components/TicketDetail/EventOfTicket';
import SeatsQr from '../components/TicketDetail/SeatsQr';

const TicketDetail: React.FC = () => {
    return(
        <div className="min-h-screen bg-background text-white font-sans flex flex-col">
            <Header />
            <main className="flex-grow w-full px-6 sm:px-10 lg:px-16 py-8">
                <EventOfTicket />
                <SeatsQr />
            </main>
        </div>
    )
};

export default TicketDetail;
