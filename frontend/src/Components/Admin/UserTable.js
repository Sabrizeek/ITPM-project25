import React from 'react';

const UserTable = ({ users, onUpdateUser, onDeleteUser }) => {
  const adminUsers = users.filter(user => user.lggmail === 'admin@gmail.com');
  const otherUsers = users.filter(user => user.lggmail !== 'admin@gmail.com');

  const sortedUsers = [...adminUsers, ...otherUsers];

  return (
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
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user) => (
            <tr
              key={user._id}
              className={user.lggmail === 'admin@gmail.com' ? 'admin-row' : ''}
            >
              <td>
                {user.lgname}
                {user.lggmail === 'admin@gmail.com' && (
                  <span className="admin-badge"> (Admin)</span>
                )}
              </td>
              <td>{user.lggmail}</td>
              <td>{user.lgage}</td>
              <td>{user.lgnumber}</td>
              <td>{user.lgaddress}</td>
              <td>
                {/* ✅ Important: add the correct className */}
                <button onClick={() => onUpdateUser(user)} className="update-button">
                  Update
                </button>
                <button onClick={() => onDeleteUser(user._id)} className="delete-button">
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" style={{ textAlign: 'center' }}>
              No users found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default UserTable;
