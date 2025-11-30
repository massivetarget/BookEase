export class BackupService {
    static async signIn(): Promise<any> {
        console.warn("Google Sign-In is not supported on Web/Desktop yet.");
        return null;
    }

    static async signOut(): Promise<void> {
        console.warn("Google Sign-In is not supported on Web/Desktop yet.");
    }

    static async isSignedIn(): Promise<boolean> {
        return false;
    }

    static async getCurrentUser(): Promise<any> {
        return null;
    }

    static async backupDatabase(): Promise<{ success: boolean; error?: string }> {
        return { success: false, error: "Backup is not supported on Web/Desktop yet." };
    }

    static async restoreDatabase(): Promise<{ success: boolean; error?: string }> {
        return { success: false, error: "Restore is not supported on Web/Desktop yet." };
    }

    static async exportDataToSheets(): Promise<{ success: boolean; error?: string }> {
        return { success: false, error: "Export is not supported on Web/Desktop yet." };
    }

    static async importDataFromSheets(): Promise<{ success: boolean; error?: string; count?: number }> {
        return { success: false, error: "Import is not supported on Web/Desktop yet." };
    }
}
