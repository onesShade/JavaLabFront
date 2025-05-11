import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Select, Space, Divider, Descriptions, Spin, Tooltip  } from 'antd';
import { 
  getAllBooks, 
  getAllAuthors, 
  getBookComments, 
  deleteBook, 
  addBookToAuthor,
  deleteBookFromAuthor,
  createBook, 
  createComment,
  getAllUsers,
  setUsers,
  updateBook } from '../service/apiClient';
import 'antd/dist/reset.css';

import {
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Option } = Select;

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [currentViewBook, setCurrentViewBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [comments, setComments] = useState([]);
  const [commentForm] = Form.useForm();
  const [isAddCommentOpen, setIsAddCommentModalOpen] = useState(false);
  const [nameFieldhasValue, setNameFieldhasValue] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
    fetchUsers();
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
const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then(res => {
        setUsers(res.data);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        message.error('Failed to fetch books');
      })
      .finally(() => setLoading(false));
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
    setCurrentViewBook(book);
    setIsViewModalOpen(true);
    setLoadingUsers(true);
    
    try {
      const response = await getBookComments(book.id)
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      message.error('Failed to load comments');
      setComments([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const showAddComment = (book) => {
    setCurrentBook(book);
    setIsAddCommentModalOpen(true);
  }

  const showDeleteConfirm = (book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteBook(bookToDelete.id)
      .then(() => {
        message.success('Book deleted successfully');
        setBooks(books.filter(book => book.id !== bookToDelete.id));
        setIsDeleteModalOpen(false);
      })
      .catch(err => {
        console.error('Delete error:', err);
        message.error('Failed to delete book');
      })
      .finally(() => {
        setLoading(false);
        setBookToDelete(null);
      });
  };

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      setLoading(true);
      const res = await createBook({
        title: values.title,
        pages: values.pages
      });
      
      const bookId = res.data.id;
      const authorPromises = values.authors?.map(authorId => 
        addBookToAuthor(authorId, bookId)
      ) || [];
      await Promise.all(authorPromises);
      
      message.success('Book added successfully with authors');
      fetchBooks();
      addForm.resetFields();
      setIsAddModalOpen(false);
      
    } catch (err) {
      if (err.errorFields) {
        message.error('Please fill all required fields correctly');
      } else if (err.response) {
        message.error(`Error ${err.response.data.type}: ${err.response.data.message || 'Operation failed'}`);
      } else {
        console.error('API Error:', err);
        message.error(err.message || 'Failed to add book');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    try {
      const values = await commentForm.validateFields();
      setLoading(true);
      
      await createComment(currentBook.id, {
        text: values.text,
        userId: values.user
      });
      
      message.success('Comment added successfully');
      commentForm.resetFields();
      setIsAddCommentModalOpen(false);
      fetchBooks();
      fetchUsers();
    } catch (err) {
      if (err.errorFields) {
        message.error('Please fill all required fields correctly');
      } else {
        console.error('API Error:', err);
        message.error(err.message || 'Failed to add comment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      const bookId = currentBook.id;
  
      await updateBook(bookId, {
        title: values.title,
        pages: Number(values.pages),
        authors: currentBook.authors || [],
        comments: currentBook.comments || []
      });
  
      const currentAuthorIds = currentBook.authors?.map(author => author.id) || [];
      const newAuthorIds = values.authors || [];
      
      const authorsToAdd = newAuthorIds.filter(id => !currentAuthorIds.includes(id));
      const authorsToRemove = currentAuthorIds.filter(id => !newAuthorIds.includes(id));
      
      const addPromises = authorsToAdd.map(authorId => 
        addBookToAuthor(authorId, bookId)
      );
      
      const removePromises = authorsToRemove.map(authorId => 
        deleteBookFromAuthor(authorId, bookId)
      );
      
      await Promise.all([...addPromises, ...removePromises]);
  
      message.success('Book and authors updated successfully');
      fetchBooks();
      setIsEditModalOpen(false);
      
    } catch (err) {
      if (err.errorFields) {
        message.error('Please fill all required fields correctly');
      } else if (err.response) {
          message.error(`Error ${err.response.status}: ${err.response.data.message || 'Operation failed'}`);
      } else {
        console.error('API Error:', err);
        message.error(err.message || 'Failed to update book');
      }
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (book) => {
    setCurrentBook(book);
    const authorIds = book.authors?.map(author => author.id) || [];
    editForm.setFieldsValue({
      title: book.title,
      pages: book.pages.toString(),
      authors: authorIds
    });
    setIsEditModalOpen(true);
  };

  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Pages',
      dataIndex: 'pages',
      key: 'pages',
      width: 80,
    },
    {
      title: 'Authors',
      dataIndex: 'authors',
      key: 'authors',
      render: (authors) => (
        authors?.length > 0 
          ? authors.map(author => (
              <Tag key={`author-${author.id}`}>{author.name}</Tag>
            ))
          : <span>{'unknown'}</span>
      ),
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
      render: (comments) => (
        comments?.length > 0 
          ? `${comments.length} comments`
          : 'No comments'
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
        <Button 
            onClick={() => showAddComment(record)}
            disabled={loading}
            icon={<CommentOutlined />}
          />
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
        Add book
      </Button>

      <Table 
        columns={columns} 
        dataSource={books} 
        bordered
        pagination={false}
        rowKey="id"
        loading={loading}
      />

      {/* Add Modal */}
      <Modal
        title="Add New Book"
        open={isAddModalOpen}
        onOk={handleAdd}
        onCancel={() => setIsAddModalOpen(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item 
            name="title" 
            label="Title" 
            rules={[{ required: true, message: 'Please enter the title' },
              { 
                pattern: /^[a-zA-Z0-9' ]+$/,
                message: 'Title must be a valid string' 
              }
            ]}
            
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item 
            name="pages" 
            label="Pages" 
            rules={[
              { required: true, message: 'Please enter the number of pages' },
              { 
                pattern: /^[0-9]+$/,
                message: 'Pages must be a positive number' 
              }
            ]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="authors"
            label="Authors"
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Select authors"
              filterOption={filterOption}
              loading={authorsLoading}
              showSearch
              optionFilterProp="children"
            >
              {authors.map(author => (
                <Option key={author.id} value={author.id}>
                  {author.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit Book: ${currentBook?.title || ''}`}
        open={isEditModalOpen}
        onOk={handleEdit}
        onCancel={() => setIsEditModalOpen(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item 
            name="title" 
            label="Title" 
            rules={[{ required: true, message: 'Please enter the title' },
              { 
                pattern: /^[a-zA-Z0-9?!' ]+$/,
                message: 'Title must be a valid string' 
              }
            ]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item 
            name="pages" 
            label="Pages" 
            rules={[
              { required: true, message: 'Please enter the number of pages' },
              { 
                pattern: /^[0-9]+$/,
                message: 'Pages must be a positive number' 
              }
            ]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="authors"
            label="Authors"
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Select authors"
              filterOption={filterOption}
              loading={authorsLoading}
              showSearch
              optionFilterProp="children"
            >
              {authors.map(author => (
                <Option key={author.id} value={author.id}>
                  {author.name}
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
      >
        <p>Are you sure you want to delete the book "{bookToDelete?.title}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* View Modal */}
      <Modal
        title={`Book Details: ${currentViewBook?.title || ''}`}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {currentViewBook && (
            <Descriptions bordered column={1} styles={{
              label:{
                width: '120px',
                fontWeight: 'bold',
                backgroundColor: '#fafafa'
              }
            }}>
              
              <Descriptions.Item label="Title">{currentViewBook.title}</Descriptions.Item>
              <Descriptions.Item label="Pages">{currentViewBook.pages}</Descriptions.Item>
              
              <Descriptions.Item label="Authors">
                {currentViewBook.authors?.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {currentViewBook.authors.map(author => (
                      <li key={`view-author-${author.id}`} color="blue">
                        {author.name}
                      </li>
                    ))}
                  </ul>
                ) : 'unknown'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Comments">
                <Spin spinning={loadingUsers}>
                  {comments.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {comments.map(comment => {
                        const userName = comment.user?.name 
                                      || `User ${comment.userId}` 
                                      || 'Anonymous';
                        return (
                          <div key={`comment-${comment.id}`} style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 'bold' }}>{userName}:</div>
                            <div>{comment.text}</div>
                            <Divider style={{ margin: '8px 0' }} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div>No comments</div>
                  )}
                </Spin>
              </Descriptions.Item>
            </Descriptions>
        )}
      </Modal>
       {/* Add comment Modal */}
          <Modal
              title="Add New Comment"
              open={isAddCommentOpen}
              onOk={handleAddComment}
              onCancel={() => setIsAddCommentModalOpen(false)}
              confirmLoading={loading}
              width={600}
            >
              <Form form={commentForm} layout="vertical">
               <Form.Item
                  name="user"
                  label="User"
                  rules={[{ required: true, message: 'User must be selected'}]}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  >
                  <Select
                      mode="single"
                      style={{ width: '100%' }}
                      placeholder="Select user"
                      filterOption={filterOption}
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                  >
                      {users.map(user => (
                      <Option key={user.id} value={user.id}>
                          {user.name}
                      </Option>
                      ))}
                  </Select>
                  </Form.Item>
                  <Form.Item
                  name="book"
                  label="Book"
                  >
                    <div>{currentBook?.title}</div>
                  </Form.Item>
                  <Form.Item 
          name="text" 
          label="Text"
          rules={[{ required: true, message: 'Comment cannot be empty' }]}
          required={!nameFieldhasValue}
        >
          <Input 
            autoComplete="off" 
            onChange={(e) => setNameFieldhasValue(!!e.target.value)}
          />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookList;