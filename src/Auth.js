import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase'; // Import auth from firebase.js
import PropTypes from 'prop-types'; // Import PropTypes for prop validation

const provider = new GoogleAuthProvider();

function Auth({ setUser }) {
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user); // Set the user after successful login
        } catch (error) {
            console.error('Error during login:', error.message);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Login</h1>
            <button 
                style={styles.button} 
                onClick={handleLogin} 
                className="hover-button" // Add class for hover effect
            >
                Sign in with Google
            </button>
        </div>
    );
}

// Basic styles for the component
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
    },
    header: {
        fontSize: '2rem',
        marginBottom: '20px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '1rem',
        cursor: 'pointer',
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        transition: 'background-color 0.3s',
    },
};

// Prop types validation
Auth.propTypes = {
    setUser: PropTypes.func.isRequired, // Validate that setUser is a function
};

export default Auth;
