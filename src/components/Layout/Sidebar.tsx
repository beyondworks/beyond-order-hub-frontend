import React from 'react';
import { SettingsIcon, AlertTriangleIcon, DashboardIcon, OrdersIcon, UndoIcon, PackageIcon, ArchiveIcon, TruckIcon, ChannelIcon } from '../../assets/icons';
import { User } from '../../types'; 


interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  currentUser: User | null; 
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, currentUser }) => {
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: <DashboardIcon />, roles: ['master', 'user'] },
    { id: 'orders', label: '주문 관리', icon: <OrdersIcon />, roles: ['master', 'user'] },
    { id: 'products', label: '상품 관리', icon: <PackageIcon />, roles: ['master', 'user'] },
    { id: 'inventory', label: '재고 관리', icon: <ArchiveIcon />, roles: ['master', 'user'] },
    { id: 'shipping', label: '배송 관리', icon: <TruckIcon />, roles: ['master', 'user'] },
    { id: 'returns', label: '반품/교환 관리', icon: <UndoIcon />, roles: ['master', 'user'] },
    { id: 'platform-settings', label: '시스템 설정', icon: <SettingsIcon />, roles: ['master', 'user'] },
    { id: 'errors', label: '오류 내역', icon: <AlertTriangleIcon />, roles: ['master', 'user'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <aside className="sidebar" role="navigation" aria-label="Main Navigation">
      <nav className="sidebar-nav">
        <ul>
          {filteredNavItems.map(item => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={activeItem === item.id ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); onNavigate(item.id);}}
                aria-current={activeItem === item.id ? 'page' : undefined}
              >
                <span className="sidebar-icon-wrapper">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;