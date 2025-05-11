import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Select, Space, Divider, Descriptions, Spin, Tooltip } from 'antd';
import { 
  getAllBooks, 
  getAllAuthors, 
  deleteAuthor,
  addBookToAuthor,
  deleteBookFromAuthor,
  updateAuthor,
  createAuthor } from '../service/apiClient';
import 'antd/dist/reset.css';

import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
  } from '@ant-design/icons';

const { Option } = Select;

const AuthorList = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState(null);
  const [authorToDelete, setAuthorToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();


  useEffect(() => {
    fetchBooks();
    fetchAuthors();
  }, []);

  const fetchAuthors = () => {
    setAuthorsLoading(true);
    getAllAuthors()
      .then(res => {
        setAuthors(res.data);
      })
      .catch(err => {
        console.error('Fetch authors error:', err);
        message.error('Failed to fetch authors');
      })
      .finally(() => setAuthorsLoading(false));
  };

  const fetchBooks = () => {
    setLoading(true);
    getAllBooks()
      .then(res => {
        setBooks(res.data);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        message.error('Failed to fetch books');
      })
      .finally(() => setLoading(false));
  };

  const showViewModal = async (book) => {
    setCurrentAuthor(book);
    setIsViewModalOpen(true);
  };

  const showDeleteConfirm = (author) => {
    setAuthorToDelete(author);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteAuthor(authorToDelete.id)
      .then(() => {
        message.success('Author deleted successfully');
        
        setAuthors(authors.filter(author => author.id !== authorToDelete.id));
        setIsDeleteModalOpen(false);
      })
      .catch(err => {
        console.error('Delete error:', err);
        message.error('Failed to delete author');
      })
      .finally(() => {
        setLoading(false);
        setAuthorToDelete(null);
      });
  };

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      setLoading(true);
      
      const res = await createAuthor({
        name: values.name
      });
      
      const authorId = res.data.id;
      const bookPromises = values.books?.map(bookId => 
        addBookToAuthor(authorId, bookId)
      ) || [];
      
      await Promise.all(bookPromises);
      
      message.success('Author created successfully');
      fetchAuthors();
      addForm.resetFields();
      setIsAddModalOpen(false);
      
    } catch (err) {
      if (err.errorFields) {
        message.error('Please fill all required fields correctly');
      } else if (err.response) {
          message.error(`Error ${err.response.status}: ${err.response.data.message || 'Operation failed'}`);
      } else {
        console.error('API Error:', err);
        message.error(err.message || 'Failed to create author');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
  try {
    const values = await editForm.validateFields();
    setLoading(true);
    const authorId = currentAuthor.id;

    await updateAuthor(authorId, {
      name: values.name,
      books: currentAuthor.books || []
    });

    const currentBookIds = currentAuthor.books?.map(book => book.id) || [];
    const newBookIds = values.books || [];
    
    const booksToAdd = newBookIds.filter(id => !currentBookIds.includes(id));
    const booksToRemove = currentBookIds.filter(id => !newBookIds.includes(id));
    
    const addPromises = booksToAdd.map(bookId => 
      addBookToAuthor(authorId, bookId)
    );
    
    const removePromises = booksToRemove.map(bookId => 
      deleteBookFromAuthor(authorId, bookId)
    );
    
    await Promise.all([...addPromises, ...removePromises]);

    message.success('Author updated successfully');
    fetchAuthors();
    setIsEditModalOpen(false);
    
  } catch (err) {
    if (err.errorFields) {
      message.error('Please fill all required fields correctly');
    } else if (err.response) {
        message.error(`Error ${err.response.status}: ${err.response.data.message || 'Operation failed'}`);
    } else {
      console.error('API Error:', err);
      message.error(err.message || 'Failed to update author');
    }
  } finally {
    setLoading(false);
  }
};

  const showEditModal = (author) => {
    setCurrentAuthor(author);
    const bookIds = author.books?.map(book => book.id) || [];
    editForm.setFieldsValue({
      name: author.name,
      books: bookIds
    });
    setIsEditModalOpen(true);
  };

  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Books',
      dataIndex: 'books',
      key: 'books',
      render: (books) => (
        books?.length > 0 
          ? books.map(book => (
              <Tag key={`author-${book.id}`}>{book.title}</Tag>
            ))
          : <span>{'none'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
        <Button onClick={() => showViewModal(record)}>View</Button>

        <Tooltip title="Edit" mouseEnterDelay={0.5}>
        <Button 
        onClick={() => showEditModal(record)}
        disabled={loading}
        icon={<EditOutlined />}
        />
    </Tooltip>
        <Tooltip title="Delete" mouseEnterDelay={0.5}>
        <Button 
        danger
        onClick={() => showDeleteConfirm(record)}
        disabled={loading}
        icon={<DeleteOutlined />}
        />
    </Tooltip>
    </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Button 
        type="primary" 
        onClick={() => setIsAddModalOpen(true)}
        style={{ marginBottom: 20 }}
        disabled={loading}
      >
        <PlusOutlined />
        Add author
      </Button>

      <Table 
        columns={columns} 
        dataSource={authors} 
        bordered
        pagination={false}
        rowKey="id"
        loading={loading}
      />

      {/* Add Modal */}
      <Modal
        title="Add New Author"
        open={isAddModalOpen}
        onOk={handleAdd}
        onCancel={() => setIsAddModalOpen(false)}
        confirmLoading={loading}
        keyboard={true}
        width={600}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item 
            name="name" 
            label="Name" 
            rules={[{ required: true, message: 'Please enter author name' },
              { 
                  pattern: /^[a-zA-Z' ]+$/,
                  message: 'Title must be a valid string' 
              }
            ]}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="books"
            label="Books"
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Select books"
              filterOption={filterOption}
              loading={authorsLoading}
              showSearch
              optionFilterProp="children"
            >
              {books.map(book => (
                <Option key={book.id} value={book.id}>
                  {book.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        name={`Edit Author: ${currentAuthor?.name || ''}`}
        open={isEditModalOpen}
        onOk={handleEdit}
        onCancel={() => setIsEditModalOpen(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item 
            name="name" 
            label="Name" 
            rules={[{ required: true, message: 'Please enter author name' },
              { 
                pattern: /^[a-zA-Z' ]+$/,
                message: 'Name must be a valid string' 
              }
            ]}
            onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="books"
            label="Books"
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Select books"
              filterOption={filterOption}
              loading={authorsLoading}
              showSearch
              optionFilterProp="children"
            >
              {books.map(book => (
                <Option key={book.id} value={book.id}>
                  {book.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmLoading={loading}
        onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
      >
        <p>Are you sure you want to delete the book "{authorToDelete?.name}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* View Modal */}
      <Modal
        title={`Auhtor Details: ${currentAuthor?.name || ''}`}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {currentAuthor && (
            <Descriptions bordered column={1} styles={{
              label:{
                width: '120px',
                fontWeight: 'bold',
                backgroundColor: '#fafafa'
              }
            }}>
              
              <Descriptions.Item label="Name">{currentAuthor.name}</Descriptions.Item>

              <Descriptions.Item label="Books">
                    {currentAuthor.books?.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {currentAuthor.books.map(book => (
                        <li key={`view-author-${book.id}`}>
                            {book.title} ({book.pages} pages)
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <div>No books</div>
                    )}
            </Descriptions.Item>
            </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AuthorList;