import React from 'react';

const DotList = ({ items }) => {
  return (
    <div className="flex items-center">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
        {index !== 0 && (
          <>
            <span></span>
            <span className="text-white/50">•</span>
          </>
        )}
        <span className="text-sm font-medium font-karla">{item}</span>
      </div>
      ))}
    </div>
  );
};

export default DotList;
