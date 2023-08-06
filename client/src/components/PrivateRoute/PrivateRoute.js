import React from "react";
import Notification from "../Notification/Notification";
import { Navigate } from "react-router-dom";
import NavBar from "../NavBar/NavBar";

const PrivateRoute = ({ children }) => {
    if (localStorage.getItem("user_id")) {
        return (
            <>
                <NavBar />
                {localStorage.getItem("user_type") !== "Admin" && <Notification />}
                { children }
            </>
        )
    }
    
    return <Navigate to="/login" replace={true} />
}

export default PrivateRoute;