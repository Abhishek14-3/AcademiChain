
import React, { useState, useCallback, useEffect, Suspense } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { VerifiableCredential } from '../types';
import CredentialCard from '../components/CredentialCard';
import QRCodeModal from '../components/QRCodeModal';
import CreateDerivedCredentialModal from '../components/CreateDerivedCredentialModal';
import { useToast } from '../contexts/ToastContext';
import { UploadCloud, QrCodeScan, Copy, Wallet } from '../components/icons/Icons';
import Spinner from '../components/Spinner';

const QRScannerModal = React.lazy(() => import('../components/QRScannerModal'));

const StudentWallet: React.FC = () => {
  const [credentials, setCredentials] = useLocalStorage<VerifiableCredential[]>('student_credentials', []);
  const [vcToDisplayInQr, setVcToDisplayInQr] = useState<VerifiableCredential | null>(null);
  const [vcToDeriveFrom, setVcToDeriveFrom] = useState<VerifiableCredential | null>(null);
  const [pastedJson, setPastedJson] = useState('');
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      // FIX: Added a global type for window.ethereum to resolve TypeScript error.
      if (window.ethereum) {
        try {
          // FIX: Added a global type for window.ethereum to resolve TypeScript error.
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setConnectedAccount(accounts[0]);
          }
        } catch (error) {
          console.error("Could not check for connected wallet:", error);
        }
      }
    };

    checkIfWalletIsConnected();

    // FIX: Added a global type for window.ethereum to resolve TypeScript error.
    if (window.ethereum) {
        // FIX: Added a global type for window.ethereum to resolve TypeScript error.
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length > 0) {
                setConnectedAccount(accounts[0]);
                addToast("Wallet account changed.", "info");
            } else {
                setConnectedAccount(null);
                addToast("Wallet disconnected.", "info");
            }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const connectWallet = async () => {
    // FIX: Added a global type for window.ethereum to resolve TypeScript error.
    if (window.ethereum) {
        try {
            // FIX: Added a global type for window.ethereum to resolve TypeScript error.
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setConnectedAccount(accounts[0]);
            addToast("Wallet connected successfully!", "success");
        } catch (error) {
            console.error("User rejected wallet connection:", error);
            addToast("Wallet connection was rejected.", "error");
        }
    } else {
        addToast("Please install MetaMask to use this feature.", "error");
    }
  };

  const handleImportJson = useCallback((data: string) => {
    let vc: VerifiableCredential;
    try {
      // Prioritize Base64 decoding, as this is the new primary format for copy/paste and QR
      const decodedJson = decodeURIComponent(escape(atob(data)));
      vc = JSON.parse(decodedJson);
    } catch (e) {
      // Fallback to parsing as raw JSON for file uploads or direct JSON pastes
      try {
        vc = JSON.parse(data);
      } catch (error) {
        console.error("Failed to import VC:", error);
        addToast(`Failed to import VC: The data is not valid Base64 or JSON.`, "error");
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
    const encodedString = btoa(unescape(encodeURIComponent(JSON.stringify(vc))));
    const blob = new Blob([encodedString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credential-${vc.id.slice(-8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Encoded credential exported.", "success");
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
    if (connectedAccount) {
        const fullDid = `did:ethr:${connectedAccount}`;
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
        <h2 className="text-2xl font-bold text-brand-primary dark:text-brand-accent mb-4">My Student Wallet</h2>
        {connectedAccount ? (
            <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Digital Identifier (DID)</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate font-mono">
                          did:ethr:{connectedAccount}
                      </p>
                  </div>
                  <button 
                      onClick={handleCopyDid} 
                      className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                      title="Copy DID"
                  >
                      <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
              </div>
            </div>
        ) : (
             <div className="mb-6">
                <button onClick={connectWallet} className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors">
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect MetaMask Wallet
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
                    <p className="text-xs text-gray-500">Import an encoded .txt file.</p>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".txt,text/plain" />
                </label>

                {/* Option 2: Scan QR */}
                <button onClick={() => setIsScannerOpen(true)} className="group relative w-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-primary dark:hover:border-brand-accent cursor-pointer transition-colors">
                    <QrCodeScan className="h-12 w-12 text-gray-400 group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors" />
                    <span className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Scan QR Code</span>
                    <p className="text-xs text-gray-500">Use your camera to import.</p>
                </button>
            </div>
             <div className="mt-6">
                <label htmlFor="vc-json" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Or Paste Encoded VC</label>
                <textarea
                id="vc-json"
                rows={4}
                className="font-mono text-xs mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                placeholder='eyJjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sImlkIjoidXJuOnV1aWQ6...'
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                ></textarea>
                <button onClick={handleJsonPaste} className="mt-2 w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors">
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
            studentDid={connectedAccount}
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
