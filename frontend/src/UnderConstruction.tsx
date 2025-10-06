import React from 'react';

const UnderConstruction: React.FC = () => {
  return (
    <div className="flex w-full items-center justify-center p-4 bg-[#fff9e2]">
      <img
        src="./under-construction.png"
        alt="Page under construction"
        className="max-w-lg" 
      />
    </div>
  );
};

export default UnderConstruction;