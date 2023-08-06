import React from "react";
import axios from "axios";
import "./NavBar.scss";
import AuthContext from "../../context/AuthContext";
import { useContext, useState, useEffect } from "react";

const NavBar = () => {
    const [activeDropdown, setActiveDropdown] = useState(false);
    const { user } = useContext(AuthContext);

    return (
        <div className="nav">
            <div className="logo-section">
                <a className="link" href="/">
                    <img
                        className="logo"
                        src="https://blackboard.hcmiu.edu.vn/themes/test/images/iu_logo.png"
                        alt="International University logo" />
                    <div className="name">
                        International University
                    </div>
                </a>
            </div>
            <div className="account-section">
                <div className={"id " + (activeDropdown ? "active" : "")} onClick={() => setActiveDropdown(prev => !prev)}>
                    {user.user_id}
                </div>
            </div>
            <div className={"dropdown " + (activeDropdown ? "active" : "")}>
                <a className="option" href="/logout">
                    Logout
                </a>
            </div>
        </div>
    )
}

export default NavBar;