import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ApprovalRequestForm from '../components/ApprovalRequestForm';
import { API_URL } from "../config";
import Cookies from "js-cookie";

function ApprovalRequest() {
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        // Comprobar si el usuario ya ha enviado una solicitud al cargar la página
        const config = {
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true, // Incluir cookies en la solicitud
        };

        axios.get(`${API_URL}/solicitar-aprobacion/`, {
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            },
            withCredentials: true // Incluir cookies en la solicitud
        })
            .then((res) => {
                if (res.data.message) {
                    setError(res.data.message);

                }

            })
            .catch((err) => {

                console.log(err);
            });

    }, []);

    function handleSubmit(formData) {
        const config = {
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true, // Incluir cookies en la solicitud
        };

        axios.post(`${API_URL}/solicitar-aprobacion/`, formData, config)
            .then((res) => {
                setSuccess("Tu solicitud ha sido enviada correctamente");
                navigate('/');
            })
            .catch((err) => {
                console.log(err);
                setError("Ha ocurrido un error al enviar la solicitud");
            });
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Solicitud de verificación de identidad</h5>
                            <hr />
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="alert alert-success" role="alert">
                                    {success}
                                </div>
                            )}
                            <ApprovalRequestForm onSubmit={handleSubmit} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApprovalRequest;
