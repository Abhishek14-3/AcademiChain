
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from './icons/Icons';

interface QRCodeModalProps {
  value: string;
  onClose: () => void;
  title?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ value, onClose, title = "Scan QR Code" }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 relative max-w-sm w-full text-center">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X />
        </button>
        <h3 className="text-lg font-bold mb-4 text-brand-primary dark:text-brand-accent">{title}</h3>
        <div className="p-4 bg-white rounded-md inline-block">
            <QRCodeSVG value={value} size={256} includeMargin={true} />
        </div>
        <p className="text-xs text-gray-500 mt-4">Scan this code to import the credential.</p>
      </div>
    </div>
  );
};

export default QRCodeModal;
