import React from 'react';
// import './UserTable.css'; // Custom styles for the table

const UserTable = ({ users, onUpdateUser, onDeleteUser }) => {
  // Ensure users is an array to prevent errors during rendering
  const safeUsers = Array.isArray(users) ? users : [];
  
  const adminUsers = safeUsers.filter(user => user.lggmail === 'admin@gmail.com');
  const otherUsers = safeUsers.filter(user => user.lggmail !== 'admin@gmail.com');
  const sortedUsers = [...adminUsers, ...otherUsers];

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Mobile</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                No users available.
              </td>
            </tr>
          ) : (
            sortedUsers.map(user => (
              <tr
                key={user._id}
                className={user.lggmail === 'admin@gmail.com' ? 'admin-row' : ''}
              >
                <td>
                  {user.lgname}
                  {user.lggmail === 'admin@gmail.com' && (
                    <span className="admin-tag">Admin</span>
                  )}
                </td>
                <td>{user.lggmail}</td>
                <td>{user.lgage}</td>
                <td>{user.lgnumber}</td>
                <td>{user.lgaddress}</td>
                <td>
                  <button
                    className="update-btn"
                    onClick={() => onUpdateUser(user)}
                    disabled={user.lggmail === 'admin@gmail.com'}
                  >
                    Update
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => onDeleteUser(user._id)}
                    disabled={user.lggmail === 'admin@gmail.com'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;