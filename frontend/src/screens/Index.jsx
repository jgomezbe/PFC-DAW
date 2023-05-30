import React from "react";
import CustomNavbar from "../components/CustomNavbar";
import Footer from "../components/Footer";
import Gallery from "../components/Gallery";
import WelcomeMessage from "../components/WelcomeMessage";
import "../static/css/Index.module.css";
import "jquery-ui";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Index() {
    return (
        <div>
            <div>
                <CustomNavbar />
                <div className="container">
                    <WelcomeMessage />
                    <Gallery />

                </div>
                <Footer />
            </div>
        </div>
    );
}

export default Index;
