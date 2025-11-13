
export interface CredentialSubject {
  id: string; // Student's DID
  degree: {
    type: string;
    name: string;
    major: string;
  };
  issueDate: string;
  [key: string]: any; 
}

export interface Proof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  signature: string;
}

export interface Evidence {
  id: string;
  type: string[];
  name: string;
  cid?: string; // IPFS Content ID
}

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string; // University's DID
  issuanceDate: string;
  credentialSubject: CredentialSubject;
  evidence?: Evidence[];
  proof: Proof;
}
