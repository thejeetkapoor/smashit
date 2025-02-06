// src/emailService.js
import emailjs from '@emailjs/browser';

export const sendEmail = (toEmail, booking) => {
    const templateParams = {
        to_email: toEmail,
        court_number: booking.courtNumber,
        time_slot: booking.timeSlot,
        booking_date: booking.date,
    };

    emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then((response) => {
        console.log('Booking confirmation email sent:', response);
    })
    .catch((error) => {
        console.error('Error sending confirmation email:', error);
    });
};

export const sendCancellationEmail = (toEmail, booking) => {
    const templateParams = {
        to_email: toEmail,
        court_number: booking.courtNumber,
        time_slot: booking.timeSlot,
        booking_date: booking.date,
    };

    emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_CANCELLATION_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then((response) => {
        console.log('Cancellation email sent:', response);
    })
    .catch((error) => {
        console.error('Error sending cancellation email:', error);
    });
};
