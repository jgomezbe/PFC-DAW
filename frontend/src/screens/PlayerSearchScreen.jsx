import React from "react";
import PlayerSearch from "../components/PlayerSearch";
import CustomNavbar from "../components/CustomNavbar";
import Footer from "../components/Footer";

const PlayerSearchScreen = () => {
    return (
        <div>
            <CustomNavbar />
            <div className="container min-vh-110">
                <PlayerSearch />
            </div>
            <Footer />
        </div>
    );
};

export default PlayerSearchScreen;
