import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const UserManagement = () => {
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchApprovalRequests();
  }, []);

  const fetchApprovalRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/approval-request/`, {
        withCredentials: true,
      });
      setApprovalRequests(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const approveUser = async (id) => {
    try {
      await axios.post(`${API_URL}/user-management/${id}/`);
      setSuccessMessage("Usuario aprobado exitosamente.");
      setErrorMessage("");
      fetchApprovalRequests();
    } catch (error) {
      console.error(error);
      setSuccessMessage("");
      setErrorMessage("Error al aprobar el usuario.");
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.delete(`${API_URL}/user-management/${id}/`);
      setSuccessMessage("Solicitud rechazada exitosamente.");
      setErrorMessage("");
      fetchApprovalRequests();
    } catch (error) {
      console.error(error);
      setSuccessMessage("");
      setErrorMessage("Error al rechazar la solicitud.");
    }
  };

  return (
    <div>
      <h2 className="text-center">Solicitudes de verificación</h2>
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      <div className="row">
        {approvalRequests.map((request) => (
          <div className="col-md-4 mb-4" key={request.id}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{request.nombre}</h5>
                <p className="card-text">{request.apellidos}</p>
                <p className="card-text">{request.mensaje}</p>
                <button
                  className="btn btn-success mr-2"
                  onClick={() => approveUser(request.id)}
                >
                  Aprobar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => rejectRequest(request.id)}
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
