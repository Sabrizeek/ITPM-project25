import React from 'react';
import { Table, Button, Tag } from 'antd';
// import './UserTable.css'; // You can define .admin-row and other custom styles here if needed

const UserTable = ({ users, onUpdateUser, onDeleteUser }) => {
  const safeUsers = Array.isArray(users) ? users : [];

  const adminUsers = safeUsers.filter(user => user.lggmail === 'admin@gmail.com');
  const otherUsers = safeUsers.filter(user => user.lggmail !== 'admin@gmail.com');
  const sortedUsers = [...adminUsers, ...otherUsers];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'lgname',
      key: 'lgname',
      render: (text, record) => (
        <>
          {text}
          {record.lggmail === 'admin@gmail.com' && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              Admin
            </Tag>
          )}
        </>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'lggmail',
      key: 'lggmail',
    },
    {
      title: 'Age',
      dataIndex: 'lgage',
      key: 'lgage',
    },
    {
      title: 'Mobile',
      dataIndex: 'lgnumber',
      key: 'lgnumber',
    },
    {
      title: 'Address',
      dataIndex: 'lgaddress',
      key: 'lgaddress',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            onClick={() => onUpdateUser(record)}
            disabled={record.lggmail === 'admin@gmail.com'}
            style={{ marginRight: 8 }}
          >
            Update
          </Button>
          <Button
            type="danger"
            onClick={() => onDeleteUser(record._id)}
            disabled={record.lggmail === 'admin@gmail.com'}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="user-table-container">
      <Table
        dataSource={sortedUsers}
        columns={columns}
        rowKey="_id"
        locale={{ emptyText: 'No users available.' }}
        rowClassName={(record) =>
          record.lggmail === 'admin@gmail.com' ? 'admin-row' : ''
        }
      />
    </div>
  );
};

export default UserTable;