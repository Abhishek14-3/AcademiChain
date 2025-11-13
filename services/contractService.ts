
// This is a mock service that simulates interactions with the DIDRegistry smart contract.
// It uses localStorage to persist state across sessions for a more realistic demo.

const DID_REGISTRY_KEY = 'academiChain_didRegistry';
const REVOCATION_LIST_KEY = 'academiChain_revocationList';

interface DidRegistry {
  [did: string]: {
    controller: string;
    metadataCID?: string;
  };
}

// Initialize mock storage if it doesn't exist
const getDidRegistry = (): DidRegistry => {
  const registry = localStorage.getItem(DID_REGISTRY_KEY);
  return registry ? JSON.parse(registry) : {};
};

const getRevocationList = (): Record<string, boolean> => {
    const list = localStorage.getItem(REVOCATION_LIST_KEY);
    return list ? JSON.parse(list) : {};
}

const saveDidRegistry = (registry: DidRegistry) => {
    localStorage.setItem(DID_REGISTRY_KEY, JSON.stringify(registry));
}

const saveRevocationList = (list: Record<string, boolean>) => {
    localStorage.setItem(REVOCATION_LIST_KEY, JSON.stringify(list));
}

export const contractService = {
  /**
   * Simulates registerDID function.
   */
  async registerDID(did: string, controller: string, metadataCID?: string): Promise<{ success: boolean; txHash: string }> {
    console.log(`[Contract Mock] Registering DID: ${did} for controller: ${controller}`);
    await new Promise(res => setTimeout(res, 300)); // Simulate transaction delay
    
    const registry = getDidRegistry();
    if (registry[did]) {
      console.warn(`[Contract Mock] DID ${did} already registered.`);
      // In a real contract this might throw an error. For the demo, we'll allow updates.
    }
    
    registry[did] = { controller, metadataCID };
    saveDidRegistry(registry);
    
    return { success: true, txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` };
  },

  /**
   * Simulates getController function.
   */
  async getController(did: string): Promise<string | null> {
    console.log(`[Contract Mock] Getting controller for DID: ${did}`);
    await new Promise(res => setTimeout(res, 100));
    
    const registry = getDidRegistry();
    return registry[did]?.controller || null;
  },

  /**
   * Simulates anchorCredential function.
   * In this mock, we don't need to do anything as the existence of the hash isn't checked, only its revocation status.
   */
  async anchorCredential(hash: string, fromController: string): Promise<{ success: boolean; txHash: string }> {
    console.log(`[Contract Mock] Anchoring credential hash: ${hash} from controller ${fromController}`);
    // Here we could check if fromController matches a registered DID, but for simplicity we'll skip.
    await new Promise(res => setTimeout(res, 300));
    return { success: true, txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` };
  },

  /**
   * Simulates revokeCredential function.
   */
  async revokeCredential(hash: string, fromController: string): Promise<{ success: boolean; txHash: string }> {
    console.log(`[Contract Mock] Revoking credential hash: ${hash} from controller ${fromController}`);
    // Again, skipping controller check for simplicity.
    await new Promise(res => setTimeout(res, 300));
    
    const revocationList = getRevocationList();
    revocationList[hash] = true;
    saveRevocationList(revocationList);

    return { success: true, txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` };
  },

  /**
   * Simulates isRevoked view function.
   */
  async isRevoked(hash: string): Promise<boolean> {
    console.log(`[Contract Mock] Checking revocation status for hash: ${hash}`);
    await new Promise(res => setTimeout(res, 100));
    
    const revocationList = getRevocationList();
    return !!revocationList[hash];
  },
};
