
import React, { useState, useCallback } from 'react';
import type { VerifiableCredential } from '../types';
import { verifyVCSignature, computeCredentialHash } from '../utils/crypto';
import { contractService } from '../services/contractService';
import Spinner from '../components/Spinner';
import { useToast } from '../contexts/ToastContext';
import { UploadCloud, SearchCheck } from '../components/icons/Icons';

type VerificationStatus = 'idle' | 'verifying' | 'valid' | 'invalid_signature' | 'revoked' | 'tampered' | 'error';

const StatusDisplay: React.FC<{ status: VerificationStatus; message: string }> = ({ status, message }) => {
    const baseClasses = "p-4 border-2 text-center font-bold text-lg flex items-center justify-center gap-2";
    const styles = {
        idle: "bg-aged-paper/50 border-ledger-brown/30 text-ledger-brown/70",
        verifying: "bg-gold-trim/10 border-gold-trim/50 text-gold-trim",
        valid: "bg-status-valid/10 border-status-valid/50 text-status-valid",
        invalid_signature: "bg-status-invalid/10 border-status-invalid/50 text-status-invalid",
        tampered: "bg-status-invalid/10 border-status-invalid/50 text-status-invalid",
        revoked: "bg-status-revoked/10 border-status-revoked/50 text-status-revoked",
        error: "bg-status-invalid/10 border-status-invalid/50 text-status-invalid",
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
      <div className="bg-aged-paper/80 p-2 border-2 border-double border-ledger-brown/50">
        <div className="border border-ledger-brown/50 p-6">
            <h2 className="text-2xl font-bold font-serif text-ledger-brown mb-6">Verify Academic Credential</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="vc-json-verify" className="block text-sm font-semibold text-ledger-brown/80">Paste Encoded VC</label>
                  <textarea
                    id="vc-json-verify"
                    rows={10}
                    className="font-mono text-xs mt-1 block w-full p-2 bg-transparent border border-ledger-brown/30 focus:outline-none focus:ring-1 focus:ring-gold-trim focus:border-gold-trim"
                    placeholder='eyJjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sImlkIjoidXJuOnV1aWQ6...'
                    value={vcJson}
                    onChange={(e) => handleVcJsonChange(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex flex-col space-y-4">
                    <label htmlFor="file-upload-verify" className="group flex-grow w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-ledger-brown/40 hover:border-gold-trim cursor-pointer transition-colors">
                        <UploadCloud className="mx-auto h-12 w-12 text-ledger-brown/50 group-hover:text-gold-trim" />
                        <span className="mt-2 text-sm font-semibold text-ledger-brown/90">Upload credential file</span>
                        <input id="file-upload-verify" name="file-upload-verify" type="file" className="sr-only" onChange={handleFileUpload} accept=".txt,text/plain" />
                        <p className="text-xs text-ledger-brown/60 mt-1">Upload the exported encoded .txt file.</p>
                    </label>
                    <button 
                      onClick={handleVerify} 
                      disabled={verificationStatus === 'verifying'}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-sm font-bold text-aged-paper bg-ledger-brown hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-trim disabled:bg-ledger-brown/50 transition-all shadow-emboss active:shadow-emboss-active active:translate-y-px">
                        <SearchCheck />
                        Verify Credential
                    </button>
                </div>
            </div>
            <div className="mt-8 border-t-2 border-double border-ledger-brown/20 pt-6">
                <h3 className="text-lg font-semibold text-ledger-brown mb-4">Verification Result</h3>
                <StatusDisplay status={verificationStatus} message={statusMessage} />
                {verifiedVC && ['valid', 'revoked'].includes(verificationStatus) && (
                  <div className="mt-4 p-4 border border-ledger-brown/30 bg-aged-paper/50">
                    <h4 className="font-bold text-ledger-brown text-lg font-serif">Credential Details</h4>
                    <div className="mt-2 text-sm space-y-2">
                        <div className="flex justify-between border-b border-ledger-brown/20 py-1"><strong>Student:</strong> <span className="font-mono text-right">{verifiedVC.credentialSubject.id}</span></div>
                        <div className="flex justify-between border-b border-ledger-brown/20 py-1"><strong>Degree:</strong> <span className="text-right">{verifiedVC.credentialSubject.degree.type} in {verifiedVC.credentialSubject.degree.name}</span></div>
                        <div className="flex justify-between border-b border-ledger-brown/20 py-1"><strong>Major:</strong> <span className="text-right">{verifiedVC.credentialSubject.degree.major}</span></div>
                        <div className="flex justify-between border-b border-ledger-brown/20 py-1"><strong>Issuer:</strong> <span className="font-mono text-right">{verifiedVC.issuer}</span></div>
                        <div className="flex justify-between border-b border-ledger-brown/20 py-1"><strong>Issued On:</strong> <span className="text-right">{new Date(verifiedVC.issuanceDate).toUTCString()}</span></div>
                         {verifiedVC.evidence?.[0]?.cid && (
                            <div className="flex justify-between pt-1"><strong>Evidence CID:</strong> <a href={`https://ipfs.io/ipfs/${verifiedVC.evidence[0].cid}`} target="_blank" rel="noopener noreferrer" className="text-gold-trim hover:underline font-mono text-right">{verifiedVC.evidence[0].cid}</a></div>
                        )}
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>
    );
};

export default EmployerVerifier;