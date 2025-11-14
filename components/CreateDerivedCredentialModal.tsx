import React, { useState } from 'react';
import { ethers } from 'ethers';
import type { VerifiableCredential } from '../types';
import { signVC } from '../utils/crypto';
import { useToast } from '../contexts/ToastContext';
import { X, GitBranch } from './icons/Icons';
import Spinner from './Spinner';

interface CreateDerivedCredentialModalProps {
  vc: VerifiableCredential;
  studentDid: string | null;
  onClose: () => void;
  onCreate: (derivedVC: VerifiableCredential) => void;
}

const CreateDerivedCredentialModal: React.FC<CreateDerivedCredentialModalProps> = ({ vc, studentDid, onClose, onCreate }) => {
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
    if (!studentDid) {
        addToast("Please connect your wallet to create a derived credential.", "error");
        return;
    }
    setIsLoading(true);
    try {
        // FIX: Added a global type for window.ethereum to resolve TypeScript error.
        if (typeof window.ethereum === 'undefined') {
            throw new Error("MetaMask is not available. Please install it to sign.");
        }

        // FIX: Removed redundant `as any` cast, as a global type for window.ethereum is now provided.
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const studentSigner = provider.getSigner();
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

        // FIX: Added `issueDate` to satisfy the `CredentialSubject` type. The `issueDate`
        // in the subject of a derived credential should match its top-level `issuanceDate`.
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 relative max-w-lg w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X />
        </button>
        <h3 className="text-xl font-bold mb-4 text-brand-primary dark:text-brand-accent flex items-center gap-2">
            <GitBranch />
            Create Derived Credential
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select the fields you want to include in the new, self-signed credential. This allows you to share specific information without revealing the entire original credential.
        </p>

        <div className="space-y-3 mb-6">
            {availableFields.map(field => (
                <label key={field.key} htmlFor={field.key} className="flex items-center p-3 rounded-md bg-gray-100 dark:bg-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                    <input
                        type="checkbox"
                        id={field.key}
                        name={field.key}
                        checked={fields[field.key as keyof typeof fields]}
                        onChange={handleFieldChange}
                        className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-accent"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">{field.label}:</span>
                    <span className="ml-auto text-sm text-gray-700 dark:text-gray-300">{field.value}</span>
                </label>
            ))}
        </div>
        
        <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="py-2 px-4 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                Cancel
            </button>
            <button 
                onClick={handleCreate} 
                disabled={isLoading || Object.values(fields).every(v => !v) || !studentDid}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-dark bg-brand-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-opacity"
            >
                {isLoading ? <Spinner /> : <GitBranch />}
                {isLoading ? 'Creating...' : 'Create & Sign'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDerivedCredentialModal;