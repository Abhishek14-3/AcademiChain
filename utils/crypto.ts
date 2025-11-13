import { ethers } from 'ethers';
import type { VerifiableCredential, CredentialSubject, Proof } from '../types';

// Persistent wallet for the university, stored in localStorage
let universityWallet: any = null; 

export function getUniversityWallet() {
    if (universityWallet) {
        return universityWallet;
    }
    
    const universityPrivateKey = localStorage.getItem('university_private_key');
    if (universityPrivateKey) {
        universityWallet = new ethers.Wallet(universityPrivateKey);
    } else {
        universityWallet = ethers.Wallet.createRandom();
        localStorage.setItem('university_private_key', universityWallet.privateKey);
        console.log(`New University Wallet created. Address: ${universityWallet.address}`);
        console.log(`University PRIVATE KEY (for demo only, stored in localStorage): ${universityWallet.privateKey}`);
    }
    return universityWallet;
}

// Persistent wallet for the student, stored in localStorage
let studentWallet: any = null;

export function getStudentWallet() {
    if (studentWallet) {
        return studentWallet;
    }

    const studentPrivateKey = localStorage.getItem('student_private_key');
    if (studentPrivateKey) {
        studentWallet = new ethers.Wallet(studentPrivateKey);
    } else {
        studentWallet = ethers.Wallet.createRandom();
        localStorage.setItem('student_private_key', studentWallet.privateKey);
        console.log(`New Student Wallet created. Address: ${studentWallet.address}`);
        console.log(`Student PRIVATE KEY (for demo only, stored in localStorage): ${studentWallet.privateKey}`);
    }
    return studentWallet;
}


/**
 * Creates the canonical form of a VC by removing the proof.
 * This is what gets hashed and signed.
 */
function createCanonicalVC(vc: Omit<VerifiableCredential, 'proof'>): string {
    // Make a deep copy to avoid modifying the original object
    const canonicalVC = JSON.parse(JSON.stringify(vc));
    // Ensure properties are ordered consistently for hashing
    return JSON.stringify(canonicalVC, Object.keys(canonicalVC).sort());
}

/**
 * Computes the keccak256 hash of a Verifiable Credential.
 */
export function computeCredentialHash(vc: VerifiableCredential): string {
  const vcToHash: Omit<VerifiableCredential, 'proof'> = {
    '@context': vc['@context'],
    id: vc.id,
    type: vc.type,
    issuer: vc.issuer,
    issuanceDate: vc.issuanceDate,
    credentialSubject: vc.credentialSubject,
    ...(vc.evidence && { evidence: vc.evidence }),
  };
  const canonicalVC = createCanonicalVC(vcToHash);
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(canonicalVC));
}


/**
 * Signs a Verifiable Credential using the provided wallet.
 */
export async function signVC(vc: Omit<VerifiableCredential, 'proof'>, wallet: any): Promise<Proof> {
  const vcToSign: Omit<VerifiableCredential, 'proof'> = { ...vc };
  const canonicalVC = createCanonicalVC(vcToSign);
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(canonicalVC));
  
  // The signature is on the hash of the canonical VC
  const signature = await wallet.signMessage(ethers.utils.arrayify(hash));

  const proof: Proof = {
    type: 'EcdsaSecp256k1Signature2019',
    created: new Date().toISOString(),
    proofPurpose: 'assertionMethod',
    verificationMethod: `did:ethr:${wallet.address}#controller`,
    signature: signature,
  };
  return proof;
}

/**
 * Verifies the signature of a Verifiable Credential.
 */
export async function verifyVCSignature(vc: VerifiableCredential): Promise<boolean> {
  try {
    const { proof, ...vcWithoutProof } = vc;
    if (!proof || !proof.signature) {
      console.error("VC has no proof or signature.");
      return false;
    }

    const canonicalVC = createCanonicalVC(vcWithoutProof);
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(canonicalVC));
    
    const recoveredAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(hash), proof.signature);

    const issuerAddress = proof.verificationMethod.split(':')[2].split('#')[0];

    return recoveredAddress.toLowerCase() === issuerAddress.toLowerCase();
  } catch (error) {
    console.error("Error during signature verification:", error);
    return false;
  }
}