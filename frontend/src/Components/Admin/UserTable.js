import React from 'react';
import { Table, Button, Tag } from 'antd';

const UserTable = ({ users, onUpdateUser, onDeleteUser }) => {
  // Sort users to show admin first, then others
  const adminUsers = users.filter(user => user.lggmail === 'admin@gmail.com');
  const otherUsers = users.filter(user => user.lggmail !== 'admin@gmail.com');
  const sortedUsers = [...adminUsers, ...otherUsers];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'lgname',
      key: 'lgname',
      render: (text, record) => (
        <span>
          {text}
          {record.lggmail === 'admin@gmail.com' && <Tag color="blue" style={{ marginLeft: '5px' }}>Admin</Tag>}
        </span>
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
        <span>
          <Button
            type="primary"
            onClick={() => onUpdateUser(record)}
            disabled={record.lggmail === 'admin@gmail.com'}
            style={{ marginRight: '8px' }}
          >
            Update
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => onDeleteUser(record._id)}
            disabled={record.lggmail === 'admin@gmail.com'}
          >
            Delete
          </Button>
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={sortedUsers}
      rowKey="_id"
      pagination={{ pageSize: 10 }}
      loading={users.length === 0}
      rowClassName={(record) => (record.lggmail === 'admin@gmail.com' ? 'admin-row' : '')}
    />
  );
};

export default UserTable;