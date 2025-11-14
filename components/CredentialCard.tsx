
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
    <div className={`bg-aged-paper/80 rounded-sm shadow-md overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 border-2 border-ledger-brown/50 p-1`}>
      <div className="border border-ledger-brown/50 relative">
        {isDerived && (
          <div className="absolute top-2 right-2 bg-dusty-burgundy text-aged-paper text-xs font-bold px-3 py-1 rounded-sm tracking-widest">
            DERIVED
          </div>
        )}
        <div className={`p-5 border-b-4 ${isDerived ? 'border-dusty-burgundy' : 'border-gold-trim'}`}>
          <h3 className={`text-xl font-serif font-bold ${isDerived ? 'text-dusty-burgundy' : 'text-ledger-brown'}`}>{degree.name || 'Derived Credential'}</h3>
          {degree.type && <p className="text-ledger-brown/70">{degree.type}</p>}
        </div>
        <div className="p-5 space-y-3 text-sm">
            <div className="flex justify-between items-center border-b border-ledger-brown/10 pb-2">
            <span className="font-semibold text-ledger-brown/60">Issued On:</span>
            <span className="text-ledger-brown font-mono text-right">{new Date(issuanceDate).toLocaleDateString()}</span>
            </div>

            {degree.major && (
                <div className="flex justify-between items-center border-b border-ledger-brown/10 pb-2">
                <span className="font-semibold text-ledger-brown/60">Major:</span>
                <span className="text-ledger-brown text-right">{degree.major}</span>
                </div>
            )}

            <div className="flex flex-col pt-1 border-b border-ledger-brown/10 pb-2">
            <span className="font-semibold text-ledger-brown/60 mb-1">Issuer:</span>
            <span className="text-ledger-brown/90 break-all font-mono text-xs">{issuer}</span>
            </div>

            {vc.evidence?.map(e => (
                <div key={e.id} className="flex flex-col pt-2">
                    <span className="font-semibold text-ledger-brown/60 mb-1">{e.type.includes('SourceCredential') ? 'Source Credential' : 'Evidence'}:</span>
                    <span className="text-ledger-brown/90 break-all text-xs font-mono">{e.id}</span>
                </div>
            ))}
        </div>
        <div className="p-2 border-t-2 border-double border-ledger-brown/30 flex justify-end space-x-1">
          <button
            onClick={() => onDerive(vc)}
            className="p-2 rounded-sm text-ledger-brown/70 hover:bg-gold-trim/20 hover:text-ledger-brown disabled:text-ledger-brown/30 disabled:hover:bg-transparent"
            title="Create Derived Credential"
            disabled={isDerived}
          >
            <GitBranch />
          </button>
          <button
            onClick={() => onShowQr(vc)}
            className="p-2 rounded-sm text-ledger-brown/70 hover:bg-gold-trim/20 hover:text-ledger-brown"
            title="Show QR Code"
          >
            <QrCode />
          </button>
          <button
            onClick={() => onExport(vc)}
            className="p-2 rounded-sm text-ledger-brown/70 hover:bg-gold-trim/20 hover:text-ledger-brown"
            title="Export as Encoded Text"
          >
            <Download />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialCard;