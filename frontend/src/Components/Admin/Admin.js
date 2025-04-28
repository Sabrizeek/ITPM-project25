import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserTable from './UserTable';
import './Admin.css';
import Nav from '../Nav/NavAdmin.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [userDetails, setUserDetails] = useState({ lgname: '', lggmail: '', lgage: '', lgnumber: '', lgaddress: '' });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/lguser/allusers');
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      setError('Error fetching users');
    }
    setLoading(false);
  };

  const handleUpdateUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/lguser/updateuser/${userId}`, userDetails);
      setUserToUpdate(null);
      setUserDetails({ lgname: '', lggmail: '', lgage: '', lgnumber: '', lgaddress: '' });
      fetchUsers();
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setError('Error updating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/lguser/deleteuser/${userId}`);
      fetchUsers();
      setDeleteConfirmation(null);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (err) {
      setError('Error deleting user');
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation logic
    if (name === 'lgnumber' && value.length !== 10) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }

    if (name === 'lgage' && (isNaN(value) || value < 0)) {
      setError('Age must be a positive number');
      return;
    }

    if (name === 'lgname' && !/^[a-zA-Z\s]*$/.test(value)) {
      setError('Name cannot contain special characters');
      return;
    }

    setUserDetails({ ...userDetails, [name]: value });
    setError(null); // Clear any previous errors
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('User List', 10, 10);

    // Filter out the admin user
    const usersWithoutAdmin = sortedUsers.filter(user => user.lggmail !== 'pamod@gmail.com');

    const columns = ['Name', 'Email', 'Age', 'Mobile', 'Address'];
    const rows = usersWithoutAdmin.map(user => [
      user.lgname.toString(),
      user.lggmail.toString(),
      user.lgage.toString(),
      user.lgnumber.toString(),
      user.lgaddress.toString(),
    ]);

    let startY = 20;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    columns.forEach((col, index) => doc.text(col, 11 + index * 40, startY));
    doc.setFont(undefined, 'normal');
    rows.forEach((row, rowIndex) => {
      startY += 10;
      row.forEach((cell, colIndex) => doc.text(cell, 10 + colIndex * 40, startY));
    });

    doc.save('users.pdf');
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
    <div>
      <Nav />
      <h2>Admin Dashboard</h2>

      {loading && <p>Loading users...</p>}
      {error && <div className="error-message">{error}</div>}
      {updateSuccess && <div className="success-message">User updated successfully!</div>}
      {deleteSuccess && <div className="success-message">User deleted successfully!</div>}
      <div className="controls">
  <input
    type="text"
    placeholder="Search by name or email..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="search-bar"
  />

  <select
    value={sortOrder}
    onChange={(e) => setSortOrder(e.target.value)}
    className="sort-dropdown"
  >
    <option value="">Sort by Age</option>
    <option value="asc">Age: Low to High</option>
    <option value="desc">Age: High to Low</option>
  </select>

  <button onClick={handleDownloadPDF} className="download-pdf-button">
    Download PDF
  </button>
</div>

      {sortedUsers.length > 0 ? (
        <UserTable
          users={sortedUsers}
          onUpdateUser={(user) => {
            setUserToUpdate(user._id);
            setUserDetails(user);
          }}
          onDeleteUser={(userId) => setDeleteConfirmation(userId)}
        />
      ) : (
        <p>No users found</p>
      )}

      {userToUpdate && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update User</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(userToUpdate);
              }}
            >
              <label>
                Name
                <input
                  type="text"
                  name="lgname"
                  value={userDetails.lgname}
                  onChange={handleInputChange}
                  required
                  pattern="[a-zA-Z\s]*"
                  title="Name cannot contain special characters"
                />
              </label>
              <label>
                Email
                <input
                  type="text"
                  name="lggmail"
                  value={userDetails.lggmail}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Age
                <input
                  type="number"
                  name="lgage"
                  value={userDetails.lgage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  title="Age must be a positive number"
                />
              </label>
              <label>
                Mobile
                <input
                  type="text"
                  name="lgnumber"
                  value={userDetails.lgnumber}
                  onChange={handleInputChange}
                  required
                  pattern="\d{10}"
                  title="Mobile number must be exactly 10 digits"
                />
              </label>
              <label>
                Address
                <input
                  type="text"
                  name="lgaddress"
                  value={userDetails.lgaddress}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <div className="modal-buttons">
                <button type="submit">Update</button>
                <button type="button" onClick={() => setUserToUpdate(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure you want to delete this user?</h3>
            <div className="modal-buttons">
              <button onClick={() => handleDeleteUser(deleteConfirmation)}>Yes, Delete</button>
              <button onClick={() => setDeleteConfirmation(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;