import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const UserManagement = () => {
  const [approvalRequests, setApprovalRequests] = useState([]);

  useEffect(() => {
    fetchApprovalRequests(); // Llama a la función para obtener las solicitudes de aprobación al montar el componente
  }, []);

  const fetchApprovalRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/approval-request/`, {
        withCredentials: true,
      });
      setApprovalRequests(response.data); // Almacena las solicitudes de aprobación en el estado
    } catch (error) {
      console.error(error);
    }
  };

  const approveUser = async (id) => {
    try {
      await axios.post(`${API_URL}/user-management/${id}/`);
      fetchApprovalRequests(); // Vuelve a obtener las solicitudes de aprobación después de aprobar un usuario
    } catch (error) {
      console.error(error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.delete(`${API_URL}/user-management/${id}/`);
      fetchApprovalRequests(); // Vuelve a obtener las solicitudes de aprobación después de rechazar una solicitud
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-center">Solicitudes de verificación</h2>
      <div className="row">
        {/* Mapea las solicitudes de aprobación y renderiza una tarjeta para cada una */}
        {approvalRequests.map((request) => (
          <div className="col-md-4 mb-4" key={request.id}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{request.nombre}</h5>
                <p className="card-text">{request.apellidos}</p>
                <p className="card-text">{request.mensaje}</p>
                {/* Botones para a  probar o rechazar la solicitud */}
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
