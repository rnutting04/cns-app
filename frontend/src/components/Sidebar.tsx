import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ExcelIcon from './icons/ExcelIcon';
import WordIcon from './icons/WordIcon';
import CollapsibleLink from './CollapsibleLink';

// Data for sidebar links
const mainLinks = [
  { to: '/dashboard', icon: 'lucide:house', text: 'Dashboard'},
  { to: '/change-me', icon: 'mynaui:activity', text: 'My Activity' },
  { to: '/change-me', icon: 'material-symbols:upload-rounded', text: 'Upload Files' },
];

const collapsibleSections = [
  {
    icon: <ExcelIcon className="h-5 w-5" />,
    title: 'Excel Data Parser',
    subLinks: [
      { to: '/change-me', text: 'Prepaid AR' },
      { to: '/change-me', text: 'Variance Check' },
      { to: '/change-me', text: 'FDIC' },
      { to: '/change-me', text: 'Financial Report' },
    ],
  },
  {
    icon: <WordIcon className="h-5 w-5" />,
    title: 'Document Generators',
    subLinks: [
      { to: '/change-me', text: 'Notice & Candidacy' },
      { to: '/change-me', text: 'Letter Head' },
      { to: '/change-me', text: 'Ballot' },
      { to: '/change-me', text: 'Application Approval' },
      { to: '/change-me', text: 'Denial' },
      { to: '/change-me', text: 'Proxy' },
    ],
  },
];

const adminLinks = [
    { to: '/admin/users', icon: 'lucide:users', text: 'User Management' },
    { to: '/change-me', icon: 'codicon:graph', text: 'User Activity' },
    { to: '/admin/data', icon: 'tabler:database', text: 'Database Editor' },
];

const superUserLink = { 
    to: '/change-me', 
    icon: 'material-symbols:shield-outline-rounded', 
    text: 'System Health' 
};

interface SidebarProps {
  isAdmin: boolean;
  isSuper: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin, isSuper, isOpen, onToggle }) => {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-md p-2 transition-colors w-full ${
      isActive ? 'font-semibold bg-gray-700' : 'hover:bg-gray-600'
    } ${!isOpen && 'md:justify-center'}`;

  const subLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `pl-9 text-sm flex items-center space-x-3 rounded-md p-2 transition-colors ${
      isActive ? 'font-semibold text-white bg-gray-700' : 'text-gray-400 hover:bg-gray-600'
    }`;
    
  const textVisibilityClass = `whitespace-nowrap overflow-hidden transition-opacity duration-200 ${
      isOpen ? 'opacity-100 ml-3' : 'w-0 opacity-0 ml-0'
  }`;

  const sidebarClasses = [
  'sidebar',
  'group',
  'fixed', 'top-0', 'left-0', 'h-screen', 'bg-[#1E2538]', 'p-4', 'text-white',
  'text-sm', 'z-30', 'flex', 'flex-col', 'overflow-hidden', 'transition-all',
  'duration-300', 'ease-in-out',
  isOpen
    ? 'w-64 translate-x-0'
    : 'w-0 md:w-20 -translate-x-full md:translate-x-0',
].join(' ');

  return (
    <aside className={sidebarClasses}>
      <div className={`flex items-center mb-7 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && <h2 className="text-lg font-semibold whitespace-nowrap">Control Panel</h2>}
        
        {/* toggle button */}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-700">
          <Icon icon="material-symbols:menu-rounded" className="text-xl" />
        </button>
      </div>

      <nav className="scroll-area flex-1 overflow-y-auto space-y-2 space-y-2">
        {/* Main links */}
        {mainLinks.map((link) => (
          <NavLink key={link.text} to={link.to} className={linkClasses}>
            <Icon icon={link.icon} className="h-5 w-5 flex-shrink-0" />
            <span className={textVisibilityClass}>{link.text}</span>
          </NavLink>
        ))}

        {/* Collapsible sections*/}
        {isOpen && (
          <>
            <hr className="my-3 border-[#3C4D66]" />
            {collapsibleSections.map((section) => (
              <CollapsibleLink key={section.title} icon={section.icon} title={section.title}>
                {section.subLinks.map((subLink) => (
                  <NavLink key={subLink.text} to={subLink.to} className={subLinkClasses}>
                    <span>{subLink.text}</span>
                  </NavLink>
                ))}
              </CollapsibleLink>
            ))}
          </>
        )}

        {/* Admin and SuperUser sections*/}
        {(isAdmin || isSuper) && (
          <>
            <hr className="my-3 border-[#3C4D66]" />
            {adminLinks.map((link) => (
              <NavLink key={link.text} to={link.to} className={linkClasses}>
                <Icon icon={link.icon} className="h-5 w-5 flex-shrink-0" />
                <span className={textVisibilityClass}>{link.text}</span>
              </NavLink>
            ))}

          {isSuper && (
              <NavLink to={superUserLink.to} className={linkClasses}>
                <Icon icon={superUserLink.icon} className="h-5 w-5 flex-shrink-0" />
                <span className={textVisibilityClass}>{superUserLink.text}</span>
              </NavLink>
            )}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;