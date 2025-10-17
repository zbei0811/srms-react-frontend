// src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const UserCtx = createContext(null);
export const useUser = () => useContext(UserCtx);

export default function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const cached = localStorage.getItem("srms_user");
        if (cached) setUser(JSON.parse(cached));
    }, []);

    const signin = (name = "Guest") => {
        const id = "u_" + Math.random().toString(36).slice(2, 8);
        const u = { id, name };
        setUser(u);
        localStorage.setItem("srms_user", JSON.stringify(u));
    };

    const signout = () => {
        setUser(null);
        localStorage.removeItem("srms_user");
    };

    return (
        <UserCtx.Provider value={{ user, signin, signout }}>
            {children}
        </UserCtx.Provider>
    );
}
