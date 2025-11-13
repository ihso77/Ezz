import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// هذه الدالة تجمع بيانات الأوامر من مجلد 'commands'
async function collectCommands() {
    const commands = [];
    // تأكد من أن المسار إلى مجلد الأوامر صحيح
    // إذا كان registerCommands.js داخل src، فإن __dirname هو src
    // لذا يجب أن يكون مجلد الأوامر بجانب هذا الملف أو تعدل المسار
    const commandsPath = path.join(__dirname, 'commands'); 
    
    let commandFiles = [];
    try {
        commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    } catch (err) {
        console.error('خطأ في قراءة مجلد الأوامر:', err);
        return commands; // إرجاع قائمة فارغة إذا لم يتم العثور على المجلد
    }

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const mod = await import(pathToFileURL(filePath).href);
            if (mod.default?.data) {
                commands.push(mod.default.data.toJSON());
            } else {
                console.warn(`[تحذير] الأمر في ${filePath} لا يحتوي على خاصية "data".`);
            }
        } catch (error) {
            console.error(`[خطأ] فشل في تحميل الأمر من ${filePath}:`, error);
        }
    }
    return commands;
}

(async () => {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID; // اختياري: لتسجيل الأوامر في سيرفر معين فقط

    if (!token || !clientId) {
        console.error('يرجى ضبط DISCORD_TOKEN و CLIENT_ID في ملف .env');
        process.exit(1);
    }

    // استدعاء الدالة لجمع الأوامر
    const commands = await collectCommands();

    if (commands.length === 0) {
        console.log('لم يتم العثور على أي أوامر لتسجيلها. تأكد من وجود ملفات أوامر صالحة في مجلد "commands".');
        return;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log(`بدأ تحديث ${commands.length} من أوامر التطبيق (/).`);

        // استخدام متغير 'commands' الذي يحتوي على بيانات الأوامر
        if (guildId) {
            // تسجيل الأوامر في سيرفر معين (أسرع للتطوير والاختبار)
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
            console.log(`✅ تم تسجيل الأوامر بنجاح في السيرفر (ID: ${guildId}).`);
        } else {
            // تسجيل الأوامر بشكل عام (قد يستغرق حتى ساعة ليظهر في جميع السيرفرات)
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
            console.log('✅ تم تسجيل الأوامر بنجاح على مستوى جميع السيرفرات.');
        }

    } catch (error) {
        console.error('حدث خطأ أثناء تسجيل الأوامر:', error);
    }
})();
