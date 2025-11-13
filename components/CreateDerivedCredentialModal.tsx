import React, { useState } from 'react';
import type { VerifiableCredential } from '../types';
import { getStudentWallet, signVC } from '../utils/crypto';
import { useToast } from '../contexts/ToastContext';
import { X, GitBranch } from './icons/Icons';
import Spinner from './Spinner';

interface CreateDerivedCredentialModalProps {
  vc: VerifiableCredential;
  onClose: () => void;
  onCreate: (derivedVC: VerifiableCredential) => void;
}

const CreateDerivedCredentialModal: React.FC<CreateDerivedCredentialModalProps> = ({ vc, onClose, onCreate }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const initialFields = {
    type: true,
    name: true,
    major: true,
  };
  
  const [fields, setFields] = useState(initialFields);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFields(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleCreate = async () => {
    setIsLoading(true);
    try {
        const studentWallet = getStudentWallet();
        const studentDid = `did:ethr:${studentWallet.address}`;
        
        const originalSubject = vc.credentialSubject;
        const newDegree: any = {};
        if (fields.type) newDegree.type = originalSubject.degree.type;
        if (fields.name) newDegree.name = originalSubject.degree.name;
        if (fields.major) newDegree.major = originalSubject.degree.major;

        if (Object.keys(newDegree).length === 0) {
            addToast("You must select at least one field to include.", "error");
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
            issuer: studentDid,
            issuanceDate,
            credentialSubject: newCredentialSubject,
            evidence: [{
                id: vc.id,
                type: ['SourceCredential'],
                name: 'Original University Degree Credential'
            }]
        };

        const proof = await signVC(vcToSign, studentWallet);
        const derivedVC: VerifiableCredential = { ...vcToSign, proof };
        
        onCreate(derivedVC);
    } catch(error) {
        console.error("Error creating derived credential:", error);
        addToast("An unexpected error occurred.", "error");
    } finally {
        setIsLoading(false);
    }
  };

  const { degree } = vc.credentialSubject;
  const availableFields = [
    { key: 'type', label: 'Degree Type', value: degree.type },
    { key: 'name', label: 'Degree Name', value: degree.name },
    { key: 'major', label: 'Major', value: degree.major },
  ];

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
                        className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-secondary"
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
                disabled={isLoading}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400 flex items-center gap-2"
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