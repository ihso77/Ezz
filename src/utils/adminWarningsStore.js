import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminWarningsFilePath = path.join(__dirname, '..', 'adminWarnings.json');

// التأكد من وجود الملف عند بدء التشغيل
if (!existsSync(adminWarningsFilePath)) {
    writeFileSync(adminWarningsFilePath, JSON.stringify({}));
}

export function readAdminWarnings() {
    try {
        const data = readFileSync(adminWarningsFilePath, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('خطأ في قراءة ملف adminWarnings.json:', error);
        return {};
    }
}

export function writeAdminWarnings(data) {
    try {
        writeFileSync(adminWarningsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('خطأ في كتابة ملف adminWarnings.json:', error);
    }
}

export function addAdminWarning(userId, reason, warnedBy) {
    const warnings = readAdminWarnings();
    if (!warnings[userId]) {
        warnings[userId] = {
            count: 0,
            warnings: []
        };
    }
    warnings[userId].count = (warnings[userId].count || 0) + 1;
    warnings[userId].warnings.push({
        reason: reason,
        warnedBy: warnedBy,
        timestamp: Date.now(),
        date: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })
    });
    writeAdminWarnings(warnings);
    return warnings[userId].count;
}

export function getAdminWarningCount(userId) {
    const warnings = readAdminWarnings();
    return warnings[userId]?.count || 0;
}

export function resetAdminWarnings(userId) {
    const warnings = readAdminWarnings();
    if (warnings[userId]) {
        delete warnings[userId];
        writeAdminWarnings(warnings);
    }
}

