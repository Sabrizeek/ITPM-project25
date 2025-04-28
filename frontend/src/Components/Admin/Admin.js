import React, { useState, useEffect } from 'react';
import axios from '../../api/axios'; // Use custom Axios instance with JWT
import UserTable from './UserTable';
import Nav from '../Nav/NavAdmin.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable explicitly
import { Button, Input, Select, Modal, Form, message } from 'antd';

const { Option } = Select;

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/auth/allusers');
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error fetching users:', err.response?.data || err.message);
      message.error(err.response?.data?.error || 'Error fetching users');
    }
    setLoading(false);
  };

  const handleUpdateUser = async (values) => {
    try {
      await axios.put(`/api/auth/updateuser/${userToUpdate}`, values);
      setUserToUpdate(null);
      form.resetFields();
      fetchUsers();
      message.success('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err.response?.data || err.message);
      message.error(err.response?.data?.error || 'Error updating user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/api/auth/deleteuser/${deleteConfirmation}`);
      fetchUsers();
      setDeleteConfirmation(null);
      message.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err.response?.data || err.message);
      message.error(err.response?.data?.error || 'Error deleting user');
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('User List', 14, 20);

      // Filter out the admin user
      const usersWithoutAdmin = sortedUsers.filter(user => user.lggmail !== 'admin@gmail.com');

      // Define table columns and data
      const columns = ['Name', 'Email', 'Age', 'Mobile', 'Address'];
      const data = usersWithoutAdmin.map(user => [
        user.lgname,
        user.lggmail,
        user.lgage.toString(),
        user.lgnumber.toString(),
        user.lgaddress,
      ]);

      // Generate table using autoTable
      autoTable(doc, {
        startY: 30,
        head: [columns],
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
        bodyStyles: { textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 30, left: 14, right: 14 },
      });

      doc.save('users.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      message.error('Failed to generate PDF. Please try again.');
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
      <h2 style={{ marginBottom: '20px' }}>Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '200px' }}
        />
        <Select
          value={sortOrder}
          onChange={(value) => setSortOrder(value)}
          style={{ width: '200px' }}
          placeholder="Sort by Age"
        >
          <Option value="">Sort by Age</Option>
          <Option value="asc">Age: Low to High</Option>
          <Option value="desc">Age: High to Low</Option>
        </Select>
        <Button type="primary" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <UserTable
          users={sortedUsers}
          onUpdateUser={(user) => {
            setUserToUpdate(user._id);
            form.setFieldsValue(user);
          }}
          onDeleteUser={(userId) => setDeleteConfirmation(userId)}
        />
      )}

      <Modal
        title="Update User"
        open={!!userToUpdate}
        onCancel={() => {
          setUserToUpdate(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdateUser}
          layout="vertical"
          initialValues={{ lgname: '', lggmail: '', lgage: '', lgnumber: '', lgaddress: '' }}
        >
          <Form.Item
            name="lgname"
            label="Name"
            rules={[
              { required: true, message: 'Please enter a name' },
              { pattern: /^[a-zA-Z\s]*$/, message: 'Name cannot contain special characters' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lggmail"
            label="Email"
            rules={[
              { required: true, message: 'Please enter an email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lgage"
            label="Age"
            rules={[
              { required: true, message: 'Please enter an age' },
              { type: 'number', min: 0, message: 'Age must be a positive number' },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="lgnumber"
            label="Mobile"
            rules={[
              { required: true, message: 'Please enter a mobile number' },
              { pattern: /^\d{10}$/, message: 'Mobile number must be exactly 10 digits' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lgaddress"
            label="Address"
            rules={[{ required: true, message: 'Please enter an address' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
              Update
            </Button>
            <Button onClick={() => setUserToUpdate(null)}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Confirm Delete"
        open={!!deleteConfirmation}
        onOk={handleDeleteUser}
        onCancel={() => setDeleteConfirmation(null)}
        okText="Yes, Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this user?</p>
      </Modal>
    </div>
  );
};

export default Admin;