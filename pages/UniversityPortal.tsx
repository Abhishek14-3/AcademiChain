import React, { useState, useEffect, useCallback } from 'react';
import type { VerifiableCredential } from '../types';
import { useToast } from '../contexts/ToastContext';
import { getUniversityWallet, signVC, computeCredentialHash } from '../utils/crypto';
import { uploadToIPFS } from '../utils/ipfsMock';
import { contractService } from '../services/contractService';
import Spinner from '../components/Spinner';
import { FileText, UploadCloud, QrCode, Copy, Download } from '../components/icons/Icons';
import QRCodeModal from '../components/QRCodeModal';

const UniversityPortal: React.FC = () => {
  const [studentDid, setStudentDid] = useState('');
  const [degreeType, setDegreeType] = useState('Bachelor of Science');
  const [degreeName, setDegreeName] = useState('Computer Science');
  const [major, setMajor] = useState('Software Engineering');
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [issuedVC, setIssuedVC] = useState<VerifiableCredential | null>(null);
  const [encodedVC, setEncodedVC] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAnchor, setShouldAnchor] = useState(true);
  const [universityDidDisplay, setUniversityDidDisplay] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const { addToast } = useToast();

  // Register the university's DID on component mount (for demo purposes)
  useEffect(() => {
    const initPortal = async () => {
      try {
        const universityWallet = getUniversityWallet();
        const universityDid = `did:ethr:${universityWallet.address}`;
        setUniversityDidDisplay(universityDid);
        const existingController = await contractService.getController(universityDid);
        if (!existingController) {
          await contractService.registerDID(universityDid, universityWallet.address);
          addToast("University DID registered on-chain (mock).", 'info');
        }
      } catch (error) {
        console.error("Error initializing university DID:", error);
        addToast("Could not initialize university wallet. Please refresh the page.", "error");
      }
    };
    
    initPortal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTranscriptFile(e.target.files[0]);
    }
  };

  const handleIssueCredential = useCallback(async () => {
    if (!studentDid || !degreeType || !degreeName || !major) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    setIssuedVC(null);
    setEncodedVC('');

    try {
      let evidence;
      if (transcriptFile) {
        const { cid } = await uploadToIPFS(transcriptFile);
        evidence = [{
          id: `ipfs://${cid}`,
          type: ['Transcript'],
          name: transcriptFile.name,
          cid: cid
        }];
        addToast('Transcript uploaded to IPFS (mock).', 'success');
      }

      const universityWallet = getUniversityWallet();
      const universityDid = `did:ethr:${universityWallet.address}`;
      const issuanceDate = new Date().toISOString();
      
      const vcToSign: Omit<VerifiableCredential, 'proof'> = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: `urn:uuid:${crypto.randomUUID()}`,
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        issuer: universityDid,
        issuanceDate: issuanceDate,
        credentialSubject: {
          id: studentDid,
          degree: {
            type: degreeType,
            name: degreeName,
            major: major,
          },
          issueDate: issuanceDate,
        },
        ...(evidence && { evidence }),
      };

      const proof = await signVC(vcToSign, universityWallet);
      addToast('Credential signed successfully.', 'success');

      const finalVC: VerifiableCredential = { ...vcToSign, proof };
      setIssuedVC(finalVC);
      setEncodedVC(btoa(unescape(encodeURIComponent(JSON.stringify(finalVC)))));

      if (shouldAnchor) {
        const credentialHash = computeCredentialHash(finalVC);
        const { success, txHash } = await contractService.anchorCredential(credentialHash, universityWallet.address);
        if (success) {
          addToast(`Credential hash anchored on-chain (mock). Tx: ${txHash.slice(0, 10)}...`, 'success');
        } else {
          addToast('Failed to anchor credential hash.', 'error');
        }
      }

    } catch (error) {
      console.error('Error issuing credential:', error);
      addToast('An error occurred while issuing the credential.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [studentDid, degreeType, degreeName, major, transcriptFile, shouldAnchor, addToast]);

  const handleCopyEncodedVC = useCallback(() => {
    if (encodedVC) {
      navigator.clipboard.writeText(encodedVC).then(() => {
        addToast("Encoded VC copied to clipboard!", "success");
      }).catch(err => {
        addToast("Failed to copy.", "error");
        console.error(err);
      });
    }
  }, [encodedVC, addToast]);

  const handleDownloadEncodedVC = useCallback(() => {
    if (encodedVC) {
      const blob = new Blob([encodedVC], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const vcIdPart = issuedVC?.id.slice(-8) || 'credential';
      a.download = `credential-${vcIdPart}-encoded.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("Encoded VC download started.", "success");
    }
  }, [encodedVC, issuedVC, addToast]);

  const inputStyles = "font-mono text-sm mt-1 block w-full py-2 bg-transparent border-0 border-b-2 border-ledger-brown/30 focus:outline-none focus:ring-0 focus:border-gold-trim";

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-aged-paper/80 p-2 border-2 border-double border-ledger-brown/50">
          <div className="p-4 border border-ledger-brown/50">
            <div className="mb-6 border-b-2 border-gold-trim pb-3">
                <h2 className="text-2xl font-bold font-serif text-ledger-brown">Issue New Credential</h2>
                {universityDidDisplay && <p className="text-xs text-ledger-brown/70 mt-1 break-all font-mono">University DID: {universityDidDisplay}</p>}
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="studentDid" className="block text-sm font-semibold text-ledger-brown/80">Student DID</label>
                <input type="text" id="studentDid" value={studentDid} onChange={e => setStudentDid(e.target.value)} placeholder="did:ethr:0x..." className={inputStyles} />
              </div>
              <div>
                <label htmlFor="degreeType" className="block text-sm font-semibold text-ledger-brown/80">Degree Type</label>
                <input type="text" id="degreeType" value={degreeType} onChange={e => setDegreeType(e.target.value)} className={inputStyles} />
              </div>
              <div>
                <label htmlFor="degreeName" className="block text-sm font-semibold text-ledger-brown/80">Degree Name</label>
                <input type="text" id="degreeName" value={degreeName} onChange={e => setDegreeName(e.target.value)} className={inputStyles} />
              </div>
              <div>
                <label htmlFor="major" className="block text-sm font-semibold text-ledger-brown/80">Major</label>
                <input type="text" id="major" value={major} onChange={e => setMajor(e.target.value)} className={inputStyles} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ledger-brown/80">Optional Transcript (PDF)</label>
                <div className="mt-2 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-ledger-brown/30 border-dashed">
                  <div className="space-y-1 text-center">
                    {transcriptFile ? (
                        <div className='flex items-center text-sm text-ledger-brown'>
                            <FileText className="w-8 h-8 mr-2" />
                            <span className="font-mono">{transcriptFile.name}</span>
                        </div>
                    ) : (
                        <>
                            <UploadCloud className="mx-auto h-12 w-12 text-ledger-brown/50" />
                            <div className="flex text-sm text-ledger-brown/80">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent font-semibold text-gold-trim hover:text-ledger-brown focus-within:outline-none">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf"/>
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-ledger-brown/60">PDF up to 10MB</p>
                        </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="anchor" name="anchor" type="checkbox" checked={shouldAnchor} onChange={(e) => setShouldAnchor(e.target.checked)} className="focus:ring-gold-trim h-4 w-4 text-ledger-brown border-ledger-brown/50 rounded-sm bg-aged-paper" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="anchor" className="font-semibold text-ledger-brown/80">Anchor credential on-chain (mock)</label>
                    <p className="text-ledger-brown/70">Adds a public, timestamped proof of existence.</p>
                  </div>
                </div>
              <button onClick={handleIssueCredential} disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-sm font-bold text-aged-paper bg-ledger-brown hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-trim disabled:bg-ledger-brown/50 disabled:cursor-not-allowed transition-all shadow-emboss active:shadow-emboss-active active:translate-y-px">
                {isLoading ? <><Spinner /> <span className="ml-2">Issuing...</span></> : 'Sign & Issue Credential'}
              </button>
            </div>
          </div>
        </div>
        <div className="bg-ledger-brown/90 text-aged-paper p-2 border-2 border-double border-gold-trim/50 flex flex-col">
          <div className="p-4 border border-gold-trim/30 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-gold-trim/30 pb-2">
              <h3 className="text-xl font-bold font-serif text-gold-trim">Issued Credential (Base64)</h3>
              {issuedVC && (
                <div className="flex items-center gap-1">
                  <button onClick={handleCopyEncodedVC} className="p-2 rounded-sm text-aged-paper/70 hover:bg-gold-trim/20 hover:text-aged-paper" title="Copy Encoded Credential"><Copy /></button>
                  <button onClick={handleDownloadEncodedVC} className="p-2 rounded-sm text-aged-paper/70 hover:bg-gold-trim/20 hover:text-aged-paper" title="Download Encoded Credential"><Download /></button>
                  <button onClick={() => setIsQrModalOpen(true)} className="p-2 rounded-sm text-aged-paper/70 hover:bg-gold-trim/20 hover:text-aged-paper" title="Show QR Code"><QrCode /></button>
                </div>
              )}
            </div>
            <div className="overflow-auto flex-grow">
              {encodedVC ? (
                <textarea
                  readOnly
                  className="w-full h-full p-2 bg-transparent border-none resize-none text-aged-paper/80 focus:ring-0 font-mono text-xs leading-relaxed"
                  value={encodedVC}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-aged-paper/50">
                  <p>Awaiting credential issuance...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isQrModalOpen && issuedVC && (
          <QRCodeModal
              value={btoa(unescape(encodeURIComponent(JSON.stringify(issuedVC))))}
              onClose={() => setIsQrModalOpen(false)}
              title="Issued Credential"
          />
      )}
    </>
  );
};

export default UniversityPortal;