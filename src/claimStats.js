import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const STATS_FILE = path.resolve(process.cwd(), 'save.json');

/**
 * يقرأ إحصائيات الاستلام من ملف save.json.
 * @returns {Promise<Object>} كائن يحتوي على إحصائيات الاستلام.
 */
async function readClaimStats() {
    try {
        const data = await readFile(STATS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // الملف غير موجود، نرجع كائن فارغ
            return {};
        }
        console.error('Error reading claim stats:', error);
        return {};
    }
}

/**
 * يكتب إحصائيات الاستلام إلى ملف save.json.
 * @param {Object} stats كائن إحصائيات الاستلام.
 */
async function writeClaimStats(stats) {
    try {
        await writeFile(STATS_FILE, JSON.stringify(stats, null, 4), 'utf8');
    } catch (error) {
        console.error('Error writing claim stats:', error);
    }
}

/**
 * يزيد عدد استلامات مستخدم معين ويحفظها.
 * @param {string} userId آيدي المستخدم.
 * @returns {Promise<number>} العدد الإجمالي للاستلامات لهذا المستخدم.
 */
export async function incrementClaimCount(userId) {
    const stats = await readClaimStats();
    
    if (!stats.claims) {
        stats.claims = {};
    }
    
    stats.claims[userId] = (stats.claims[userId] || 0) + 1;
    
    await writeClaimStats(stats);
    
    return stats.claims[userId];
}

/**
 * يحصل على عدد استلامات مستخدم معين.
 * @param {string} userId آيدي المستخدم.
 * @returns {Promise<number>} العدد الإجمالي للاستلامات لهذا المستخدم.
 */
export async function getClaimCount(userId) {
    const stats = await readClaimStats();
    return stats.claims?.[userId] || 0;
}

/**
 * يصفر عدد استلامات مستخدم معين ويحفظها.
 * @param {string} userId آيدي المستخدم.
 * @returns {Promise<void>}
 */
export async function resetClaimCount(userId) {
    const stats = await readClaimStats();
    
    if (!stats.claims) {
        stats.claims = {};
    }
    
    stats.claims[userId] = 0;
    
    await writeClaimStats(stats);
}
