import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './MainLayout.css'; // You can style layout here

const MainLayout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;