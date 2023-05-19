import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import Cookies from 'js-cookie';

const ProfileCard = () => {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [photo, setPhoto] = useState(null);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
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
      console.log(data);
      setProfile(data);
      setFullName(`${data.first_name} ${data.last_name}`);
      setDireccion(data.profile.direccion);
      setTelefono(data.profile.telefono || '');
      setPhoto(API_URL + data.profile.photo);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setSuccessMessage('');
  };

  const handleSave = async () => {
    try {
      if (!profile) {
        return;
      }
      const formData = new FormData();
      formData.append('username', profile.username);
      formData.append('direccion', direccion);
      formData.append('telefono', telefono);
      if (tempPhoto) {
        formData.append('photo', tempPhoto);
      }

      const response = await axios.put(
        `${API_URL}/profile/${profile.username}/`,
        formData,
        {
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      const { data } = response;

      setProfile(data);
      setDireccion(data.direccion);
      setTelefono(data.telefono);
      setEditing(false);
      setSuccessMessage('Se han guardado los cambios en el perfil');
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setDireccion(direccion);
    setTelefono(telefono);
    setTempPhoto(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTempPhoto(file);
    }
  };
  const handlePhotoClick = () => {
    setIsPhotoExpanded(!isPhotoExpanded);
  };
  
  const handleClosePhoto = () => {
    setIsPhotoExpanded(false);
  };
  
  return (
    <div className="container">
      <div className="card mb-3 mt-2">
        <div className="card-body text-center">
          <h5 className="card-title">Perfil de Usuario</h5>
          <div className="photo-container">
            <img
              src={photo}
              alt="Foto de perfil"
              className={`img-thumbnail ${isPhotoExpanded ? 'expanded' : ''}`}
              style={{ width: '200px', height: '200px', borderRadius: '50%' }}
              onClick={handlePhotoClick}
            />
            {isPhotoExpanded && (
              <div className="expanded-photo-overlay">
                <button className="close-button" onClick={handleClosePhoto}>
                  X
                </button>
                <div className="expanded-photo-container">
                  <img
                    src={photo}
                    alt="Foto de perfil ampliada"
                    className="expanded-photo"
                  />
                </div>
              </div>
            )}
          </div>
  

          {editing ? (
            <div ref={dropdownRef}>
              <div className="info-item">
                <label>Nombre completo:</label>
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
            <div className="profile-info">
              <div className="info-item">
                <label>Nombre completo:</label>
                <p>{fullName}</p>
              </div>
              <div className="info-item">
                <label>Dirección:</label>
                <p>{direccion}</p>
              </div>
              <div className="info-item">
                <label>Teléfono:</label>
                <p>{telefono}</p>
              </div>
            </div>
          )}
          {!editing && (
            <button className="btn btn-primary" onClick={handleEdit}>
              Editar
            </button>
          )}
          {successMessage && (
            <div className="alert alert-success mt-3">{successMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
