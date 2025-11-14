import React, { useState } from 'react';
import { ethers } from 'ethers';
import type { VerifiableCredential } from '../types';
import { signVC } from '../utils/crypto';
import { useToast } from '../contexts/ToastContext';
import { X, GitBranch } from './icons/Icons';
import Spinner from './Spinner';

interface CreateDerivedCredentialModalProps {
  vc: VerifiableCredential;
  signer: ethers.Signer | null;
  onClose: () => void;
  onCreate: (derivedVC: VerifiableCredential) => void;
}

const CreateDerivedCredentialModal: React.FC<CreateDerivedCredentialModalProps> = ({ vc, signer, onClose, onCreate }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const initialFields = {
    type: true,
    name: true,
    major: !!vc.credentialSubject.degree.major,
  };
  
  const [fields, setFields] = useState(initialFields);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFields(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleCreate = async () => {
    if (!signer) {
        addToast("Your wallet is not connected. Please connect to sign.", "error");
        return;
    }
    setIsLoading(true);
    try {
        const studentSigner = signer;
        const issuerDid = `did:ethr:${await studentSigner.getAddress()}`;
        
        const originalSubject = vc.credentialSubject;
        const newDegree: any = {};
        if (fields.type) newDegree.type = originalSubject.degree.type;
        if (fields.name) newDegree.name = originalSubject.degree.name;
        if (fields.major) newDegree.major = originalSubject.degree.major;

        if (Object.keys(newDegree).length === 0) {
            addToast("You must select at least one field to include.", "error");
            setIsLoading(false);
            return;
        }

        const issuanceDate = new Date().toISOString();

        const newCredentialSubject = {
            id: originalSubject.id,
            degree: newDegree,
            issueDate: issuanceDate,
        };

        const vcToSign: Omit<VerifiableCredential, 'proof'> = {
            '@context': vc['@context'],
            id: `urn:uuid:${crypto.randomUUID()}`,
            type: ['VerifiableCredential', 'DerivedUniversityDegreeCredential'],
            issuer: issuerDid,
            issuanceDate,
            credentialSubject: newCredentialSubject,
            evidence: [{
                id: vc.id,
                type: ['SourceCredential'],
                name: 'Original University Degree Credential'
            }]
        };

        const proof = await signVC(vcToSign, studentSigner);
        const derivedVC: VerifiableCredential = { ...vcToSign, proof };
        
        onCreate(derivedVC);
    } catch(error) {
        console.error("Error creating derived credential:", error);
        addToast((error as Error).message || "An unexpected error occurred.", "error");
    } finally {
        setIsLoading(false);
    }
  };

  const { degree } = vc.credentialSubject;
  const availableFields = [
    { key: 'type', label: 'Degree Type', value: degree.type },
    { key: 'name', label: 'Degree Name', value: degree.name },
    { key: 'major', label: 'Major', value: degree.major },
  ].filter(field => field.value);

  return (
    <div className="fixed inset-0 bg-ledger-brown bg-opacity-80 flex items-center justify-center z-50 p-4 font-serif">
      <div className="bg-aged-paper rounded-sm shadow-2xl p-2 relative max-w-lg w-full border-2 border-double border-ledger-brown/50">
        <div className="border border-ledger-brown/50 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 rounded-full text-ledger-brown/70 hover:bg-gold-trim/20 transition-colors"
            aria-label="Close modal"
          >
            <X />
          </button>
          <h3 className="text-xl font-bold mb-4 text-ledger-brown flex items-center gap-2">
              <GitBranch />
              Create Derived Credential
          </h3>
          <p className="text-sm text-ledger-brown/80 mb-4">
              Select the fields you want to include in the new, self-signed credential. This allows you to share specific information without revealing the entire original credential.
          </p>

          <div className="space-y-3 mb-6">
              {availableFields.map(field => (
                  <label key={field.key} htmlFor={field.key} className="flex items-center p-3 border border-ledger-brown/20 cursor-pointer hover:bg-gold-trim/10">
                      <input
                          type="checkbox"
                          id={field.key}
                          name={field.key}
                          checked={fields[field.key as keyof typeof fields]}
                          onChange={handleFieldChange}
                          className="h-5 w-5 rounded-sm border-ledger-brown/50 text-ledger-brown bg-aged-paper focus:ring-gold-trim"
                      />
                      <span className="ml-3 text-sm font-semibold text-ledger-brown">{field.label}:</span>
                      <span className="ml-auto text-sm text-ledger-brown/80 font-mono text-right">{field.value}</span>
                  </label>
              ))}
          </div>
          
          <div className="flex justify-end space-x-3">
              <button onClick={onClose} className="py-2 px-4 rounded-sm text-sm font-semibold text-ledger-brown bg-aged-paper/50 hover:bg-ledger-brown/20 border border-ledger-brown/50">
                  Cancel
              </button>
              <button 
                  onClick={handleCreate} 
                  disabled={isLoading || Object.values(fields).every(v => !v) || !signer}
                  className="py-2 px-4 rounded-sm text-sm font-bold text-aged-paper bg-ledger-brown hover:bg-opacity-90 disabled:bg-ledger-brown/50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-emboss active:shadow-emboss-active active:translate-y-px"
              >
                  {isLoading ? <Spinner /> : <GitBranch />}
                  {isLoading ? 'Creating...' : 'Create & Sign'}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDerivedCredentialModal;