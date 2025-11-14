
import React, { useState, useCallback } from 'react';
import type { VerifiableCredential } from '../types';
import { verifyVCSignature, computeCredentialHash } from '../utils/crypto';
import { contractService } from '../services/contractService';
import Spinner from '../components/Spinner';
import { useToast } from '../contexts/ToastContext';
import { UploadCloud, SearchCheck } from '../components/icons/Icons';

type VerificationStatus = 'idle' | 'verifying' | 'valid' | 'invalid_signature' | 'revoked' | 'tampered' | 'error';

const StatusDisplay: React.FC<{ status: VerificationStatus; message: string }> = ({ status, message }) => {
    const baseClasses = "p-4 rounded-lg text-center font-bold text-lg flex items-center justify-center gap-2";
    const styles = {
        idle: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
        verifying: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
        valid: "bg-status-valid/20 text-status-valid",
        invalid_signature: "bg-status-invalid/20 text-status-invalid",
        tampered: "bg-status-invalid/20 text-status-invalid",
        revoked: "bg-status-revoked/20 text-status-revoked",
        error: "bg-status-invalid/20 text-status-invalid",
    };
    
    return (
        <div className={`${baseClasses} ${styles[status]}`}>
            {status === 'verifying' && <Spinner />}
            <span>{message}</span>
        </div>
    );
}


const EmployerVerifier: React.FC = () => {
    const [vcJson, setVcJson] = useState('');
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
    const [statusMessage, setStatusMessage] = useState('Awaiting credential for verification.');
    const [verifiedVC, setVerifiedVC] = useState<VerifiableCredential | null>(null);
    const { addToast } = useToast();

    const resetState = () => {
        setVerificationStatus('idle');
        setStatusMessage('Awaiting credential for verification.');
        setVerifiedVC(null);
    }

    const handleVcJsonChange = (json: string) => {
        setVcJson(json);
        resetState();
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            setVcJson(result);
            resetState();
          };
          reader.readAsText(file);
        }
    };
    
    const handleVerify = useCallback(async () => {
        if (!vcJson.trim()) {
            addToast('Please provide a credential to verify.', 'error');
            return;
        }

        setVerificationStatus('verifying');
        setStatusMessage('Starting verification...');
        let vc: VerifiableCredential;

        try {
            // Try decoding from Base64 first
            const decodedJson = decodeURIComponent(escape(atob(vcJson)));
            vc = JSON.parse(decodedJson);
        } catch (e) {
            // Fallback to parsing raw JSON
            try {
                vc = JSON.parse(vcJson);
            } catch (jsonError) {
                setVerificationStatus('error');
                setStatusMessage('Invalid format. Please provide an encoded credential or valid JSON.');
                return;
            }
        }
        
        setVerifiedVC(vc);

        await new Promise(res => setTimeout(res, 500)); // simulate network delay

        // Step 1: Verify Signature
        setStatusMessage('Verifying cryptographic signature...');
        const isSignatureValid = await verifyVCSignature(vc);
        if (!isSignatureValid) {
            setVerificationStatus('invalid_signature');
            setStatusMessage('Verification failed: Invalid signature.');
            return;
        }
        setStatusMessage('Signature is valid.');
        await new Promise(res => setTimeout(res, 500));
        
        // Step 2: Check for revocation
        setStatusMessage('Checking on-chain revocation status (mock)...');
        const credentialHash = computeCredentialHash(vc);
        const isRevoked = await contractService.isRevoked(credentialHash);

        if (isRevoked) {
            setVerificationStatus('revoked');
            setStatusMessage('Credential has been revoked by the issuer.');
            return;
        }

        setVerificationStatus('valid');
        setStatusMessage('Credential is valid and authentic.');

    }, [vcJson, addToast]);

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-brand-primary dark:text-brand-accent mb-6">Verify Academic Credential</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="vc-json-verify" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paste Encoded VC</label>
              <textarea
                id="vc-json-verify"
                rows={10}
                className="font-mono text-xs mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                placeholder='eyJjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sImlkIjoidXJuOnV1aWQ6...'
                value={vcJson}
                onChange={(e) => handleVcJsonChange(e.target.value)}
              ></textarea>
            </div>
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col items-center justify-center p-4 h-full border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <label htmlFor="file-upload-verify" className="mt-2 relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-brand-primary hover:text-brand-dark focus-within:outline-none">
                        <span>Upload credential file</span>
                        <input id="file-upload-verify" name="file-upload-verify" type="file" className="sr-only" onChange={handleFileUpload} accept=".txt,text/plain" />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Upload the exported encoded .txt file.</p>
                </div>
                <button 
                  onClick={handleVerify} 
                  disabled={verificationStatus === 'verifying'}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-dark bg-brand-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-400 transition-opacity">
                    <SearchCheck />
                    Verify Credential
                </button>
            </div>
        </div>
        <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Verification Result</h3>
            <StatusDisplay status={verificationStatus} message={statusMessage} />
            {verifiedVC && ['valid', 'revoked'].includes(verificationStatus) && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <h4 className="font-bold text-brand-primary dark:text-brand-accent">Credential Details</h4>
                <div className="mt-2 text-sm space-y-1">
                    <p><strong>Student:</strong> {verifiedVC.credentialSubject.id}</p>
                    <p><strong>Degree:</strong> {verifiedVC.credentialSubject.degree.type} in {verifiedVC.credentialSubject.degree.name}</p>
                    <p><strong>Major:</strong> {verifiedVC.credentialSubject.degree.major}</p>
                    <p><strong>Issuer:</strong> {verifiedVC.issuer}</p>
                    <p><strong>Issued On:</strong> {new Date(verifiedVC.issuanceDate).toUTCString()}</p>
                     {verifiedVC.evidence?.[0]?.cid && (
                        <p><strong>Evidence CID:</strong> <a href={`https://ipfs.io/ipfs/${verifiedVC.evidence[0].cid}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{verifiedVC.evidence[0].cid}</a></p>
                    )}
                </div>
              </div>
            )}
        </div>
      </div>
    );
};

export default EmployerVerifier;
