
// --- SECURITY WARNING ---
// The API keys below are exposed in the frontend code.
// This is EXTREMELY INSECURE and should NEVER be done in a production application.
// In a real-world scenario, this logic MUST be moved to a backend server to protect your credentials.
const PINATA_API_KEY = 'd5309cea3cd58039aa2d';
const PINATA_API_SECRET = 'REPLACE_WITH_YOUR_PINATA_API_SECRET'; // <-- Replace this with your actual secret!

/**
 * Uploads a file or JSON object to Pinata. Falls back to a mock if API keys are not set.
 * @param data The file or object to "upload".
 * @returns A promise that resolves to an object containing the IPFS CID.
 */
export async function uploadToIPFS(data: File | object): Promise<{ cid: string }> {
  if (PINATA_API_KEY === 'd5309cea3cd58039aa2d' && PINATA_API_SECRET === 'REPLACE_WITH_YOUR_PINATA_API_SECRET') {
    console.warn("Pinata API Secret is not configured in utils/ipfsMock.ts. Falling back to mock IPFS.");
    return fallbackToMock();
  }

  const formData = new FormData();
  let fileToUpload: Blob;
  let fileName: string;

  if (data instanceof File) {
    fileToUpload = data;
    fileName = data.name;
  } else {
    fileToUpload = new Blob([JSON.stringify(data)], { type: 'application/json' });
    fileName = 'data.json';
  }

  formData.append('file', fileToUpload, fileName);
  
  const metadata = JSON.stringify({ name: fileName });
  formData.append('pinataMetadata', metadata);
  
  const options = JSON.stringify({ cidVersion: 0 });
  formData.append('pinataOptions', options);

  try {
    console.log('Uploading to Pinata...');
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata API Error: ${errorData.error?.reason || response.statusText}`);
    }

    const result = await response.json();
    console.log('Successfully uploaded to Pinata. CID:', result.IpfsHash);
    return { cid: result.IpfsHash };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    console.warn('Pinata upload failed. Falling back to mock IPFS implementation.');
    return fallbackToMock();
  }
}

/**
 * Simulates uploading a file or JSON object to IPFS.
 * This is used as a fallback if the Pinata upload fails.
 */
async function fallbackToMock(): Promise<{ cid: string }> {
  console.log('Simulating IPFS upload...');
  await new Promise(resolve => setTimeout(resolve, 500));
  const randomHex = [...Array(46)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  const pseudoCID = `bafybeig${randomHex}`;
  console.log('Generated pseudo-CID:', pseudoCID);
  return { cid: pseudoCID };
}
