import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { X } from './icons/Icons';

interface QRScannerModalProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onScan }) => {
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div className="fixed inset-0 bg-ledger-brown bg-opacity-80 flex items-center justify-center z-50 p-4 font-serif">
       <div className="bg-aged-paper rounded-sm shadow-2xl p-2 relative max-w-md w-full border-2 border-ledger-brown/50">
        <div className="border border-ledger-brown/50 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full text-ledger-brown/70 hover:bg-gold-trim/20 transition-colors z-20"
            aria-label="Close modal"
          >
            <X />
          </button>
          <h3 className="text-lg font-bold mb-4 text-ledger-brown">Scan Credential QR Code</h3>
          <div className="w-full aspect-square overflow-hidden bg-ledger-brown/80 relative">
            <QrReader
              onResult={(result, error) => {
                if (result) {
                  onScan(result.getText());
                }

                if (error) {
                  if (error.name === 'NotAllowedError') {
                    setErrorMessage('Camera permission denied. Please allow camera access in your browser settings.');
                  } else if (error.name === 'NotFoundError') {
                    setErrorMessage('No camera found. Please ensure a camera is connected and enabled.');
                  }
                }
              }}
              constraints={{ facingMode: 'environment' }}
              containerStyle={{ width: '100%', height: '100%' }}
              videoContainerStyle={{ width: '100%', height: '100%', paddingTop: 0 }}
              videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                <div className="w-full h-full relative">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-gold-trim/70 rounded-tl-sm"></div>
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-gold-trim/70 rounded-tr-sm"></div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-gold-trim/70 rounded-bl-sm"></div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-gold-trim/70 rounded-br-sm"></div>
                </div>
            </div>
          </div>
          {errorMessage ? (
              <p className="text-sm text-center text-status-invalid mt-4">{errorMessage}</p>
          ) : (
              <p className="text-xs text-center text-ledger-brown/60 mt-4">Point your camera at the QR code.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;