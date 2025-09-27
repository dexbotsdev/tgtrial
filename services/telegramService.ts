import { TelegramClient, sessions } from 'telegram';

const SESSION_KEY = 'telegramSession';

interface LoginParams {
  apiId: number;
  apiHash: string;
  phoneNumber: () => Promise<string>;
  phoneCode: () => Promise<string>;
  password: () => Promise<string>;
  onError: (error: Error) => void;
}

// Store the client instance in the module scope
let client: TelegramClient | null = null;

/**
 * Attempts to connect to Telegram using a saved session from localStorage.
 * Requires apiId and apiHash to also be in localStorage.
 * @returns {Promise<boolean>} - True if connection is successful, false otherwise.
 */
export const checkSessionAndConnect = async (): Promise<boolean> => {
    const sessionString = localStorage.getItem(SESSION_KEY);
    const apiIdStr = localStorage.getItem('telegramApiId');
    const apiHash = localStorage.getItem('telegramApiHash');

    if (!sessionString || !apiIdStr || !apiHash) {
        return false;
    }

    // FIX: Use sessions.StringSession to avoid shadowing the type.
    const session = new sessions.StringSession(sessionString);
    const apiId = parseInt(apiIdStr, 10);
    
    client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
        useWSS: true, // Crucial for browser environments
    });

    try {
        await client.connect();
        if (await client.isUserAuthorized()) {
            console.log("Successfully connected from saved session.");
            return true;
        }
        // If not authorized, the session is likely invalid.
        await client.disconnect();
    } catch (error) {
        console.error("Failed to connect with saved session:", error);
    }
    
    // If we reach here, connection failed or user is not authorized
    localStorage.removeItem(SESSION_KEY); // Clean up bad session
    client = null;
    return false;
};

/**
 * Starts the interactive login flow for Telegram.
 * @param {LoginParams} params - The necessary callbacks and credentials for login.
 */
export const startLogin = async (params: LoginParams): Promise<void> => {
  // For the interactive login process, we always start with a fresh session.
  // The client will populate it upon successful authentication.
  // FIX: Use sessions.StringSession to avoid shadowing the type.
  const session = new sessions.StringSession(''); 
  
  client = new TelegramClient(session, params.apiId, params.apiHash, {
    connectionRetries: 5,
    useWSS: true, // This is crucial for running in a browser environment.
  });

  await client.start({
    phoneNumber: params.phoneNumber,
    password: params.password,
    phoneCode: params.phoneCode,
    onError: params.onError,
  });

  // Save session to local storage after successful login
  const sessionString = (client.session as sessions.StringSession).save();
  localStorage.setItem(SESSION_KEY, sessionString);

  console.log('You should now be connected.');
};

/**
 * Returns the current TelegramClient instance.
 * @returns {TelegramClient | null}
 */
export const getClient = (): TelegramClient | null => {
    return client;
}