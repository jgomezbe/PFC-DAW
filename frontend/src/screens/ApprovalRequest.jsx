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
  const [userId, setUserId] = useState(null); // Nuevo estado para almacenar el user_id

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

        const currentUserResponse = await axios.get(
          `${API_URL}/current-user/`,
          config
        );
        if (currentUserResponse.data.is_approved) {
          setIsApproved(true);
        }

        setUserId(currentUserResponse.data.id); // Almacena el user_id en el estado

        const approvalRequestResponse = await axios.get(
          `${API_URL}/approval-request/`,
          config
        );
        if (approvalRequestResponse.data.message) {
          setError(approvalRequestResponse.data.message);
          if (
            approvalRequestResponse.data.message ===
            "Ya has enviado una solicitud de verificación"
          ) {
            setHasSentRequest(true);
          }
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
                {!hasSentRequest && !error && (
                  <>
                    {success && (
                      <div className="alert alert-success" role="alert">
                        {success}
                      </div>
                    )}
                    {!success && !isApproved && (
                      <ApprovalRequestForm
                        onSubmit={handleSubmit}
                        userId={userId} // Pasa el userId al componente ApprovalRequestForm
                      />
                    )}
                  </>
                )}
                {hasSentRequest && !error && (
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
