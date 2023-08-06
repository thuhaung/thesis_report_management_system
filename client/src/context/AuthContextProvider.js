import axios from "axios";
import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState({
        user_id: null,
        user_type: null
    });
    const [deadline, setDeadline] = useState("");

    const login = (userId, userType) => {
        setUser({
            user_id: userId,
            user_type: userType
        });
        localStorage.setItem("user_id", userId);
        localStorage.setItem("user_type", userType);
    }

    const logout = () => {
        setUser({
            user_id: null,
            user_type: null
        });

        localStorage.removeItem("user_id");
        localStorage.removeItem("user_type");
    }

    useEffect(() => {
        if (localStorage.getItem("user_id") && localStorage.getItem("user_type")) {
            setUser({user_id: localStorage.getItem("user_id"), user_type: localStorage.getItem("user_type")});
        }

        axios.get(process.env.REACT_APP_BACKEND_HOST + "get-deadline").then(response => {
            setDeadline(response.data);
        }).catch(error => {
            console.log(error);
        });
    }, []);
    
    return (
        <AuthContext.Provider value={{user, deadline, login, logout}}>
            { children }
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;