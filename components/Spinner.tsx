
import React from 'react';

const Spinner: React.FC<{ size?: string }> = ({ size = 'h-5 w-5' }) => {
  return (
    <div
      className={`${size} animate-spin rounded-full border-4 border-t-brand-accent border-r-brand-accent border-b-brand-accent border-l-brand-primary`}
    ></div>
  );
};

export default Spinner;
