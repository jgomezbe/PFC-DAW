import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ApprovalRequestForm from "../components/ApprovalRequestForm";
import { API_URL } from "../config";
import Cookies from "js-cookie";
import CustomNavbar from "../components/CustomNavbar";
import Footer from "../components/Footer";

function ApprovalRequest() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            "X-CSRFToken": Cookies.get("csrftoken"),
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        };

        const [currentUserResponse, approvalRequestResponse] = await Promise.all([
          axios.get(`${API_URL}/current-user/`, config),
          axios.get(`${API_URL}/approval-request/`, config)
        ]);

        if (currentUserResponse.data.is_approved) {
          setIsApproved(true);
        }

        setUserId(currentUserResponse.data.id);
        console.log(approvalRequestResponse.data, isApproved);
        if (approvalRequestResponse.data.message) {
          setError("Ya has enviado una solicitud de verificación");
          setHasSentRequest(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  async function handleSubmit(formData) {
    try {
      const config = {
        headers: {
          "X-CSRFToken": Cookies.get("csrftoken"),
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      };

      const response = await axios.post(
        `${API_URL}/approval-request/`,
        formData,
        config
      );
      setSuccess("Tu solicitud ha sido enviada correctamente");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.log(error);
      setError("Ha ocurrido un error al enviar la solicitud");
    }
  }

  return (
    <div>
      <CustomNavbar />
      <div className="container mt-5 min-vh-100">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">
                  Solicitud de verificación de identidad
                </h5>
                <hr />
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                {hasSentRequest && (
                  <div className="alert alert-info" role="alert">
                    Ya has enviado una solicitud de verificación. Ponte en
                    contacto con el administrador.
                  </div>
                )}
                {isApproved && (
                  <div className="alert alert-success" role="alert">
                    ¡Ya estás aprobado!
                  </div>
                )}
                {!hasSentRequest && !error && !isApproved && (
                  <>
                    {success && (
                      <div className="alert alert-success" role="alert">
                        {success}
                      </div>
                    )}
                    {!success && (
                      <ApprovalRequestForm
                        onSubmit={handleSubmit}
                        userId={userId}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ApprovalRequest;
