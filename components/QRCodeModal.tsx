
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
    <div className="fixed inset-0 bg-ledger-brown bg-opacity-80 flex items-center justify-center z-50 p-4 font-serif">
      <div className="bg-aged-paper rounded-sm shadow-2xl p-2 relative max-w-sm w-full text-center border-2 border-ledger-brown/50">
        <div className="border border-ledger-brown/50 p-6">
            <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full text-ledger-brown/70 hover:bg-gold-trim/20 transition-colors"
            aria-label="Close modal"
            >
            <X />
            </button>
            <h3 className="text-lg font-bold mb-4 text-ledger-brown">{title}</h3>
            <div className="p-2 bg-white rounded-sm inline-block border border-ledger-brown/20">
                <QRCodeSVG value={value} size={256} includeMargin={true} fgColor="#4A3A2A" />
            </div>
            <p className="text-xs text-ledger-brown/60 mt-4">Scan this code to import the credential.</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;