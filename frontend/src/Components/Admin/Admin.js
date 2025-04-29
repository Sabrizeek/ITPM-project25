import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import UserTable from './UserTable';
import Nav from '../Nav/NavAdmin';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [formData, setFormData] = useState({
    lgname: '',
    lggmail: '',
    lgage: '',
    lgnumber: '',
    lgaddress: ''
  });
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
    }

    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = userData?.token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get('/api/auth/allusers', config);
      setUsers(response.data.users || []);
      setMessage('');
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching users:', err);

      let errorMessage = 'Error fetching users. ';
      if (err.response) {
        errorMessage += `Server responded with status ${err.response.status}: ${err.response.data.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage += 'No response from server.';
      } else {
        errorMessage += err.message;
      }

      setMessage(errorMessage);

      if (retryCount < maxRetries && !isRetry) {
        setTimeout(() => {
          fetchUsers(true);
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = userData?.token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`/api/auth/updateuser/${userToUpdate}`, formData, config);
      setUserToUpdate(null);
      setFormData({ lgname: '', lggmail: '', lgage: '', lgnumber: '', lgaddress: '' });
      fetchUsers();
      setMessage('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      setMessage('Error updating user: ' + (err.response?.data.message || err.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = userData?.token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/auth/deleteuser/${deleteConfirmation}`, config);
      fetchUsers();
      setDeleteConfirmation(null);
      setMessage('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      setMessage('Error deleting user: ' + (err.response?.data.message || err.message));
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('User List', 14, 20);

      const usersWithoutAdmin = sortedUsers.filter(user => user.lggmail !== 'admin@gmail.com');
      const columns = ['Name', 'Email', 'Age', 'Mobile', 'Address'];
      const data = usersWithoutAdmin.map(user => [
        user.lgname,
        user.lggmail,
        user.lgage.toString(),
        user.lgnumber.toString(),
        user.lgaddress,
      ]);

      autoTable(doc, {
        startY: 30,
        head: [columns],
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      });

      doc.save('users.pdf');
    } catch (err) {
      console.error('PDF generation failed', err);
      setMessage('Failed to generate PDF');
    }
  };

  const filteredUsers = users.filter(user =>
    user.lgname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lggmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOrder === 'asc') return a.lgage - b.lgage;
    if (sortOrder === 'desc') return b.lgage - a.lgage;
    return 0;
  });

  return (
    <div style={{ padding: '20px' }}>
      <Nav />
      <h2>Admin Dashboard</h2>

      {message && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          <p>{message}</p>
          {retryCount >= maxRetries && (
            <button onClick={() => fetchUsers(true)} style={{ marginTop: '5px' }}>
              Retry Fetching Users
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="">Sort by Age</option>
          <option value="asc">Age: Low to High</option>
          <option value="desc">Age: High to Low</option>
        </select>
        <button onClick={handleDownloadPDF}>Download PDF</button>
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : users.length === 0 && !message ? (
        <div>No users found.</div>
      ) : (
        <UserTable
          users={sortedUsers}
          onUpdateUser={(user) => {
            setUserToUpdate(user._id);
            setFormData(user);
          }}
          onDeleteUser={(userId) => setDeleteConfirmation(userId)}
        />
      )}

      {userToUpdate && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update User</h3>
            <form onSubmit={handleUpdateUser}>
              <input
                type="text"
                placeholder="Name"
                value={formData.lgname}
                onChange={(e) => setFormData({ ...formData, lgname: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.lggmail}
                onChange={(e) => setFormData({ ...formData, lggmail: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={formData.lgage}
                onChange={(e) => setFormData({ ...formData, lgage: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Mobile"
                value={formData.lgnumber}
                onChange={(e) => setFormData({ ...formData, lgnumber: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.lgaddress}
                onChange={(e) => setFormData({ ...formData, lgaddress: e.target.value })}
                required
              />
              <button type="submit">Update</button>
              <button type="button" onClick={() => setUserToUpdate(null)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this user?</p>
            <button onClick={handleDeleteUser}>Yes, Delete</button>
            <button onClick={() => setDeleteConfirmation(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
