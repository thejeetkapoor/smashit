import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { sendEmail, sendCancellationEmail } from './emailService';

const CourtBooking = ({ user }) => {
    const [bookings, setBookings] = useState({});
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const timeSlots = [
        '06:00-07:00', '07:00-08:00', '08:00-09:00',
        '16:00-17:00', '17:00-18:00', '18:00-19:00',
        '19:00-20:00', '20:00-21:00', '21:00-22:00'
    ];
    const interIITPlayers = ['player1@iitmandi.ac.in', 'player2@iitmandi.ac.in'];
    const courts = [1, 2, 3, 4];

    useEffect(() => {
        const storedBookings = JSON.parse(localStorage.getItem('courtBookings')) || {};
        setBookings(storedBookings);
    }, []);

    const handleBooking = () => {
        if (!selectedCourt || !selectedTime || !selectedDate) {
            alert('Please select court, time, and date.');
            return;
        }

        const userBookings = bookings[selectedDate]?.[user.email] || [];
        const maxAllowed = interIITPlayers.includes(user.email) ? 2 : 1;

        if (userBookings.length >= maxAllowed) {
            alert(`You can only book ${maxAllowed} slot(s) per day.`);
            return;
        }

        if (isCourtBooked(selectedCourt, selectedTime, selectedDate)) {
            alert('Court is already booked. You can join the waitlist.');
            // Add functionality to join the waitlist here
            return;
        }

        const updatedBookings = { ...bookings };
        if (!updatedBookings[selectedDate]) updatedBookings[selectedDate] = {};
        if (!updatedBookings[selectedDate][user.email]) updatedBookings[selectedDate][user.email] = [];

        const newBooking = { courtNumber: selectedCourt, timeSlot: selectedTime, date: selectedDate };
        updatedBookings[selectedDate][user.email].push(newBooking);

        localStorage.setItem('courtBookings', JSON.stringify(updatedBookings));
        setBookings(updatedBookings);

        sendEmail(user.email, newBooking);
        alert(`Court ${selectedCourt} booked for ${selectedTime} on ${selectedDate}`);
    };

    const handleCancellation = () => {
        if (!selectedDate || !selectedTime || !selectedCourt) {
            alert('Please select a date, court, and time to cancel your booking.');
            return;
        }

        const userBookings = bookings[selectedDate]?.[user.email] || [];
        const currentTime = new Date();
        const bookingTime = new Date(`${selectedDate}T${selectedTime.split('-')[0]}:00`);

        if (bookingTime - currentTime <= 30 * 60 * 1000) {
            alert('You cannot cancel a booking within 30 minutes of the start time.');
            return;
        }

        const updatedBookings = { ...bookings };
        const remainingBookings = userBookings.filter(
            (booking) => !(booking.courtNumber === selectedCourt && booking.timeSlot === selectedTime)
        );

        updatedBookings[selectedDate][user.email] = remainingBookings;
        localStorage.setItem('courtBookings', JSON.stringify(updatedBookings));
        setBookings(updatedBookings);

        const canceledBooking = { courtNumber: selectedCourt, timeSlot: selectedTime, date: selectedDate };
        sendCancellationEmail(user.email, canceledBooking);
        alert('Your booking has been canceled.');
    };

    const isCourtBooked = (court, time, date) => {
        return Object.values(bookings[date] || {}).some(userBookings =>
            userBookings.some(booking => booking.courtNumber === court && booking.timeSlot === time)
        );
    };

    return (
        <div style={{
            backgroundColor: darkMode ? '#121212' : 'white',
            color: darkMode ? 'white' : 'black',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{
                    padding: '10px',
                    backgroundColor: darkMode ? 'gray' : 'black',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    borderRadius: '5px'
                }}>
                {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
            </button>

            <h2>Court Booking</h2>
            <label>Select Date: </label>
            <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
            />
            <br />

            <label>Select Court: </label>
            <div style={{ display: 'flex', gap: '10px' }}>
                {courts.map((court) => (
                    <div
                        key={court}
                        style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: isCourtBooked(court, selectedTime, selectedDate) ? 'red' : 'green',
                            border: selectedCourt === court ? '3px solid black' : 'none',
                            textAlign: 'center',
                            lineHeight: '50px',
                            cursor: 'pointer'
                        }}
                        onClick={() => setSelectedCourt(court)}
                    >
                        {court}
                    </div>
                ))}
            </div>
            <br />

            <label>Select Time Slot: </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
                {timeSlots.map((slot) => (
                    <div
                        key={slot}
                        style={{
                            padding: '10px',
                            backgroundColor: selectedTime === slot ? 'blue' : 'lightgray',
                            color: 'white',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: '5px'
                        }}
                        onClick={() => setSelectedTime(slot)}
                    >
                        {slot}
                    </div>
                ))}
            </div>

            <br />
            <button onClick={handleBooking}>Book Court</button>
            <button onClick={handleCancellation} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
                Cancel Booking
            </button>

            <h3>Your Bookings:</h3>
            {selectedDate && bookings[selectedDate] && bookings[selectedDate][user.email] ? (
                bookings[selectedDate][user.email].map((booking, index) => (
                    <p key={index}>Court {booking.courtNumber} at {booking.timeSlot} on {selectedDate}</p>
                ))
            ) : (
                <p>No bookings found.</p>
            )}
        </div>
    );
};

// Prop types validation
CourtBooking.propTypes = {
    user: PropTypes.shape({
        email: PropTypes.string.isRequired, // User must have an email
    }).isRequired,
};

export default CourtBooking;
