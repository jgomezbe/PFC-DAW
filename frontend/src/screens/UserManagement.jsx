import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
const UserApprovalScreen = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}users`);
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await axios.post(`${API_URL}users/${userId}/approve`);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>User Approval</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleApproveUser(user.id)}>Approve</button>
                <button onClick={() => handleRejectUser(user.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserApprovalScreen;
