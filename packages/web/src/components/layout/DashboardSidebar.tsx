import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  XMarkIcon,
  HomeIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BoltIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    end: true
  },
  {
    name: 'Agentes',
    href: '/dashboard/agents',
    icon: CpuChipIcon
  },
  {
    name: 'Conversas',
    href: '/dashboard/messages',
    icon: ChatBubbleLeftRightIcon
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartBarIcon
  },
  {
    name: 'Dialogflow',
    href: '/dashboard/dialogflow',
    icon: BoltIcon
  },
  {
    name: 'Usuários',
    href: '/dashboard/users',
    icon: UserGroupIcon
  },
  {
    name: 'Configurações',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon
  }
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen
}) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Fechar sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>

                <SidebarContent logout={logout} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent logout={logout} />
      </div>
    </>
  );
};

interface SidebarContentProps {
  logout: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ logout }) => {
  const location = useLocation();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <CpuChipIcon className="h-8 w-8 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-white">NXT.AI</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = item.end 
                  ? location.pathname === item.href
                  : location.pathname.startsWith(item.href);

                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        isActive
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </li>

          <li className="mt-auto">
            <button
              onClick={logout}
              className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <ArrowRightOnRectangleIcon
                className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-white"
                aria-hidden="true"
              />
              Sair
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DashboardSidebar;