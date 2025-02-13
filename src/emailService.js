

import emailjs from '@emailjs/browser';

// ✅ Function to send booking confirmation email
export const sendEmail = async (userEmail, adminEmail, booking) => {
    const templateParams = {
        to_email: userEmail, // ✅ User's email
        admin_email: adminEmail, // ✅ Admin's email as BCC
        court_number: booking.courtNumber,
        time_slot: booking.timeSlot,
        booking_date: booking.date,
        action: booking.action,
        timestamp: booking.timestamp
    };

    try {
        const response = await emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            templateParams,
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        );
        console.log('Booking confirmation email sent:', response);
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
    }
};

// ✅ Function to send cancellation email
export const sendCancellationEmail = async (userEmail, adminEmail, booking) => {
    const templateParams = {
        to_email: userEmail, // ✅ User's email
        admin_email: adminEmail, // ✅ Admin's email as BCC
        court_number: booking.courtNumber,
        time_slot: booking.timeSlot,
        booking_date: booking.date,
        action: booking.action,
        timestamp: booking.timestamp
    };

    try {
        const response = await emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_CANCELLATION_TEMPLATE_ID,
            templateParams,
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        );
        console.log('Cancellation email sent:', response);
    } catch (error) {
        console.error('Error sending cancellation email:', error);
    }
};



