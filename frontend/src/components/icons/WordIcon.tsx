import React from 'react';

const WordIcon = ({ className }: { className?: string }) => {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 16 16"
            className={className}
            fill="none"
        >
            <g 
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
            >
                <path d="M2.5 3.13c0-.77.86-1.63 1.62-1.63h9.76c.76 0 1.62.86 1.62 1.63v9.75c0 .76-.86 1.62-1.62 1.62H4.13c-.77 0-1.63-.86-1.63-1.62"/>
                <path d="m.5 5.5l1 5l1-5l1 5l.97-5m3.03 1h4m-4 3h4"/>
            </g>
        </svg>
    );
};

export default WordIcon;