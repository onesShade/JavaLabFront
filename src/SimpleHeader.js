import { Layout, Menu, Typography } from 'antd';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const SimpleHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/books');
    }
  }, [location, navigate]);

  const items = [
    {
      key: '/books',
      icon: <BookOutlined />,
      label: <Link to="/books">Books</Link>,
    },
    {
      key: '/authors',
      icon: <UserOutlined />,
      label: <Link to="/authors">Authors</Link>,
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: <Link to="/users">Users</Link>,
    },
  ];

  return (
    <Header style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: '24px' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Book reviwer
        </Title>
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        style={{ flex: 1, minWidth: 0 }}
      />
    </Header>
  );
};

export default SimpleHeader;