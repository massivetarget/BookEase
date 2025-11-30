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

    static async exportDataToSheets(): Promise<{ success: boolean; error?: string }> {
        try {
            const tokens = await GoogleSignin.getTokens();
            const accessToken = tokens.accessToken;

            // 1. Get Data from DB
            if (Platform.OS === 'web') {
                return { success: false, error: 'Export not supported on web yet.' };
            }

            const { getDBConnection } = require('../database/Database');
            const db = await getDBConnection();

            const rows = await db.getAllAsync(`
                SELECT 
                    je.date, 
                    je.description as entry_description, 
                    je.reference, 
                    je.status, 
                    a.name as account_name, 
                    jl.description as line_description, 
                    jl.debit, 
                    jl.credit 
                FROM journal_entries je
                JOIN journal_lines jl ON je.id = jl.entryId
                JOIN accounts a ON jl.accountId = a.id
                ORDER BY je.date DESC
            `);

            // 2. Convert to CSV
            const header = 'Date,Entry Description,Reference,Status,Account,Line Description,Debit,Credit\n';
            const csvContent = rows.map((row: any) => {
                const escape = (text: string) => {
                    if (!text) return '';
                    return `"${text.replace(/"/g, '""')}"`; // Escape quotes
                };
                return [
                    row.date,
                    escape(row.entry_description),
                    escape(row.reference),
                    row.status,
                    escape(row.account_name),
                    escape(row.line_description),
                    row.debit,
                    row.credit
                ].join(',');
            }).join('\n');

            const fullCsv = header + csvContent;

            // 3. Upload to Drive as Google Sheet
            const metadata = {
                name: `BookEase Export ${new Date().toISOString().split('T')[0]}`,
                mimeType: 'application/vnd.google-apps.spreadsheet', // Convert to Sheet
            };

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

            if (metaData.error) {
                return { success: false, error: metaData.error.message };
            }

            const fileId = metaData.id;
            const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;

            const response = await fetch(uploadUrl, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'text/csv', // Uploading CSV content
                },
                body: fullCsv,
            });

            if (response.status !== 200) {
                return { success: false, error: `Export upload failed with status ${response.status}` };
            }

            return { success: true };

        } catch (error: any) {
            console.error('Export failed:', error);
            return { success: false, error: error.message || 'Unknown error occurred' };
        }
    }

    static async importDataFromSheets(): Promise<{ success: boolean; error?: string; count?: number }> {
        try {
            const tokens = await GoogleSignin.getTokens();
            const accessToken = tokens.accessToken;

            if (Platform.OS === 'web') {
                return { success: false, error: 'Import not supported on web yet.' };
            }

            // 1. Search for the export file
            // We look for the most recent file with "BookEase Export" in the name
            const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name contains 'BookEase Export' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&orderBy=createdTime desc&pageSize=1`;
            const searchResponse = await fetch(searchUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const searchData = await searchResponse.json();

            if (searchData.error) {
                return { success: false, error: searchData.error.message };
            }

            if (!searchData.files || searchData.files.length === 0) {
                return { success: false, error: 'No BookEase export file found in Drive.' };
            }

            const fileId = searchData.files[0].id;

            // 2. Download as CSV
            const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
            const response = await fetch(exportUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.status !== 200) {
                return { success: false, error: `Download failed with status ${response.status}` };
            }

            const csvText = await response.text();

            // 3. Parse CSV and Group Data
            const rows = csvText.split('\n');

            // Map Account Names to IDs
            const { getDBConnection } = require('../database/Database');
            const { SQLiteJournalRepository } = require('../repositories/sqlite/SQLiteJournalRepository.native');
            const db = await getDBConnection();
            const repo = new SQLiteJournalRepository(db);

            const accounts = await db.getAllAsync('SELECT id, name FROM accounts');
            const accountMap = new Map(accounts.map((a: any) => [a.name.toLowerCase().trim(), a.id]));

            const entriesToCreate = new Map<string, any>();

            // Skip header, start at 1
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row.trim()) continue;

                // Robust CSV Line Parser
                const cols: string[] = [];
                let buffer = '';
                let inQuote = false;

                for (let j = 0; j < row.length; j++) {
                    const c = row[j];
                    if (inQuote) {
                        if (c === '"') {
                            if (j + 1 < row.length && row[j + 1] === '"') {
                                buffer += '"'; // Handle escaped quote ""
                                j++; // Skip next quote
                            } else {
                                inQuote = false; // End of quoted field
                            }
                        } else {
                            buffer += c;
                        }
                    } else {
                        if (c === '"' && buffer.length === 0) {
                            inQuote = true; // Start of quoted field
                        } else if (c === ',') {
                            cols.push(buffer); // End of field
                            buffer = '';
                        } else {
                            buffer += c;
                        }
                    }
                }
                cols.push(buffer); // Push last field

                if (cols.length < 8) continue;

                // Trim fields just in case
                const cleanCols = cols.map(c => c.trim());
                const [dateStr, entryDesc, ref, status, accountName, lineDesc, debitStr, creditStr] = cleanCols;

                if (!dateStr) continue; // Skip empty lines or bad parsing

                // Robust Date Parsing
                let dateObj = new Date(dateStr);
                if (isNaN(dateObj.getTime())) {
                    // Try parsing DD/MM/YYYY or YYYY-MM-DD manually if auto-parse fails
                    // Assumption: Google Sheets often exports as YYYY-MM-DD or user's locale (e.g. DD/MM/YYYY)
                    // Let's try splitting by / or -
                    const parts = dateStr.split(/[-/]/);
                    if (parts.length === 3) {
                        // Check if first part is year (4 digits)
                        if (parts[0].length === 4) {
                            // YYYY-MM-DD
                            dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                        } else {
                            // Assume DD/MM/YYYY
                            dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                        }
                    }
                }

                if (isNaN(dateObj.getTime())) {
                    console.warn(`Invalid date format: ${dateStr}, skipping row.`);
                    continue;
                }

                const key = `${dateObj.toISOString()}|${entryDesc}|${ref}`; // Grouping key

                if (!entriesToCreate.has(key)) {
                    entriesToCreate.set(key, {
                        date: dateObj,
                        description: entryDesc,
                        reference: ref,
                        status: status,
                        lines: []
                    });
                }

                const normalizedAccountName = accountName.toLowerCase();
                const accountId = accountMap.get(normalizedAccountName);

                if (!accountId) {
                    console.warn(`Account not found for import: '${accountName}' (normalized: '${normalizedAccountName}')`);
                    // Optional: You could try to create the account here if you wanted to be advanced
                    continue;
                }

                entriesToCreate.get(key).lines.push({
                    accountId: accountId,
                    description: lineDesc,
                    debit: parseFloat(debitStr) || 0,
                    credit: parseFloat(creditStr) || 0
                });
            }

            // 4. Import to DB
            let importCount = 0;
            for (const entry of entriesToCreate.values()) {
                // Duplicate Check: Compare Date (YYYY-MM-DD), Description, and Reference
                // We use SQLite's date function to compare just the day part
                const dateStr = entry.date.toISOString().split('T')[0];

                const existing = await db.getFirstAsync(
                    `SELECT id FROM journal_entries 
                     WHERE date(date) = ? 
                     AND description = ? 
                     AND (reference = ? OR (? IS NULL AND reference IS NULL) OR (? = '' AND reference IS NULL))`,
                    [dateStr, entry.description, entry.reference, entry.reference, entry.reference]
                );

                if (!existing) {
                    await repo.create(entry);
                    importCount++;
                } else {
                    console.log(`Skipping duplicate: ${dateStr} - ${entry.description}`);
                }
            }

            return { success: true, count: importCount };

        } catch (error: any) {
            console.error('Import failed:', error);
            return { success: false, error: error.message || 'Unknown error occurred' };
        }
    }
}
