import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Register from './screens/Register';
import Profile from './screens/Profile';
import PasswordChange from './screens/PasswordChange';
import Index from './screens/Index';
import LoginScreen from './screens/LoginScreen';
import LogoutScreen from './screens/LogoutScreen';
import ApprovalRequest from './screens/ApprovalRequest';
import AdminPanel from './screens/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Index />} />
        <Route exact path="/registro" element={<Register />} />
        <Route exact path="/login" element={<LoginScreen />} />
        <Route exact path="/logout" element={<LogoutScreen />} />
        <Route exact path='/perfil/:username/' element={<Profile />} />
        <Route exact path="/cambiar-contraseña" element={<PasswordChange />} />
        <Route exact path="/solicitar-aprobacion" element={<ApprovalRequest />} />
        <Route exact path="/panel-admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
