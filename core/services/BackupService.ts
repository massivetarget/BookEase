import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import * as FileSystem from 'expo-file-system';
import { documentDirectory as legacyDocumentDirectory } from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { closeDatabase } from '../database/Database';

const { File, Directory } = FileSystem as any;

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

// Use legacy documentDirectory to ensure we get the correct path
const docDir = legacyDocumentDirectory;

// Construct path using the new API
const DB_DIR_PATH = (docDir || '') + 'SQLite';
const DB_DIR = new Directory(DB_DIR_PATH);
const DB_FILE = new File(DB_DIR_PATH + '/' + DB_NAME);
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

    static async backupDatabase(): Promise<{ success: boolean; error?: string }> {
        try {
            const tokens = await GoogleSignin.getTokens();
            const accessToken = tokens.accessToken;

            // 1. Check if the database file exists
            if (!DB_FILE.exists) {
                return { success: false, error: 'Local database file not found.' };
            }

            // 2. Search for existing backup file in Drive
            const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${DB_NAME}' and trashed=false&spaces=drive`;
            const searchResponse = await fetch(searchUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const searchData = await searchResponse.json();

            if (searchData.error) {
                console.error('Drive API Error:', searchData.error);
                return { success: false, error: searchData.error.message };
            }

            let fileId = null;
            if (searchData.files && searchData.files.length > 0) {
                fileId = searchData.files[0].id;
            }

            // Read file content
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

                if (response.status !== 200) {
                    const errorText = await response.text();
                    console.error('Update failed:', errorText);
                    return { success: false, error: `Upload failed with status ${response.status}` };
                }

                return { success: true };

            } else {
                // Create new file
                // Step A: Create metadata
                const createMetaUrl = 'https://www.googleapis.com/drive/v3/files';
                const metadata = {
                    name: DB_NAME,
                    mimeType: MIME_TYPE,
                };

                const metaResponse = await fetch(createMetaUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(metadata),
                });
                const metaData = await metaResponse.json();

                if (metaData.error) {
                    console.error('Metadata Error:', metaData.error);
                    return { success: false, error: metaData.error.message };
                }

                const newFileId = metaData.id;

                if (!newFileId) {
                    return { success: false, error: 'Failed to create file metadata.' };
                }

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

                if (response.status !== 200) {
                    const errorText = await response.text();
                    console.error('Upload failed:', errorText);
                    return { success: false, error: `Upload failed with status ${response.status}` };
                }

                return { success: true };
            }

        } catch (error: any) {
            console.error('Backup failed:', error);
            return { success: false, error: error.message || 'Unknown error occurred' };
        }
    }

    static async restoreDatabase(): Promise<{ success: boolean; error?: string }> {
        try {
            const tokens = await GoogleSignin.getTokens();
            const accessToken = tokens.accessToken;

            // 1. Search for the file
            const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${DB_NAME}' and trashed=false&spaces=drive`;
            const searchResponse = await fetch(searchUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const searchData = await searchResponse.json();

            if (searchData.error) {
                return { success: false, error: searchData.error.message };
            }

            if (!searchData.files || searchData.files.length === 0) {
                return { success: false, error: 'No backup found in Google Drive.' };
            }

            const fileId = searchData.files[0].id;

            // 2. Download file
            const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

            // Ensure directory exists
            if (!DB_DIR.exists) {
                DB_DIR.create();
            }

            // Close DB before overwriting
            await closeDatabase();

            const response = await fetch(downloadUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.status !== 200) {
                console.error('Failed to download file from Drive');
                return { success: false, error: `Download failed with status ${response.status}` };
            }

            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Write to file
            await DB_FILE.write(uint8Array);

            return { success: true };

        } catch (error: any) {
            console.error('Restore failed:', error);
            return { success: false, error: error.message || 'Unknown error occurred' };
        }
    }
}
