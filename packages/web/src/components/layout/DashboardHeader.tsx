import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userNavigation = [
    {
      name: 'Perfil',
      href: '/dashboard/settings',
      icon: UserCircleIcon
    },
    {
      name: 'Configurações',
      href: '/dashboard/settings',
      icon: Cog6ToothIcon
    }
  ];

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-700 bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-300 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Abrir sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-700 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-lg font-semibold text-white">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-300 hover:text-white"
          >
            <span className="sr-only">Ver notificações</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-700" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Abrir menu do usuário</span>
              {user?.photoURL ? (
                <img
                  className="h-8 w-8 rounded-full bg-gray-600"
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <UserCircleIcon className="h-5 w-5 text-gray-300" />
                </div>
              )}
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-3 text-sm font-semibold leading-6 text-white" aria-hidden="true">
                  {user?.displayName || user?.email?.split('@')[0]}
                </span>
              </span>
            </Menu.Button>
            
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-gray-800 py-2 shadow-lg ring-1 ring-gray-700 focus:outline-none">
                <div className="px-3 py-2 border-b border-gray-700">
                  <p className="text-sm text-white font-medium">
                    {user?.displayName || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.email}
                  </p>
                </div>

                {userNavigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <button
                        onClick={() => navigate(item.href)}
                        className={`flex w-full items-center px-3 py-2 text-sm ${
                          active
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <item.icon className="mr-3 h-4 w-4" aria-hidden="true" />
                        {item.name}
                      </button>
                    )}
                  </Menu.Item>
                ))}

                <div className="border-t border-gray-700 mt-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`flex w-full items-center px-3 py-2 text-sm ${
                          active
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                        Sair
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;