import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HashRouter , Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import SimpleHeader from './SimpleHeader';
import BookList from './pages/BookList';
import AuthorList from './pages/AuthorList'
import UserList from './pages/UserList'
import './App.css';

const { Content } = Layout;

function ErrorFallback({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
}

function App() {
  return (
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <HashRouter >
            <SimpleHeader />
            <Content style={{ padding: '24px' }}>
              <Routes>
                <Route path="/" element={<BookList />} />
                <Route path="/books" element={<BookList />} />
                <Route path="/authors" element={<AuthorList/>} />
                <Route path="/users" element={<UserList/>} />
              </Routes>
            </Content>
        </HashRouter >
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;