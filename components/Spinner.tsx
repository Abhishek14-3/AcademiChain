
import React from 'react';

const Spinner: React.FC<{ size?: string }> = ({ size = 'h-5 w-5' }) => {
  return (
    <div
      className={`${size} animate-spin rounded-full border-4 border-t-gold-trim border-r-gold-trim border-b-gold-trim border-l-ledger-brown`}
    ></div>
  );
};

export default Spinner;