import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { sendEmail, sendCancellationEmail } from './emailService';




const CourtBooking = ({ user, onLogout }) => {
    console.log("User object in CourtBooking:", user);

    if (!user?.email?.endsWith(".iitmandi.ac.in")) {
        alert("Access restricted to IIT Mandi email IDs.");
        onLogout();
        return null;
    }

    const [darkMode, setDarkMode] = useState(false);
    const [bookings, setBookings] = useState({});
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [history, setHistory] = useState([]);


    const courts = [1, 2, 3, 4];
    const adminEmail = "b22017@students.iitmandi.ac.in";

    const timeSlots = [
        '06:15-07:00 AM', '07:00-07:45 AM', '07:45-08:30 AM',
        '04:00-04:45 PM', '04:45-05:30 PM', '05:30-06:15 PM',
        '06:15-07:00 PM', '07:00-08:00 PM', '08:00-08:45 PM',
        '08:45-09:30 PM'
    ];


    


    useEffect(() => {
        const storedBookings = JSON.parse(localStorage.getItem('courtBookings')) || {};
        setBookings(storedBookings);
        const storedHistory = JSON.parse(localStorage.getItem('bookingHistory')) || [];
        setHistory(storedHistory);
    }, []);



     // ✅ Converts time slot to actual Date object
    const getSlotEndTime = () => {
        if (!selectedDate || !selectedSlot) return null;

        const [startTime] = selectedSlot.split("-");
        const [hour, min] = startTime.split(":").map(Number);
        const isPM = selectedSlot.includes("PM") && hour !== 12;

        const dateObj = new Date(selectedDate);
        dateObj.setHours(isPM ? hour + 12 : hour);
        dateObj.setMinutes(min);
        return dateObj;
    };



    const handleBooking = async () => {
        if (!selectedCourt || !selectedDate || !selectedSlot) {
            alert('Please select a court, date, and time slot.');
            return;
        }

        const endTime = getSlotEndTime();
        if (endTime < new Date()) {
            alert("You cannot book a past time slot!");
            return;
        }

        if (isSlotBooked(selectedCourt, selectedDate, selectedSlot)) {
            alert('This time slot is already booked.');
            return;
        }


        const newBooking = {
            courtNumber: selectedCourt,
            date: selectedDate,
            timeSlot: selectedSlot,
            action: 'Booked',
            timestamp: new Date().toLocaleString()
        };
    
        const updatedBookings = { ...bookings };
        if (!updatedBookings[selectedDate]) updatedBookings[selectedDate] = {};
        if (!updatedBookings[selectedDate][user.email]) updatedBookings[selectedDate][user.email] = [];
    

    
        updatedBookings[selectedDate][user.email].push(newBooking);
        localStorage.setItem('courtBookings', JSON.stringify(updatedBookings));
        setBookings(updatedBookings);
    
        const updatedHistory = [...history, newBooking];
        setHistory(updatedHistory);
        localStorage.setItem('bookingHistory', JSON.stringify(updatedHistory));
    
        try {
            // ✅ Send a **single** email to both the user and the admin
            await sendEmail(user.email, adminEmail, newBooking);
            alert(`Court ${selectedCourt} booked on ${selectedDate} at ${selectedSlot}`);
        } catch (error) {
            console.error("Error sending booking email:", error);
        }
    };
    
    const handleCancellation = async () => {
        if (!selectedDate || !selectedCourt || !selectedSlot) {
            alert('Please select a date, court, and time slot to cancel your booking.');
            return;
        }


        const endTime = getSlotEndTime();
        if (endTime < new Date()) {
            alert("You cannot cancel a past booking!");
            return;
        }

    
        const updatedBookings = { ...bookings };
    
        // ✅ Check if user has bookings on that date
        if (!updatedBookings[selectedDate] || !updatedBookings[selectedDate][user.email]) {
            alert("No booking found for the selected date.");
            return;
        }
    
        // ✅ Ensure the booking exists before removing it
        const userBookings = updatedBookings[selectedDate][user.email];
        const newBookings = userBookings.filter(
            (booking) => !(booking.courtNumber === selectedCourt && booking.timeSlot === selectedSlot)
        );
    
        if (newBookings.length === userBookings.length) {
            alert("No matching booking found to cancel.");
            return;
        }
    
        // ✅ Update state only if a booking was removed
        updatedBookings[selectedDate][user.email] = newBookings;
    
        if (newBookings.length === 0) {
            delete updatedBookings[selectedDate][user.email]; // Remove empty user entry
            if (Object.keys(updatedBookings[selectedDate]).length === 0) {
                delete updatedBookings[selectedDate]; // Remove empty date entry
            }
        }
    
        localStorage.setItem('courtBookings', JSON.stringify(updatedBookings));
        setBookings(updatedBookings);
    
        const canceledBooking = {
            courtNumber: selectedCourt,
            date: selectedDate,
            timeSlot: selectedSlot,
            action: 'Cancelled',
            timestamp: new Date().toLocaleString()
        };
    
        const updatedHistory = [...history, canceledBooking];
        setHistory(updatedHistory);
        localStorage.setItem('bookingHistory', JSON.stringify(updatedHistory));
    
        try {
            // ✅ Send a **single** email to both the user and the admin
            await sendCancellationEmail(user.email, adminEmail, canceledBooking);
            alert('Your booking has been canceled.');
        } catch (error) {
            console.error("Error sending cancellation email:", error);
        }
    };
    

    const isSlotBooked = (court, date, slot) => {
        const reservedSlots = [ '05:30-06:15 PM', '06:15-07:00 PM', '07:00-08:00 PM'];
        if ((court === 1 || court === 2 || court === 3) && reservedSlots.includes(slot)) {
            return true; // These slots always appear as booked
        }
        return Object.values(bookings[date] || {}).some(userBookings =>
            userBookings.some(booking => booking.courtNumber === court && booking.timeSlot === slot)
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
                    marginBottom: '15px',
                    borderRadius: '5px'
                }}>
                {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
            </button>

            <button onClick={onLogout} style={{
                padding: '10px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '15px',
                borderRadius: '5px'
            }}>Logout</button>

            <h2 className="court-booking-title">Court Booking</h2>

            <label>Select Date: </label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <br />

            <label>Select Time Slot: </label>
            <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                <option value="">Select Time Slot</option>
                {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                ))}
            </select>
            <br />

            <label>Select Court: </label>
            <div style={{ display: 'flex', gap: '10px' }}>
                {courts.map((court) => {
                    const isBooked = isSlotBooked(court, selectedDate, selectedSlot);
                    return (
                        <div key={court} style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: isBooked ? 'red' : (selectedCourt === court ? 'blue' : 'green'),
                            color: 'white',
                            textAlign: 'center',
                            lineHeight: '60px',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            borderRadius: '10px',
                            border: selectedCourt === court ? `3px solid ${darkMode ? 'white' : 'black'}` : `1px solid ${darkMode ? 'white' : 'black'}`,
                            transform: selectedCourt === court ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 0.2s ease-in-out'
                        }} onMouseOver={() => setSelectedCourt(court)}>
                            {court}
                        </div>
                    );
                })}
            </div>
            <br />

            <button onClick={handleBooking} disabled={!selectedCourt || !selectedSlot || !selectedDate ||  getSlotEndTime() < new Date()}
                style={{
                    padding: '10px',
                    backgroundColor: getSlotEndTime() < new Date() ? "gray" : "green" ,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '5px'
                }}>
                Book Court
            </button>
            <button onClick={handleCancellation} disabled={getSlotEndTime() < new Date()}
                style={{
                    marginLeft: '10px',
                    padding: '10px',
                    backgroundColor: getSlotEndTime() < new Date() ? "gray" : "red",
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '5px'
                }}>
                Cancel Booking
            </button>

            <h3>Booking History</h3>
            <ul>
                {history.map((entry, index) => (
                    <li key={index}>{entry.timestamp} - Court {entry.courtNumber} {entry.action} on {entry.date} at {entry.timeSlot}</li>
                ))}
            </ul>
        </div>
    );
};

CourtBooking.propTypes = {
    user: PropTypes.shape({ email: PropTypes.string.isRequired }).isRequired,
    onLogout: PropTypes.func.isRequired,
};

export default CourtBooking;

