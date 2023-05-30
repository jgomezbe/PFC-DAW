import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../config";
import Cookies from "js-cookie";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const ProfileCard = () => {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [photo, setPhoto] = useState(null);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    // Si se hace clic fuera del elemento del dropdown, se desactiva la edición
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setEditing(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/current-user/`, {
        withCredentials: true,
      });
      const { data } = response;
      setProfile(data);
      setFullName(`${data.first_name} ${data.last_name}`);
      setDireccion(data.profile.direccion);
      setTelefono(data.profile.telefono || "");
      setPhoto(API_URL + data.profile.photo);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = () => {
    // Activa el modo de edición y limpia el mensaje de éxito
    setEditing(true);
    setSuccessMessage("");
  };

  const handleSave = async () => {
    try {
      if (!profile) {
        return;
      }
      const formData = new FormData();
      formData.append("username", profile.username);
      formData.append("direccion", direccion);
      formData.append("telefono", telefono);
      if (tempPhoto) {
        formData.append("photo", tempPhoto);
      }

      const response = await axios.put(
        `${API_URL}/profile/${profile.username}/`,
        formData,
        {
          headers: {
            "X-CSRFToken": Cookies.get("csrftoken"),
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      const { data } = response;

      // Actualiza los datos del perfil con los datos guardados
      setProfile(data);
      setDireccion(data.direccion);
      setTelefono(data.telefono);
      setEditing(false);
      setSuccessMessage("Se han guardado los cambios en el perfil");

      setTimeout(() => {
        window.location.reload(); // Recarga la página después de 2 segundos
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    // Cancela la edición y restaura los valores originales
    setEditing(false);
    setDireccion(direccion);
    setTelefono(telefono);
    setTempPhoto(null);
  };

  const handleFileChange = (event) => {
    // Actualiza la foto temporal al seleccionar un archivo
    const file = event.target.files[0];
    if (file) {
      setTempPhoto(file);
    }
  };

  return (
    <div className="container">
      <div className="card mb-3 mt-2">
        <div className="card-body text-center">
          <h5 className="card-title">Tu perfil</h5>
          <img
            src={photo}
            alt="Foto de perfil"
            className="img-thumbnail"
            style={{
              height: "150px",
              width: "150px",
              borderRadius: "50%",
            }}
          />

          {editing ? (
            // Modo de edición del perfil
            <div ref={dropdownRef}>
              <div className="info-item">
                <label>Nombre completo</label>
                <p>{fullName}</p>
              </div>
              <div className="mb-3">
                <label htmlFor="direccion" className="form-label">
                  Dirección
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder={direccion}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">
                  Teléfono
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder={telefono}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="photo" className="form-label">
                  Foto de perfil
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <button className="btn btn-primary" onClick={handleSave}>
                Guardar
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          ) : (
            // Modo de visualización del perfil
            <div className="profile-info">
              <div className="info-item">
                <label>Nombre completo</label>
                <p>{fullName}</p>
              </div>
              <div className="info-item">
                <label>Dirección</label>
                <p>{direccion}</p>
              </div>
              <div className="info-item">
                <label>Teléfono</label>
                <p>{telefono}</p>
              </div>
            </div>
          )}

          {!editing && (
            // Botón para activar el modo de edición
            <button className="btn btn-primary" onClick={handleEdit}>
              Editar
            </button>
          )}

          {successMessage && (
            // Mensaje de éxito después de guardar los cambios
            <div className="alert alert-success mt-3">{successMessage}</div>
          )}

          <Button
            variant="primary"
            className="mx-2 my-2 animate__animated animate__fadeIn"
          >
            <Link className="nav-link" to="/cambiar-contraseña/">
              Cambia tu contraseña
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
