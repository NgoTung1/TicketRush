import React from 'react';
import EventOfTicket from '../components/TicketDetail/EventOfTicket';
import SeatsQr from '../components/TicketDetail/SeatsQr';

const TicketDetail: React.FC = () => {
    return(
        <div className="w-full">
            <EventOfTicket />
            <SeatsQr />
        </div>
    )
};

export default TicketDetail;
