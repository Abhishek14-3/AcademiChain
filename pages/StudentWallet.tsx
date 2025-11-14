

import React, { useState, useCallback, useEffect, Suspense, useRef } from 'react';
import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import useLocalStorage from '../hooks/useLocalStorage';
import type { VerifiableCredential } from '../types';
import CredentialCard from '../components/CredentialCard';
import QRCodeModal from '../components/QRCodeModal';
import CreateDerivedCredentialModal from '../components/CreateDerivedCredentialModal';
import ConnectWalletModal from '../components/ConnectWalletModal';
import { useToast } from '../contexts/ToastContext';
import { UploadCloud, QrCodeScan, Copy, Wallet } from '../components/icons/Icons';
import Spinner from '../components/Spinner';

const QRScannerModal = React.lazy(() => import('../components/QRScannerModal'));

// A public project ID from the WalletConnect examples.
// In a production app, you should obtain your own from https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = 'b83f2330f984683528f4a1f34138a2e3';

const StudentWallet: React.FC = () => {
  const [credentials, setCredentials] = useLocalStorage<VerifiableCredential[]>('student_credentials', []);
  const [vcToDisplayInQr, setVcToDisplayInQr] = useState<VerifiableCredential | null>(null);
  const [vcToDeriveFrom, setVcToDeriveFrom] = useState<VerifiableCredential | null>(null);
  const [pastedJson, setPastedJson] = useState('');
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const { addToast } = useToast();

  const wcProvider = useRef<EthereumProvider | null>(null);

  const cleanupConnection = useCallback(() => {
    setConnectedAccount(null);
    setSigner(null);
    if (wcProvider.current) {
        wcProvider.current.removeAllListeners();
        wcProvider.current = null;
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    if (wcProvider.current?.session) {
      await wcProvider.current.disconnect();
    }
    cleanupConnection();
    addToast("Wallet disconnected.", "info");
  }, [addToast, cleanupConnection]);

  const setupProvider = useCallback(async (provider: any) => {
    try {
        const web3Provider = new ethers.providers.Web3Provider(provider);
        const currentSigner = web3Provider.getSigner();
        const accounts = await web3Provider.listAccounts();
        
        if (accounts.length > 0) {
            setSigner(currentSigner);
            setConnectedAccount(accounts[0]);
            
            // Handle WalletConnect Events
            if (provider instanceof EthereumProvider) {
                 wcProvider.current = provider;
                 provider.on('accountsChanged', (newAccounts: string[]) => {
                    if (newAccounts.length > 0) {
                        setConnectedAccount(newAccounts[0]);
                        setSigner(new ethers.providers.Web3Provider(provider).getSigner());
                        addToast("Wallet account changed.", "info");
                    } else {
                        handleDisconnect();
                    }
                });
                provider.on('disconnect', () => {
                    handleDisconnect();
                });
            }
        } else {
             handleDisconnect();
        }
    } catch (error) {
        console.error("Error setting up provider:", error);
        addToast("Could not connect to wallet.", "error");
        cleanupConnection();
    }
  }, [addToast, handleDisconnect, cleanupConnection]);

  // Handle MetaMask events
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0 && !wcProvider.current?.session) {
                setupProvider(window.ethereum);
            } else if (!wcProvider.current?.session) {
                handleDisconnect();
            }
        };
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }
  }, [handleDisconnect, setupProvider]);
  
  // Check for existing connection on page load
  useEffect(() => {
    const connectExisting = async () => {
      // Auto-reconnect to MetaMask if already permitted.
      // We purposefully do not auto-reconnect WalletConnect sessions on page load
      // to ensure a fresh QR code modal is displayed for every connection attempt,
      // avoiding issues with stale sessions.
      if (window.ethereum?.isMetaMask) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if(accounts.length > 0){
               await setupProvider(window.ethereum);
          }
        } catch (error) {
            console.warn("Could not auto-reconnect to MetaMask:", error);
        }
      }
    };
    connectExisting();
  }, [setupProvider]);


  const connectMetaMask = async () => {
    setIsConnectModalOpen(false);
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            setupProvider(window.ethereum);
            addToast("MetaMask connected successfully!", "success");
        } catch (error) {
            console.error("User rejected MetaMask connection:", error);
            addToast("Wallet connection was rejected.", "error");
        }
    } else {
        addToast("Please install MetaMask to use this feature.", "error");
    }
  };

  const connectWalletConnect = async () => {
    setIsConnectModalOpen(false);
    try {
        const provider = await EthereumProvider.init({
            projectId: WALLETCONNECT_PROJECT_ID,
            chains: [1],
            showQrModal: true,
             qrModalOptions: { 
                themeMode: 'light', // Force light for better QR visibility with custom theme
                themeVariables: {
                    '--wcm-z-index': '100',
                    '--wcm-background-color': '#F6EEDB',
                    '--wcm-accent-color': '#4A3A2A',
                    '--wcm-font-family': 'Georgia, serif',
                }
             },
        });
        await provider.connect();
        setupProvider(provider);
        addToast("WalletConnect connected successfully!", "success");
    } catch (error) {
        console.error("WalletConnect connection failed:", error);
        addToast("WalletConnect connection failed or was rejected.", "error");
        cleanupConnection();
    }
  };


  const handleImportJson = useCallback((data: string) => {
    let vc: VerifiableCredential;
    try {
      const decodedJson = decodeURIComponent(escape(atob(data)));
      vc = JSON.parse(decodedJson);
    } catch (e) {
      try {
        vc = JSON.parse(data);
      } catch (error) {
        console.error("Failed to import VC:", error);
        addToast(`Failed to import VC: The data is not valid Base64 or JSON.`, "error");
        return;
      }
    }

    try {
        if (!vc.proof || !vc.credentialSubject || !vc.issuer) {
            throw new Error("Invalid VC format.");
        }
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

  const handleJsonPaste = useCallback(() => {
    if (pastedJson.trim()) {
      handleImportJson(pastedJson);
    }
  }, [pastedJson, handleImportJson]);

  const handleTextareaKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleJsonPaste();
    }
  }, [handleJsonPaste]);

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
      <div className="bg-aged-paper p-8 flex flex-col items-center gap-4 border-2 border-double border-ledger-brown">
        <Spinner />
        <p>Loading Scanner...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="bg-aged-paper/80 p-2 border-2 border-double border-ledger-brown/50 mb-8">
        <div className="border border-ledger-brown/50 p-6">
            <h2 className="text-2xl font-bold font-serif text-ledger-brown mb-4">My Student Wallet</h2>
            {connectedAccount ? (
                <div className="bg-aged-paper/50 p-3 border border-ledger-brown/30 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ledger-brown/70">Your Digital Identifier (DID)</p>
                        <p className="text-sm text-ledger-brown truncate font-mono">
                            did:ethr:{connectedAccount}
                        </p>
                    </div>
                    <button onClick={handleCopyDid} className="ml-2 p-2 rounded-sm hover:bg-gold-trim/20 transition-colors flex-shrink-0" title="Copy DID">
                        <Copy className="w-5 h-5 text-ledger-brown/80" />
                    </button>
                    <button onClick={handleDisconnect} className="ml-2 text-xs font-semibold text-dusty-burgundy hover:underline">
                        Disconnect
                    </button>
                </div>
                </div>
            ) : (
                <div className="mb-6">
                    <button onClick={() => setIsConnectModalOpen(true)} className="w-full flex items-center justify-center py-3 px-4 rounded-sm font-bold text-aged-paper bg-ledger-brown hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-trim transition-all shadow-emboss active:shadow-emboss-active active:translate-y-px">
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Wallet
                    </button>
                </div>
            )}
            
            <div className="border-t-2 border-double border-ledger-brown/20 pt-6">
                <h3 className="text-lg font-semibold text-ledger-brown mb-4">Import New Credential</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label htmlFor="file-upload" className="group relative w-full flex flex-col items-center justify-center p-6 bg-transparent rounded-none border-2 border-dashed border-ledger-brown/40 hover:border-gold-trim cursor-pointer transition-colors">
                        <UploadCloud className="h-10 w-10 text-ledger-brown/50 group-hover:text-gold-trim transition-colors" />
                        <span className="mt-2 text-sm font-semibold text-ledger-brown/90">Upload from File</span>
                        <p className="text-xs text-ledger-brown/60">Import an encoded .txt file.</p>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".txt,text/plain" />
                    </label>

                    <button onClick={() => setIsScannerOpen(true)} className="group relative w-full flex flex-col items-center justify-center p-6 bg-transparent rounded-none border-2 border-dashed border-ledger-brown/40 hover:border-gold-trim cursor-pointer transition-colors">
                        <QrCodeScan className="h-10 w-10 text-ledger-brown/50 group-hover:text-gold-trim transition-colors" />
                        <span className="mt-2 text-sm font-semibold text-ledger-brown/90">Scan QR Code</span>
                        <p className="text-xs text-ledger-brown/60">Use your camera to import.</p>
                    </button>
                </div>
                <div className="mt-6">
                    <label htmlFor="vc-json" className="block text-sm font-semibold text-ledger-brown/80">Or Paste Encoded VC</label>
                    <textarea
                    id="vc-json"
                    rows={4}
                    className="font-mono text-xs mt-1 block w-full p-2 bg-transparent border border-ledger-brown/30 focus:outline-none focus:ring-1 focus:ring-gold-trim focus:border-gold-trim"
                    placeholder='Paste encoded VC and press Enter to import...'
                    value={pastedJson}
                    onChange={(e) => setPastedJson(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    ></textarea>
                    <button onClick={handleJsonPaste} className="mt-2 w-full md:w-auto flex justify-center py-2 px-4 rounded-sm font-semibold text-aged-paper bg-ledger-brown/80 hover:bg-ledger-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-trim transition-colors shadow-emboss active:shadow-emboss-active active:translate-y-px">
                    Import from Text
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold font-serif text-ledger-brown">My Credentials</h2>
            <div className="flex-grow border-b-2 border-double border-ledger-brown/20"></div>
        </div>
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
          <div className="text-center py-12 bg-aged-paper/80 border border-dashed border-ledger-brown/40">
            <h3 className="text-xl font-semibold text-ledger-brown">Your wallet is empty.</h3>
            <p className="text-ledger-brown/70 mt-2">Import a credential using one of the methods above.</p>
          </div>
        )}
      </div>
      
      {isConnectModalOpen && (
        <ConnectWalletModal 
            onClose={() => setIsConnectModalOpen(false)}
            onConnectMetaMask={connectMetaMask}
            onConnectWalletConnect={connectWalletConnect}
        />
      )}

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
            signer={signer}
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