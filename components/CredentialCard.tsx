
import React from 'react';
import type { VerifiableCredential } from '../types';
import { Download, QrCode, GitBranch } from './icons/Icons';

interface CredentialCardProps {
  vc: VerifiableCredential;
  onExport: (vc: VerifiableCredential) => void;
  onShowQr: (vc: VerifiableCredential) => void;
  onDerive: (vc: VerifiableCredential) => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ vc, onExport, onShowQr, onDerive }) => {
  const { credentialSubject, issuanceDate, issuer } = vc;
  const { degree } = credentialSubject;
  const isDerived = vc.type.includes('DerivedUniversityDegreeCredential');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 relative`}>
      {isDerived && (
        <div className="absolute top-2 right-2 bg-brand-accent text-brand-dark text-xs font-bold px-2 py-1 rounded-full">
          DERIVED
        </div>
      )}
      <div className={`p-5 border-b-4 ${isDerived ? 'border-brand-accent' : 'border-brand-primary'}`}>
        <h3 className={`text-xl font-bold ${isDerived ? 'text-brand-accent' : 'text-brand-primary dark:text-brand-accent'}`}>{degree.name || 'Derived Credential'}</h3>
        {degree.type && <p className="text-gray-600 dark:text-gray-400">{degree.type}</p>}
      </div>
      <div className="p-5 space-y-3 text-sm">
        {degree.major && (
            <div className="flex justify-between">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Major:</span>
            <span className="text-gray-800 dark:text-gray-200">{degree.major}</span>
            </div>
        )}
        <div className="flex justify-between">
          <span className="font-semibold text-gray-500 dark:text-gray-400">Issued On:</span>
          <span className="text-gray-800 dark:text-gray-200">{new Date(issuanceDate).toLocaleDateString()}</span>
        </div>
         <div className="flex flex-col">
          <span className="font-semibold text-gray-500 dark:text-gray-400">Issuer:</span>
          <span className="text-gray-800 dark:text-gray-200 break-all">{issuer}</span>
        </div>
        {vc.evidence?.map(e => (
            <div key={e.id} className="flex flex-col pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-500 dark:text-gray-400">{e.type.includes('SourceCredential') ? 'Source Credential' : 'Evidence'}:</span>
                <span className="text-gray-800 dark:text-gray-200 break-all text-xs">{e.id}</span>
            </div>
        ))}
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2">
        <button
          onClick={() => onDerive(vc)}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-brand-light hover:text-brand-primary dark:hover:bg-gray-600 transition-colors"
          title="Create Derived Credential"
          disabled={isDerived}
        >
          <GitBranch className={isDerived ? 'text-gray-400' : ''} />
        </button>
        <button
          onClick={() => onShowQr(vc)}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-brand-light hover:text-brand-primary dark:hover:bg-gray-600 transition-colors"
          title="Show QR Code"
        >
          <QrCode />
        </button>
        <button
          onClick={() => onExport(vc)}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-brand-light hover:text-brand-primary dark:hover:bg-gray-600 transition-colors"
          title="Export as Encoded Text"
        >
          <Download />
        </button>
      </div>
    </div>
  );
};

export default CredentialCard;
