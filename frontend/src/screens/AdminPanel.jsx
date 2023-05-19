import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';
import CustomNavbar from '../components/CustomNavbar';
import Footer from '../components/Footer';
import { Table, Button } from 'react-bootstrap';

const AdminPanel = () => {
  const [playersLog, setPlayersLog] = useState([]);
  const [scrapeLog, setScrapeLog] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState([]);
  const [expandedLogsDetails, setExpandedLogsDetails] = useState({});

  const handleViewLog = async (script) => {
    try {
      const response = await axios.get(`${API_URL}/logs/?script=${script}`, {
        withCredentials: true,
      });

      if (script === 'players') {
        setPlayersLog(response.data.logs);
        setSelectedLog(selectedLog === 'players' ? null : 'players');
      } else if (script === 'scrape') {
        setScrapeLog(response.data.logs);
        setSelectedLog(selectedLog === 'scrape' ? null : 'scrape');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleToggleLog = (date) => {
    if (expandedLogs.includes(date)) {
      setExpandedLogs(expandedLogs.filter((item) => item !== date));
      setExpandedLogsDetails((prevState) => {
        const newState = { ...prevState };
        delete newState[date];
        return newState;
      });
    } else {
      setExpandedLogs([...expandedLogs, date]);
    }
  };

  const handleExpandLog = (date) => {
    setExpandedLogsDetails((prevState) => ({
      ...prevState,
      [date]: true,
    }));
  };

  const renderLog = () => {
    if (selectedLog === 'players') {
      return (
        <div>
          <h2>Log de Jugadores</h2>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ver log del día</th>
              </tr>
            </thead>
            <tbody>
              {playersLog.map((log, index) => (
                <tr key={index}>
                  <td className="date-cell">{formatDate(log.date)}</td>
                  <td>
                    {expandedLogs.includes(log.date) ? (
                      <div className="log-details-content">
                        <pre>{log.changes_detected}</pre>
                        <Button variant="primary" onClick={() => handleToggleLog(log.date)}>
                          Ocultar
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <pre>
                          {log.changes_detected
                            .split('\n')
                            .slice(0, 10)
                            .join('\n')}
                        </pre>
                        {log.changes_detected.split('\n').length > 10 && (
                          <Button variant="primary" onClick={() => handleExpandLog(log.date)}>
                            Ver más
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    } else if (selectedLog === 'scrape') {
      return (
        <div>
          <h2>Log de Scrapeo</h2>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ver log del día</th>
              </tr>
            </thead>
            <tbody>
              {scrapeLog.map((log, index) => (
                <tr key={index}>
                  <td className="date-cell">{formatDate(log.date)}</td>
                  <td>
                    {expandedLogs.includes(log.date) ? (
                      <div className="log-details-content">
                        <pre>{log.changes_detected}</pre>
                        <Button variant="primary" onClick={() => handleToggleLog(log.date)}>
                          Ocultar
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <pre>
                          {log.changes_detected
                            .split('\n')
                            .slice(0, 10)
                            .join('\n')}
                        </pre>
                        {log.changes_detected.split('\n').length > 10 && (
                          <Button variant="primary" onClick={() => handleExpandLog(log.date)}>
                            Ver más
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="text-center">
      <CustomNavbar />
      <h1 className="mb-4">Panel de administración</h1>
      <div className="my-4">
        <Button
          variant="primary"
          className="mx-2 my-2 animate__animated animate__fadeIn"
          onClick={() => handleViewLog('players')}
        >
          {selectedLog === 'players' ? 'Ocultar log de jugadores' : 'Ver log de jugadores'}
        </Button>
        <Button
          variant="primary"
          className="mx-2 my-2 animate__animated animate__fadeIn"
          onClick={() => handleViewLog('scrape')}
        >
          {selectedLog === 'scrape' ? 'Ocultar log de scrapeo' : 'Ver log de scrapeo'}
        </Button>
        <Button variant="primary" className="mx-2 my-2 animate__animated animate__fadeIn">
          <Link className="nav-link" to="/gestion-usuarios/">
            Aprobación de usuarios
          </Link>
        </Button>
      </div>
      {renderLog()}
      <Footer />
    </div>
  );
};

export default AdminPanel;
