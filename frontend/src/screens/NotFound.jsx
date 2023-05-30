import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import Footer from "../components/Footer";
import CustomNavbar from "../components/CustomNavbar";
const NotFound = () => {
    return (
        <div>
            <CustomNavbar />
            <div className="container">

                <div className="text-center mt-5">
                    <p className="lead">Página no encontrada</p>
                    <p>La página que estás buscando no existe.</p>
                    <Button variant="primary">
                        <Link className="text-white" to="/">
                            Volver a la página de inicio
                        </Link>
                    </Button>
                </div>
            </div>
            <Footer />

        </div>
    );
};

export default NotFound;
