import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import Cookies from "js-cookie";
import { Modal } from "react-bootstrap";

const TransferList = () => {
  const [transferLists, setTransferLists] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);

  useEffect(() => {
    const fetchTransferLists = async () => {
      try {
        const response = await axios.get(`${API_URL}/transfer-lists/`, {
          headers: {
            "X-CSRFToken": Cookies.get("csrftoken"),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setTransferLists(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/current-user/`, {
          headers: {
            "X-CSRFToken": Cookies.get("csrftoken"),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTransferLists();
    fetchCurrentUser();
  }, []);

  const handleOpenModal = (list) => {
    setSelectedList(list);
  };

  const handleCloseModal = () => {
    setSelectedList(null);
  };

  const handleDeleteTransferList = async (listId) => {
    try {
      const confirmDelete = window.confirm("¿Estás seguro de que deseas borrar esta lista?");
      if (confirmDelete) {
        const response = await axios.delete(`${API_URL}/transfer-lists/${listId}/`, {
          headers: {
            "X-CSRFToken": Cookies.get("csrftoken"),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setDeleteResult(response.data.message);
        const updatedLists = transferLists.filter((list) => list.id !== listId);
        setTransferLists(updatedLists);
      }
    } catch (error) {
      console.log(error);
    }
    setDeleteConfirmation(false);
  };

  return (
    <div>
      <h2>Listas de traspasos:</h2>
      {deleteResult && <p className={`alert ${deleteResult.success ? "alert-success" : "alert-danger"}`}>{deleteResult.message}</p>}
      {transferLists.map((list) => (
        <div key={list.id} className="card mb-3">
          <div className="card-body">
            <h3 className="card-title">{list.name}</h3>
            <ul className="list-group list-group-flush">
              {list.transfers.length > 0 ? (
                list.transfers.map((transfer, index) => (
                  <li key={index} className="list-group-item">
                    {transfer.player_name}
                  </li>
                ))
              ) : (
                <li className="list-group-item">No hay transfers en esta lista.</li>
              )}
            </ul>
            {currentUser && (
              (currentUser.is_admin || currentUser.id === list.user_id) && (
                <div>
                  <p>Creado por: {list.username}</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleOpenModal(list)}
                  >
                    Ver contenido
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger ml-2"
                    onClick={() => setDeleteConfirmation(true)}
                  >
                    Borrar lista
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      ))}

      {/* Modal */}
      <Modal show={selectedList} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contenido de la lista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedList && selectedList.transfers.length > 0 ? (
            <ul className="list-group">
              {selectedList.transfers.map((transfer, index) => (
                <li key={index} className="list-group-item">
                  {transfer.player_name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay transfers en esta lista.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteConfirmation} onHide={() => setDeleteConfirmation(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Confirmación de borrado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas borrar esta lista?</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleDeleteTransferList(selectedList.id)}
          >
            Borrar
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirmation(false)}>
            Cancelar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransferList;
