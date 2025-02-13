import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import CourtBooking from './CourtBooking';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser ? authUser : null);
        });

        return () => unsubscribe();
    }, []);

    // 🔴 Fix: Add a logout function
    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                console.log("User logged out");
                setUser(null); // Clear user state
            })
            .catch((error) => console.error("Logout error:", error));
    };

    return (
        <div className="App">
            {!user ? (
                <Auth setUser={setUser} />
            ) : (
                <div>
                    <h2>Welcome, {user.email}</h2>
                    {/* ✅ Pass handleLogout to CourtBooking */}
                    <CourtBooking user={user} onLogout={handleLogout} />
                    <button onClick={handleLogout}>Logout</button> {/* Add logout button */}
                </div>
            )}
        </div>
    );
}

export default App;
