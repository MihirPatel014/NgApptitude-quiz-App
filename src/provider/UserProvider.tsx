import React, { createContext, useState, ReactNode, useEffect } from 'react';
import {  User } from '../types/user'; // Adjust the path accordingly
import { lookInSession } from "../common/session"


interface UserContextType {
    userAuth: User | null; // Initially null because the user is not logged in
    setUserAuth: (user: User | null) => void; // Function to update the user authentication state
}

// Create the context with a default value
export const UserContext = createContext<UserContextType>({
    userAuth: null, // Default is null
    setUserAuth: () => { }, // No-op function for now
});

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [userAuth, setUserAuth] = useState<User | null>(null); // userAuth is null initially

    // Check if there's a token stored in localStorage (or any other storage you're using)
    useEffect(() => {
        const storedUser = lookInSession('user'); // Or sessionStorage, etc.
        if (storedUser) {
            setUserAuth(JSON.parse(storedUser)); // Set the user details from storage
        }
    }, []);
    return (
        <UserContext.Provider value={{ userAuth, setUserAuth }}>
            {children}
        </UserContext.Provider>
    );
};
