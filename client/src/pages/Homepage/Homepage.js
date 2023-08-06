import React from "react";
import InstructorHomepage from "../Homepage/InstructorHomepage/InstructorHompage.js";
import StudentHomepage from "../Homepage/StudentHomepage/StudentHomepage.js";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import AdminHomepage from "./AdminHomepage/AdminHomepage.js";

const Homepage = () => {
    const { user } = useContext(AuthContext);

    const renderHomepage = () => {
        if (user.user_type === "Student") {
            return <StudentHomepage />
        }
        else if (user.user_type === "Instructor") {
            return <InstructorHomepage />
        }
        else if (user.user_type === "Admin") {
            return <AdminHomepage />
        }
    }

    return (
        <div className="homepage">
            {
                renderHomepage()
            }
        </div>
    );
}

export default Homepage;