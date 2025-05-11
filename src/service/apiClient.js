import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://javalab-ob1r.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllBooks = () => apiClient.get('/books/all');
export const getBookById = (id) => apiClient.get(`/books/${id}`);
export const createBook = (data) => apiClient.post('/books', data);
export const updateBook = (id, data) => apiClient.put(`/books/${id}`, data);
export const deleteBook = (id) => apiClient.delete(`/books/${id}`);

export const getBookComments = (id) => apiClient.get(`/books/${id}/comments`);
export const addBookToAuthor = (authorId, bookId) => apiClient.post(`/author/${authorId}/books/${bookId}`)
export const deleteBookFromAuthor = (authorId, bookId) => apiClient.delete(`/author/${authorId}/books/${bookId}`)

export const getAllAuthors = () => apiClient.get('/author/all');
export const deleteAuthor = (id) => apiClient.delete(`/author/${id}`);
export const createAuthor = (data) => apiClient.post('/author', data);
export const updateAuthor = (id, data) => apiClient.put(`/author/${id}`, data);

export const getAllUsers = () => apiClient.get('/user/all');
export const createUser = (data) => apiClient.post('/user', data);
export const updateUser = (id, data) => apiClient.put(`/user/${id}`, data);
export const deleteUser = (id) => apiClient.delete(`/user/${id}`);

export const getUserComments = (id) => apiClient.get(`/user/${id}/comments`);
export const createComment = (bookId, data) => apiClient.post(`/books/${bookId}/comments`, data);
export const deleteComment = (commentId) => apiClient.delete(`/books/1/comments/${commentId}`);

export default apiClient;