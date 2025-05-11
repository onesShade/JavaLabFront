import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Select, Space, Divider, Descriptions, Spin, Tooltip  } from 'antd';
import { 
  getAllAuthors, 
  getAllUsers,
  getAllBooks,
  createUser,
  updateUser,
  deleteUser,
  deleteComment,
  getUserComments,
  createComment} from '../service/apiClient';

import 'antd/dist/reset.css';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Option } = Select;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCommentOpen, setIsAddCommentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [commentForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [comments, setComments] = useState([]);
  const [nameFieldhasValue, setNameFieldhasValue] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  useEffect(() => {
    fetchAuthors();
    fetchUsers();
    fetchBooks();
  }, []);

  const fetchAuthors = () => {
    getAllAuthors()
      .then(res => {
        setAuthors(res.data);
      })
      .catch(err => {
        console.error('Fetch authors error:', err);
        message.error('Failed to fetch authors');
      });
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

  const showViewModal = async (user) => {
    setCurrentUser(user);
    setIsViewModalOpen(true);
    setLoadingUsers(true);
    try {
      const response = await getUserComments(user.id)
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      message.error('Failed to load comments');
      setComments([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const showDeleteConfirm = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteUser(currentUser.id)
      .then(() => {
        message.success('Book deleted successfully');
        fetchUsers();
        setIsDeleteModalOpen(false);
      })
      .catch(err => {
        console.error('Delete error:', err);
        message.error('Failed to delete book');
      })
      .finally(() => {
        setLoading(false);
        setCurrentUser(null);
      });
  };

  const handleAdd =  async () => {
    try {
    const values = await addForm.validateFields();
        setLoading(true);
        createUser ({
          name: values.name
        })
        .then(() => {
            message.success('User added successfully');
            fetchUsers();
            addForm.resetFields();
            setIsAddModalOpen(false);
        })
        .catch(err => {
            console.error('Add error:', err);
            message.error('Failed to add user');
          })
          .finally(() => setLoading(false));
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

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      await deleteComment(commentId); 
      message.success('Comment deleted');
    } catch (err) {
      message.error('Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
      try {
        const response = await getUserComments(currentUser.id)
        setComments(response.data); 
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        message.error('Failed to load comments');
        setComments([]); 
      } finally {
        setLoadingUsers(false);
      }
    }
  };

  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const handleAddComment = async () => {
    try {
      const values = await commentForm.validateFields();
      setLoading(true);
      
      await createComment(values.book, {
        text: values.text,
        userId: values.user
      });
      
      message.success('Comment added successfully');
      commentForm.resetFields();
      setIsAddCommentModalOpen(false);
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
        const userId = currentUser.id;
        
        updateUser(userId, {
          name: values.name,
        })
        .then(() => { 
            message.success('User updated successfully');
            setIsEditModalOpen(false);
            fetchUsers();
        })
    } catch (err) {
        if (err.errorFields) {
          message.error('Please fill all required fields correctly');
        } else if (err.response) {
          const errorMsg = err.response.data?.message || 'Update failed';
          message.error(`Error ${err.response.status}: ${errorMsg}`);
        } else {
          console.error('API Error:', err);
          message.error(err.message || 'Failed to add comment');
        }
      } finally {
        setLoading(false);
      }
  };

  const showEditModal = (user) => {
    setCurrentUser(user);
    setNameFieldhasValue(true);
    editForm.setFieldsValue({
      name: user.name,
    });
    setIsEditModalOpen(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
       <Space size="middle">
       <Button 
            type="primary" 
            onClick={() => setIsAddModalOpen(true)}
            style={{ marginBottom: 20 }}
            disabled={loading}
        >
        <PlusOutlined />
            Add user
        </Button>

       
        </Space> 
        

        <Table 
          columns={columns} 
          dataSource={users} 
          bordered
          pagination={false}
          rowKey="id"
          loading={loading}
        />

        {/* Add Modal */}
        <Modal
          title="Add New User"
        open={isAddModalOpen}
        onOk={handleAdd}
        onCancel={() => setIsAddModalOpen(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item 
            name="name" 
            label="Name"
            rules={[{ required: true, message: 'Please enter username' },
              { 
                pattern: /^[a-zA-Z0-9' ]+$/,
                message: 'Name must be a valid string' 
              }
            ]}
            required={!nameFieldhasValue}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          >
            <Input 
              autoComplete="off" 
              onChange={(e) => setNameFieldhasValue(!!e.target.value)}
            />
          </Form.Item>
    </Form>
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
            rules={[{ required: true, message: 'Book must be selected' }]}
            >
            <Select
                mode="single"
                style={{ width: '100%' }}
                placeholder="Select book"
                filterOption={filterOption}
                loading={loading}
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

      {/* Edit Modal */}
      <Modal
        title={`Edit User: ${currentUser?.name || ''}`}
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
            rules={[{ required: true, message: 'Please enter username' },
              { 
                pattern: /^[a-zA-Z0-9' ]+$/,
                message: 'Name must be a valid string' 
              }
            ]}
            onKeyPress={(e) => e.key === 'Enter' && handleEdit()} 
            required={!nameFieldhasValue}
          >
            <Input 
              autoComplete="off" 
              onChange={(e) => setNameFieldhasValue(!!e.target.value)}
            />
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
        <p>Are you sure you want to delete user "{currentUser?.name}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* View Modal */}
      <Modal
        title={`User Details: ${currentUser?.name || ''}`}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {currentUser && (
          <Descriptions bordered column={1} styles={{
            label:{
              width: '120px',
              fontWeight: 'bold',
              backgroundColor: '#fafafa'
            }
          }}>
              
          <Descriptions.Item label="Name">{currentUser.name}</Descriptions.Item>
          <Descriptions.Item label="Comments">
              <Spin spinning={loadingUsers}>
              {comments.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {comments.map(comment => {
                    const bookTitle = comment.book?.title || '???';
                    return (
                      <div key={`comment-${comment.id}`} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{" -> " + bookTitle}:</span>
                          <Button 
                            type="link" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteComment(comment.id)}
                            size="small"
                            loading={deletingCommentId === comment.id}
                          />
                      </div>
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
    </div>
  );
};

export default UserList;