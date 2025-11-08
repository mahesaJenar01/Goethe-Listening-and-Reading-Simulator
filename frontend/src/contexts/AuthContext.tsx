import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
    userId: string | null;
    login: (id: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(() => {
        // Retrieve userId from sessionStorage on initial load
        return sessionStorage.getItem('examAppUserId');
    });

    useEffect(() => {
        // Listen for storage changes to sync across tabs (optional but good practice)
        const handleStorageChange = () => {
            setUserId(sessionStorage.getItem('examAppUserId'));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (id: string) => {
        sessionStorage.setItem('examAppUserId', id);
        setUserId(id);
    };

    const logout = () => {
        sessionStorage.removeItem('examAppUserId');
        localStorage.removeItem('examSession'); // Also clear any ongoing exam
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};