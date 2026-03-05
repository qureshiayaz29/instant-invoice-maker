import { get, set, del } from 'idb-keyval';

const LOGO_KEY = 'shop_logo_image';

/**
 * Saves a Blob/File to IndexedDB natively via idb-keyval.
 * @param {Blob | File} blob 
 */
export async function saveShopLogo(blob) {
    try {
        await set(LOGO_KEY, blob);
    } catch (error) {
        console.error('Failed to save logo to IndexedDB:', error);
    }
}

/**
 * Retrieves the stored Blob/File from IndexedDB.
 * @returns {Promise<Blob | undefined>}
 */
export async function getShopLogo() {
    try {
        return await get(LOGO_KEY);
    } catch (error) {
        console.error('Failed to get logo from IndexedDB:', error);
        return undefined;
    }
}

/**
 * Deletes the stored Blob/File from IndexedDB.
 */
export async function deleteShopLogo() {
    try {
        await del(LOGO_KEY);
    } catch (error) {
        console.error('Failed to delete logo from IndexedDB:', error);
    }
}
