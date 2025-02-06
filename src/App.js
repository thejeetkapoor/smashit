import React, { useState } from 'react';
import Auth from './Auth';
import CourtBooking from './CourtBooking';

function App() {
    const [user, setUser] = useState(null);

    return (
        <div className="App">
            {!user ? (
                <Auth setUser={setUser} />
            ) : (
                <div>
                    <h2>Welcome, {user.email}</h2>
                    <CourtBooking user={user} />
                </div>
            )}
        </div>
    );
}

export default App;
