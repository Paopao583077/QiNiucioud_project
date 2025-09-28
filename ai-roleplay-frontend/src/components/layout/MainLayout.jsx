import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Content from './Content.jsx';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%' }}>
        <Sidebar />
        <Content>
          <Outlet />
        </Content>
      </div>
    </div>
  );
}


