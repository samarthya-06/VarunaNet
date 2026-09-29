import { openDB } from 'idb';

const DB_NAME = 'varunanet-db';
const STORE_NAME = 'offline-reports';

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const offlineService = {
    saveReport: async (reportData) => {
        const db = await initDB();
        await db.add(STORE_NAME, {
            ...reportData,
            createdAt: new Date().toISOString(),
            synced: false
        });
        console.log('Report saved offline');
    },

    getAllReports: async () => {
        const db = await initDB();
        return db.getAll(STORE_NAME);
    },

    clearReports: async (ids) => {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await Promise.all(ids.map(id => tx.store.delete(id)));
        await tx.done;
    }
};
