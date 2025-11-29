export const getDBConnection = async () => {
    throw new Error("SQLite is not supported on Web");
};

export const createTables = async (db: any) => {
    throw new Error("SQLite is not supported on Web");
};

export const seedDatabase = async (db: any) => {
    throw new Error("SQLite is not supported on Web");
};

export const closeDatabase = async () => {
    return;
};
