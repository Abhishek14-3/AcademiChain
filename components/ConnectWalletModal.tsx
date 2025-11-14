import React from 'react';
import { X, Wallet, WalletConnect } from './icons/Icons';

interface ConnectWalletModalProps {
  onClose: () => void;
  onConnectMetaMask: () => void;
  onConnectWalletConnect: () => void;
}

// A simple MetaMask icon as the library doesn't provide one
const MetaMaskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M228.91 93.3591L218.06 43.8391C215.93 35.1991 207.62 28.5991 198.56 29.1391L149.34 32.1291C142.19 32.5591 135.53 35.5791 130.65 40.5891L78.33 94.3191C73.18 99.6191 72.84 107.829 77.61 113.489L108.99 152.329C105.15 153.259 101.44 154.559 97.99 156.179L62.22 172.589C54.72 175.929 52.12 185.399 57.24 192.059L78.11 218.179C83.24 224.829 92.42 226.479 99.44 222.149L129.77 202.349C133.09 200.279 136.03 197.809 138.52 194.999L183.1 135.219C187.31 129.619 186.29 121.609 181.04 116.519L142.18 78.4991L193.3 48.7791C196.55 46.9991 200.28 47.7491 202.13 50.4891L224.93 81.3991C229.01 86.8191 230.93 93.6591 228.91 99.9891L221.72 121.149C220.9 123.589 218.08 124.739 215.76 123.779L191.8 113.889C189.48 112.929 188.35 110.089 189.34 107.829L193.38 98.7491C193.85 97.6891 193.42 96.4491 192.44 95.8191L187.9 92.8391C186.92 92.2091 185.64 92.5491 185.03 93.5191L182.25 98.2491C181.64 99.2191 182 100.459 182.98 101.089L190.22 105.709C191.2 106.339 191.53 107.579 190.93 108.549L188.15 113.279C187.54 114.249 186.26 114.589 185.28 113.959L178.04 109.339C177.06 108.709 176.73 107.469 177.33 106.499L182.52 97.8391C184.22 94.8891 183.33 90.9691 180.52 89.0391L134.46 56.4191C132.3 54.8391 129.5 54.3691 127.13 55.1591L87.5 68.4991C84.77 69.4191 83.18 72.1391 83.58 75.0391L86.26 94.9291C86.66 97.8291 88.8 100.109 91.6 100.749L135.54 110.019C136.96 110.319 138.4 110.089 139.67 109.399L184.25 80.3191C185.65 79.5291 187.35 79.8291 188.45 80.9591L200.75 93.5891C201.85 94.7191 201.97 96.5391 200.99 97.8091L197.35 102.729C196.37 103.999 196.53 105.789 197.63 106.889L205.15 114.229C206.25 115.329 207.95 115.539 209.21 114.539L228.91 99.9891C229.9 99.2791 230.14 97.8991 229.53 96.8691L228.91 93.3591Z" fill="currentColor"/>
  </svg>
);


const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ onClose, onConnectMetaMask, onConnectWalletConnect }) => {
  return (
    <div className="fixed inset-0 bg-ledger-brown bg-opacity-80 flex items-center justify-center z-50 p-4 font-serif">
      <div className="bg-aged-paper rounded-sm shadow-2xl p-2 relative max-w-xs w-full border-2 border-double border-ledger-brown/50">
        <div className="border border-ledger-brown/50 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 rounded-full text-ledger-brown/70 hover:bg-gold-trim/20 transition-colors"
            aria-label="Close modal"
          >
            <X />
          </button>
          <h3 className="text-lg font-bold mb-6 text-center text-ledger-brown">Connect Wallet</h3>
          <div className="space-y-4">
            <button
              onClick={onConnectMetaMask}
              className="w-full flex items-center p-3 border border-ledger-brown/30 hover:bg-gold-trim/10 rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-gold-trim"
            >
              <MetaMaskIcon className="w-8 h-8 mr-4 text-[#E4761B]" />
              <span className="text-md font-semibold">MetaMask</span>
            </button>
            <button
              onClick={onConnectWalletConnect}
              className="w-full flex items-center p-3 border border-ledger-brown/30 hover:bg-gold-trim/10 rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-gold-trim"
            >
              <WalletConnect className="w-8 h-8 mr-4 text-[#3B99FC]" />
              <span className="text-md font-semibold">WalletConnect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;