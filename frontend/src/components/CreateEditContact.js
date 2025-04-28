import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Modal,
  Button,
  Upload,
  Row,
  Col,
  message,
  DatePicker,
  Popconfirm,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import { getContacts } from "../services/contactApi";

const { Option } = Select;

// Use environment variable for backend URL
const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CreateEditContact = ({ open, onClose, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allContacts, setAllContacts] = useState([]);

  useEffect(() => {
    const fetchAllContacts = async () => {
      try {
        const response = await getContacts();
        setAllContacts(response);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    };

    fetchAllContacts();
  }, []);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        ...initialValues,
        birthday: initialValues?.birthday
          ? moment(initialValues.birthday)
          : undefined,
      });

      if (initialValues?.imageUrl) {
        const imageUrl = `${BACKEND_URL}${initialValues.imageUrl}`; // Correct URL
        console.log("CreateEditContact Image URL:", imageUrl); // Debugging
        setFileList([
          {
            uid: "-1",
            name: "image",
            status: "done",
            url: imageUrl,
            thumbUrl: imageUrl, // Ensure thumbnail uses full URL
            onError: () => console.error("Failed to load image:", imageUrl),
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      const isDuplicate = allContacts.some(
        (contact) =>
          contact.phoneNumber === values.phoneNumber &&
          (!initialValues || contact._id !== initialValues._id)
      );

      if (isDuplicate) {
        message.error("This phone number already exists!");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      if (values.birthday) {
        formData.append("birthday", values.birthday.format("YYYY-MM-DD"));
      }

      Object.keys(values).forEach((key) => {
        if (key !== "birthday") {
          formData.append(key, values[key]);
        }
      });

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      await onSubmit(formData);
      message.success(
        initialValues
          ? "Contact updated successfully!"
          : "Contact created successfully!"
      );
      onClose();
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Failed to save contact. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const nameValidator = (_, value) => {
    if (value && /[0-9!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return Promise.reject(
        "Name cannot contain numbers or special characters"
      );
    }
    return Promise.resolve();
  };

  const disableFutureDates = (current) => {
    return current && current > moment().endOf("day");
  };

  return (
    <Modal
      title={initialValues ? "Edit Contact" : "Create Contact"}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Popconfirm
          key="submit"
          title={
            initialValues
              ? "Are you sure you want to update this contact?"
              : "Are you sure you want to create this contact?"
          }
          onConfirm={handleSubmit}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" loading={isSubmitting}>
            {initialValues ? "Update" : "Create"}
          </Button>
        </Popconfirm>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                { required: true, message: "Please enter first name" },
                { validator: nameValidator },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                { required: true, message: "Please enter last name" },
                { validator: nameValidator },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Please enter a valid email" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="birthday" label="Birthday">
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={disableFutureDates}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gender" label="Gender">
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select>
                <Option value="Family">Family</Option>
                <Option value="Friends">Friends</Option>
                <Option value="Work">Work</Option>
                <Option value="Business">Business</Option>
                <Option value="Colleagues">Colleagues</Option>
                <Option value="Clients">Clients</Option>
                <Option value="Freelancers">Freelancers</Option>
                <Option value="Vendors">Vendors</Option>
                <Option value="Investors">Investors</Option>
                <Option value="Partners">Partners</Option>
                <Option value="Mentors">Mentors</Option>
                <Option value="Consultants">Consultants</Option>
                <Option value="Service Providers">Service Providers</Option>
                <Option value="Healthcare">Healthcare</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Image">
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateEditContact;