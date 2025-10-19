import React, { useState, ReactNode } from "react";
import {Icon} from '@iconify/react';

type CollapsibleLinkProps = {
    icon: React.ReactNode;
    title: string;
    children: ReactNode; //sub buttons
}

const CollapsibleLink: React.FC<CollapsibleLinkProps> = ({ icon, title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

  const linkClass = "flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-600 transition-colors";

    return (
        <div>
            <button onClick={toggleOpen} className={linkClass}>
                <div className="flex items-center space-x-3">
                    {icon}
                    <span className="whitespace-nowrap">{title}</span>
                </div>
                {/*toggle button*/}
                <Icon icon="iconamoon:arrow-right-2" className={`text-2xl text-white transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Collapsible sub-menu*/}
            {isOpen && (
                <div className="mt-2 flex flex-col space-y-2">
                {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleLink;