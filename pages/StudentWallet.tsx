import React, { useState, useCallback, useEffect, Suspense } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { VerifiableCredential } from '../types';
import CredentialCard from '../components/CredentialCard';
import QRCodeModal from '../components/QRCodeModal';
import CreateDerivedCredentialModal from '../components/CreateDerivedCredentialModal';
import { useToast } from '../contexts/ToastContext';
import { UploadCloud, QrCodeScan, Copy } from '../components/icons/Icons';
import { getStudentWallet } from '../utils/crypto';
import Spinner from '../components/Spinner';

const QRScannerModal = React.lazy(() => import('../components/QRScannerModal'));

const StudentWallet: React.FC = () => {
  const [credentials, setCredentials] = useLocalStorage<VerifiableCredential[]>('student_credentials', []);
  const [vcToDisplayInQr, setVcToDisplayInQr] = useState<VerifiableCredential | null>(null);
  const [vcToDeriveFrom, setVcToDeriveFrom] = useState<VerifiableCredential | null>(null);
  const [pastedJson, setPastedJson] = useState('');
  const [studentDid, setStudentDid] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      const studentWallet = getStudentWallet();
      setStudentDid(studentWallet.address);
    } catch (e) {
        console.error("Could not initialize student wallet:", e);
        addToast("Could not initialize your wallet. Please refresh.", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleImportJson = useCallback((data: string) => {
    let vc: VerifiableCredential;
    try {
        // First, try to parse as raw JSON (for file uploads/paste)
        vc = JSON.parse(data);
    } catch (e) {
        // If that fails, assume it's Base64 from a QR code
        try {
            const decodedJson = decodeURIComponent(escape(atob(data)));
            vc = JSON.parse(decodedJson);
        } catch (error) {
            console.error("Failed to import VC:", error);
            addToast(`Failed to import VC: The data is not valid JSON or Base64.`, "error");
            return;
        }
    }

    try {
        // Basic validation
        if (!vc.proof || !vc.credentialSubject || !vc.issuer) {
            throw new Error("Invalid VC format.");
        }
        // Check for duplicates
        if (credentials.some(c => c.id === vc.id)) {
            addToast("This credential is already in your wallet.", "info");
            return;
        }
        setCredentials(prev => [...prev, vc]);
        addToast("Credential imported successfully!", "success");
        setPastedJson('');
    } catch (error) {
        console.error("Failed to process VC:", error);
        addToast(`Failed to process VC: ${(error as Error).message}`, "error");
    }
  }, [credentials, setCredentials, addToast]);

  const handleJsonPaste = () => {
    if (pastedJson.trim()) {
      handleImportJson(pastedJson);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleImportJson(result);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = (vc: VerifiableCredential) => {
    const jsonString = JSON.stringify(vc, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credential-${vc.id.slice(-8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Credential exported.", "success");
  };

  const handleCreateDerivedVC = (derivedVC: VerifiableCredential) => {
    setCredentials(prev => [...prev, derivedVC]);
    addToast('Derived credential created and added to wallet.', 'success');
    setVcToDeriveFrom(null);
  }
  
  const handleScan = (data: string) => {
    setIsScannerOpen(false);
    handleImportJson(data);
  };

  const handleCopyDid = () => {
    if (studentDid) {
        const fullDid = `did:ethr:${studentDid}`;
        navigator.clipboard.writeText(fullDid).then(() => {
            addToast("DID copied to clipboard!", "success");
        }).catch(err => {
            console.error("Failed to copy DID:", err);
            addToast("Failed to copy DID.", "error");
        });
    }
  };

  const ScannerFallback = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-gray-800 dark:text-gray-200">Loading Scanner...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-brand-primary dark:text-brand-accent mb-2">My Student Wallet</h2>
        {studentDid && (
            <div className="flex items-center gap-2 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
                    <span className="font-semibold">Your DID:</span> did:ethr:{studentDid}
                </p>
                <button 
                    onClick={handleCopyDid} 
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Copy DID"
                >
                    <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
            </div>
        )}
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Import New Credential</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Upload File */}
                <label htmlFor="file-upload" className="group relative w-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-primary dark:hover:border-brand-accent cursor-pointer transition-colors">
                    <UploadCloud className="h-12 w-12 text-gray-400 group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors" />
                    <span className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Upload from File</span>
                    <p className="text-xs text-gray-500">Import a .json credential file.</p>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".json,application/json" />
                </label>

                {/* Option 2: Scan QR */}
                <button onClick={() => setIsScannerOpen(true)} className="group relative w-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-primary dark:hover:border-brand-accent cursor-pointer transition-colors">
                    <QrCodeScan className="h-12 w-12 text-gray-400 group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors" />
                    <span className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Scan QR Code</span>
                    <p className="text-xs text-gray-500">Use your camera to import.</p>
                </button>
            </div>
             <div className="mt-6">
                <label htmlFor="vc-json" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Or Paste VC JSON</label>
                <textarea
                id="vc-json"
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                placeholder='{ "@context": ... }'
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                ></textarea>
                <button onClick={handleJsonPaste} className="mt-2 w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-secondary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary">
                Import from Text
                </button>
            </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">My Credentials</h2>
        {credentials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentials
              .sort((a,b) => new Date(b.issuanceDate).getTime() - new Date(a.issuanceDate).getTime())
              .map(vc => (
              <CredentialCard
                key={vc.id}
                vc={vc}
                onExport={handleExport}
                onShowQr={setVcToDisplayInQr}
                onDerive={setVcToDeriveFrom}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Your wallet is empty.</h3>
            <p className="text-gray-500 mt-2">Import a credential using one of the methods above.</p>
          </div>
        )}
      </div>

      {vcToDisplayInQr && (
        <QRCodeModal
          value={btoa(unescape(encodeURIComponent(JSON.stringify(vcToDisplayInQr))))}
          onClose={() => setVcToDisplayInQr(null)}
          title="Verifiable Credential"
        />
      )}

      {vcToDeriveFrom && (
        <CreateDerivedCredentialModal
            vc={vcToDeriveFrom}
            onClose={() => setVcToDeriveFrom(null)}
            onCreate={handleCreateDerivedVC}
        />
      )}

      {isScannerOpen && (
        <Suspense fallback={<ScannerFallback />}>
            <QRScannerModal
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />
        </Suspense>
      )}
    </div>
  );
};

export default StudentWallet;