import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import CourtBooking from './CourtBooking';
import { getAuth, onAuthStateChanged } from "firebase/auth";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser ? authUser : null); // Updates user state
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

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
