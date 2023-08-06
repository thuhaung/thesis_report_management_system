import React from "react";
import Report from "./pages/Report/Report";
import Homepage from "./pages/Homepage/Homepage";
import Login from "./pages/Login/Login";
import Logout from "./pages/Logout/Logout";
import { createBrowserRouter } from "react-router-dom";
import Guidelines from "./pages/Guidelines/Guidelines";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

const router = createBrowserRouter([
    {
        path: "/",
        element: <PrivateRoute children={<Homepage />} />
    },
    {
        path: "/report/:id",
        element: <PrivateRoute children={<Report />} />
    },
    {
        path: "/guidelines",
        element: <PrivateRoute children={<Guidelines />} />
    },
    {
        path: "/login",
        element: <Login /> 
    },
    {
        path: "/logout",
        element: <Logout /> 
    }
]);

export default router;