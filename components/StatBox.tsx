
import React from 'react';

interface StatBoxProps {
  label: string;
  value: string | number;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col items-center justify-center border border-black bg-[#cccccc] w-24 h-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
      <span className="text-[10px] font-bold tracking-wider text-black mb-1 opacity-70 uppercase">{label}</span>
      <span className="text-xl font-bold font-serif-custom text-black">{value}</span>
    </div>
  );
};

export default StatBox;
