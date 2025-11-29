import { GoogleSignin, statusCodes, User, SignInResponse } from '@react-native-google-signin/google-signin';
import { File, Directory, Paths } from 'expo-file-system/next';
import { Platform } from 'react-native';

// Configure Google Sign-In
// You need to replace these with your actual Client IDs from Google Cloud Console
const GOOGLE_WEB_CLIENT_ID = '1044415122690-eo4dori51amm3dhgulab4ehl2oufj389.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '1044415122690-lmfhjfineic0d9l2o4h682j93dal5oto.apps.googleusercontent.com';

GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.file'], // Request access to Drive
    offlineAccess: true,
});

const DB_NAME = 'bookease.db';
// Construct path using the new Paths API
const DB_DIR = new Directory(Paths.document + '/SQLite');
const DB_FILE = new File(DB_DIR, DB_NAME);
const MIME_TYPE = 'application/x-sqlite3';

export class BackupService {
    static async signIn(): Promise<User | null> {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            return response.data;
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress already');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available or outdated');
            } else {
                console.error('Some other error happened', error);
            }
            return null;
        }
    }

    static async signOut(): Promise<void> {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            console.error('Error signing out', error);
        }
    }

    static async isSignedIn(): Promise<boolean> {
        return await GoogleSignin.hasPreviousSignIn();
    }

    static async getCurrentUser(): Promise<User | null> {
        const signedIn = await GoogleSignin.hasPreviousSignIn();
        if (signedIn) {
            return await GoogleSignin.getCurrentUser();
        }
        return null;
    }

    static async backupDatabase(): Promise<boolean> {
        try {
            const tokens = await GoogleSignin.getTokens();
            const accessToken = tokens.accessToken;

            // 1. Check if the database file exists
            if (!DB_FILE.exists) {
                console.error('Database file not found at:', DB_FILE.uri);
                return false;
            }

            // 2. Search for existing backup file in Drive
            const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${DB_NAME}' and trashed=false&spaces=drive`;
            const searchResponse = await fetch(searchUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const searchData = await searchResponse.json();

            let fileId = null;
            if (searchData.files && searchData.files.length > 0) {
                fileId = searchData.files[0].id;
            }

            const metadata = {
                name: DB_NAME,
                mimeType: MIME_TYPE,
            };

            // Read file content as Uint8Array
            const fileContent = await DB_FILE.bytes();

            if (fileId) {
                // Update existing file
                const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
                const response = await fetch(updateUrl, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': MIME_TYPE,
                    },
                    body: fileContent,
                });

                return response.status === 200;

            } else {
                // Create new file
                // Step A: Create metadata
                const createMetaUrl = 'https://www.googleapis.com/drive/v3/files';
                const metaResponse = await fetch(createMetaUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(metadata),
                });
                const metaData = await metaResponse.json();
                const newFileId = metaData.id;

                if (!newFileId) return false;

                // Step B: Upload content
                const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${newFileId}?uploadType=media`;
                const response = await fetch(uploadUrl, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': MIME_TYPE,
                    },
                    body: fileContent,
                });

                return response.status === 200;
            }

        } catch (error) {
            console.error('Backup failed:', error);
            return false;
        }
    }

    static async restoreDatabase(): Promise<boolean> {
        try {
            const tokens = await GoogleSignin.getTokens();
            const accessToken = tokens.accessToken;

            // 1. Search for the file
            const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${DB_NAME}' and trashed=false&spaces=drive`;
            const searchResponse = await fetch(searchUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const searchData = await searchResponse.json();

            if (!searchData.files || searchData.files.length === 0) {
                console.error('No backup found');
                return false;
            }

            const fileId = searchData.files[0].id;

            // 2. Download file
            const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

            // Ensure directory exists
            if (!DB_DIR.exists) {
                DB_DIR.create();
            }

            const response = await fetch(downloadUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.status !== 200) {
                console.error('Failed to download file from Drive');
                return false;
            }

            const blob = await response.blob();
            // Convert blob to ArrayBuffer then to Uint8Array
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Write to file
            await DB_FILE.write(uint8Array);

            return true;

        } catch (error) {
            console.error('Restore failed:', error);
            return false;
        }
    }
}
