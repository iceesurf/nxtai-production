import React from 'react';
import { 
  BellIcon, 
  Cog6ToothIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, showSearch = false }) => {
  const { user } = useAuthStore();

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-400 hover:text-white transition"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
          
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative hidden md:block">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Notifications */}
          <button className="relative text-gray-400 hover:text-white transition">
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="text-gray-400 hover:text-white transition">
            <Cog6ToothIcon className="h-6 w-6" />
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`}
              alt="Avatar"
              className="h-8 w-8 rounded-full border-2 border-gray-600"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">{user?.displayName}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;