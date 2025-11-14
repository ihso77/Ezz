import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection, Events, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, REST, Routes } from 'discord.js';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { addNickname } from './utils/nicknameStore.js';

// --- إعدادات المسارات الأساسية ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =================================================================================
// --- وظائف إدارة ملف claim.json ---
// =================================================================================

const claimFilePath = path.join(__dirname, 'claim.json');

// التأكد من وجود ملف claim.json عند بدء التشغيل
if (!existsSync(claimFilePath)) {
    console.log('[إعداد] ملف claim.json غير موجود، سيتم إنشاؤه.');
    writeFileSync(claimFilePath, JSON.stringify({}));
}

function readClaims() {
    try {
        const data = readFileSync(claimFilePath, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('خطأ في قراءة ملف claim.json:', error);
        return {};
    }
}

function writeClaims(data) {
    try {
        writeFileSync(claimFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('خطأ في كتابة ملف claim.json:', error);
    }
}

function incrementClaimCount(adminId) {
    const claims = readClaims();
    claims[adminId] = (claims[adminId] || 0) + 1;
    writeClaims(claims);
    return claims[adminId];
}

// =================================================================================
// --- نهاية وظائف إدارة ملف claim.json ---
// =================================================================================

// =================================================================================
// --- إعدادات الردود التلقائية ---
// =================================================================================

// الرومات التي سيرسل فيها البوت رسالة تلقائية عند أي رسالة
const AUTO_MESSAGE_CHANNELS = [
    '1434534543133507614',
    '1397022565096095836',
    '1397094356900380702',
    '1397095082443800676',
    '1435008789739733232'
];

// صورة الرسالة التلقائية
const AUTO_MESSAGE_IMAGE = 'https://media.discordapp.net/attachments/1397095407745499196/1429784555220369408/standard_1.gif?ex=6917b2e2&is=69166162&hm=d9ac58c76a495fe426dad08596c359de085cea4ddc847a8c258611602f38d9b5&width=2797&height=163&';

// الرول المسموح له باستخدام الردود التلقائية
const AUTO_REPLY_ROLE_ID = '1418942792121585724';

// رسالة الرد على كلمة "فراغ"
const FARAGH_REPLY = `.✦  　　　　　　　　　　.　　　　　　　　　✦ 　　　　. 　　　　　　　　　✦ 　　　　　❀ ‏Ezz ❀　　       　✦    　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦ 　   　　　,　　　　　　　　　*　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　　　　　　　　　.　　　　　 　　 　　　.　　　　　　　　　✦ 　　　　 　           　　　　　　　　　　　　　　❀ ‏Ezz ❀　　　　　˚　　　✦  　   　　　　,　　　　　　　　　　　       　    　　　　　　　　　　　　　　　　.　　　✦   　　    　　　　　 　　　　　.　　　　　　　　　　　　　.　　　　　　　　　　　　　*　　　　　　　　　. 　　　　　　　　　　.　　　　　　✦ 　　　　　　　❀ ‏Ezz ❀ ✦  　　　　　　　　　　　　　　　　       　   　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦  　   　　　,　　　　　　　　　*　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　✦ 　　　　　　　　.　　　　　 　　 　　　.　　❀ ‏Ezz ❀　　　　　　　　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　　 　✦    　　　　,　　　　　　　　✦ 　　　       　    　　　　　　　　　　　　　　　　.　　　  　　 ✦    　　　　　 　　　　　.　　　　　　　　　　　　　.　　　　　　　　　　　　　　　* 　　   　　　　　 ✦　　　　　　　　　　. 　　　　　　　　　　.　　　　　✦ 　　　　　　　　.❀ ‏Ezz ❀ 　　　　　　　　　　　　　　　　       　   　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　       ✦  　   　　　,　　　　　　　　　❀ ‏Ezz ❀　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　　　　　　　　　.　　　　　 　　 　　　.　　　　　　　✦ 　　　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　　 　   　　　　,　　　　　　　　　　　       　    　　　　　　　　　　　　　　　　.　　　  　　    　　　　　 　　　　　.　　　　　　　　　　　　❀ ‏ ❀ ‏Ezz　.　　　　　　　　　　　　　　　* 　　   　　　　　 ✦*　　　　　　　　　.✦  　　　　　　  　　　　.　　　　　　　　　✦ 　　　　. 　　　　　　　　　✦ 　　　　　　　       　✦    　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦  　   　　　,　　　‏Ezz ❀ ‏ ❀　　　　　　*　　     　　　　 　　,　　　‍ ‍ ‍ ‍ 　 　　　　　　　　　　　　.　　　　　 　　 　　　.　　　　　　　　    ✦ 　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　 ✦  　   　　　　,　　　　　 　　　　　　       　    　　　　　　　　　　　　　　　　.　　　✦   　　    　　　　　 　　　　　.　　　　　　　　　　　　　.　　　　　　　　　　‏Ezz ❀ ‏❀　　　*　　　　　　　　　. 　　　　　　　　　　.　　　　　　  : ✦ 　　　　　　　.✦  　　　　　　　　　　　　　　　　       　   　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦  　   　　　,　　　　❀ ‏Ezz ❀　　　　　*　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　✦ 　　　　　　　　.　　　　　 　　 　　　.　　　　　　　　 　　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　　 　✦    　　　　,　　　　　　　　✦ 　　　       　    　　　　　　　　　　　　.　　　❀ Ezz  ❀`;

// =================================================================================
// --- نهاية إعدادات الردود التلقائية ---
// =================================================================================


// --- دالة تسجيل الأوامر ---
async function registerCommands() {
    const commands = [];
    const commandsDir = path.join(__dirname, 'commands');
    
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;

    if (!token || !clientId) {
        console.error('[خطأ فادح] يرجى التأكد من وجود DISCORD_TOKEN و CLIENT_ID في ملف .env!');
        process.exit(1);
    }

    let commandFiles = [];
    try {
        commandFiles = readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    } catch (error) {
        console.error(`[خطأ] لا يمكن قراءة مجلد الأوامر في: ${commandsDir}. هل المجلد موجود؟`);
        return false;
    }

    console.log(`[التسجيل] تم العثور على ${commandFiles.length} ملف أمر.`);

    for (const file of commandFiles) {
        const filePath = path.join(commandsDir, file);
        try {
            const mod = await import(pathToFileURL(filePath).href);
            if (mod.default?.data) {
                commands.push(mod.default.data.toJSON());
            } else {
                console.warn(`[تحذير] الأمر في ${filePath} لا يحتوي على خاصية "data" أو "execute".`);
            }
        } catch (error) {
            console.error(`[خطأ] فشل في تحميل الأمر من ${filePath}:`, error);
        }
    }

    if (commands.length === 0) {
        console.log('[التسجيل] لا توجد أوامر صالحة لتسجيلها.');
        return true;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log(`[التسجيل] بدأ تحديث ${commands.length} من أوامر التطبيق (/).`);
        
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`✅ [التسجيل] تم إعادة تحميل ${data.length} من أوامر التطبيق بنجاح.`);
        return true;
    } catch (error) {
        console.error('[خطأ فادح] فشل تسجيل الأوامر مع Discord API:', error);
        return false;
    }
}

// --- دالة تحميل الأوامر إلى ذاكرة البوت ---
function loadCommands(client) {
    client.commands = new Collection();
    const commandsDir = path.join(__dirname, 'commands');
    let files = [];
    try {
        files = readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    } catch (_) {
        console.error(`[تحميل] لا يمكن قراءة مجلد الأوامر: ${commandsDir}`);
        return;
    }
    for (const file of files) {
        const filePath = path.join(commandsDir, file);
        import(pathToFileURL(filePath).href).then(mod => {
            const command = mod.default;
            if (command?.data?.name && typeof command.execute === 'function') {
                client.commands.set(command.data.name, command);
                console.log(`[تحميل] تم تحميل الأمر: /${command.data.name}`);
            }
        }).catch(err => console.error(`[تحميل] فشل تحميل ${file}:`, err));
    }
}

// --- الدالة الرئيسية لتشغيل البوت ---
async function startBot() {
    console.log('--- بدء عملية تسجيل الأوامر ---');
    const commandsRegistered = await registerCommands();
    if (!commandsRegistered) {
        console.error("--- تم إيقاف تشغيل البوت بسبب فشل في تسجيل الأوامر. ---");
        process.exit(1);
    }
    console.log('--- انتهت عملية تسجيل الأوامر بنجاح ---');

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.MessageContent,
        ],
        partials: [Partials.GuildMember, Partials.Channel, Partials.Message],
    });

    loadCommands(client);

    async function refreshTicketPanel(channelId) {
        if (!channelId) return;
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel || channel.type !== ChannelType.GuildText) return;
        
        const PANEL_IMAGE = 'https://cdn.discordapp.com/attachments/1438037917124788267/1438521792296652800/Picsart_25-10-16_13-18-43-513.jpg?ex=69172f51&is=6915ddd1&hm=11fe8fbf7548e562ec12486d86dd5432923a9796582c42275bec8742ca9e157b&';
        const embed = new EmbedBuilder().setColor(0x808080).setTitle('تذكره الدعم الفني').setImage(PANEL_IMAGE);
        
        const select = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('اختر نوع التذكرة')
            .addOptions([
                { label: 'الدعم الفني', value: 'support', emoji: { id: '1386132899874472098', name: 'estaff_ds' } },
                { label: 'ريوارد', value: 'reward', emoji: { id: '1434107495722520617', name: '1531vslgiveaway' } },
                { label: 'إعلان', value: 'advertisement', emoji: '📢' },
                { label: 'Reset Menu', value: 'reset_menu', emoji: '🔄' },
            ]);

        const row = new ActionRowBuilder().addComponents(select);
        
        try {
            const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
            if (messages) {
                const panelMsg = messages.find(m => m.author.id === client.user.id && m.components?.some(r => r.components?.some(c => c.customId === 'ticket_select')));
                if (panelMsg) {
                    await panelMsg.edit({ embeds: [embed], components: [row] }).catch(() => {});
                    return;
                }
            }
        } catch {}
        
        await channel.send({ embeds: [embed], components: [row] }).catch(() => {});
    }

    async function refreshStaffApplicationPanel(channelId) {
        if (!channelId) return;
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel || channel.type !== ChannelType.GuildText) return;
        
        const STAFF_PANEL_IMAGE = 'https://media.discordapp.net/attachments/1433832273538711612/1436075334565888010/image.png?ex=690e48e0&is=690cf760&hm=88ebb29ea8c00615c80da44823be56fd7d06367e88e4fb21980e1af0b7f543e0&=&format=webp&quality=lossless&width=963&height=320';
        const embed = new EmbedBuilder().setColor(0x808080).setTitle('تقديم إدارة').setImage(STAFF_PANEL_IMAGE);
        const select = new StringSelectMenuBuilder()
            .setCustomId('staff_application_select')
            .setPlaceholder('اختر للتقديم')
            .addOptions([
                { label: 'تقديم اداره', value: 'staff_application', emoji: { id: '1386133151574654976', name: 'staff' } },
                { label: 'Reset Menu', value: 'reset_menu', emoji: '🔄' },
            ]);
        const row = new ActionRowBuilder().addComponents(select);
        
        try {
            const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
            if (messages) {
                const panelMsg = messages.find(m => m.author.id === client.user.id && m.components?.some(r => r.components?.some(c => c.customId === 'staff_application_select')));
                if (panelMsg) {
                    await panelMsg.edit({ embeds: [embed], components: [row] }).catch(() => {});
                    return;
                }
            }
        } catch {}
        
        await channel.send({ embeds: [embed], components: [row] }).catch(() => {});
    }

    client.once(Events.ClientReady, async c => {
        console.log(`✅✅✅ تم تسجيل الدخول باسم ${c.user.tag} والبوت جاهز للعمل!`);
        
        const panelChannelId = process.env.TICKET_PANEL_CHANNEL_ID;
        await refreshTicketPanel(panelChannelId);
        
        const staffPanelChannelId = '1397092707687727204';
        await refreshStaffApplicationPanel(staffPanelChannelId);
        
        console.log('✅ تم تحديث جميع panels التيكيت');
    });

    client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
        if (oldMember.nickname !== newMember.nickname) {
            addNickname(newMember.guild.id, newMember.id, newMember.nickname ?? newMember.user.globalName ?? newMember.user.username);
        }
    });

    // =================================================================================
    // --- نظام الردود التلقائية ---
    // =================================================================================
    client.on(Events.MessageCreate, async message => {
        // تجاهل رسائل البوتات
        if (message.author.bot) return;

        try {
            // 1. إرسال رسالة تلقائية في رومات محددة
            if (AUTO_MESSAGE_CHANNELS.includes(message.channel.id)) {
                await message.channel.send(AUTO_MESSAGE_IMAGE);
                return;
            }

            // 2. الردود التلقائية (فقط لمن يملك الرول المحدد)
            const member = message.member;
            if (!member) return;

            // التحقق من وجود الرول
            if (!member.roles.cache.has(AUTO_REPLY_ROLE_ID)) return;

            const messageContent = message.content.trim();

            // الرد على كلمة "خط"
            if (messageContent === 'خط') {
                // حذف رسالة المستخدم أولاً
                await message.delete().catch(err => console.error('فشل حذف رسالة "خط":', err));
                // إرسال الرد
                await message.channel.send(AUTO_MESSAGE_IMAGE);
                return;
            }

            // الرد على كلمة "فراغ"
            if (messageContent === 'فراغ') {
                // حذف رسالة المستخدم أولاً
                await message.delete().catch(err => console.error('فشل حذف رسالة "فراغ":', err));
                // إرسال الرد
                await message.channel.send(FARAGH_REPLY);
                return;
            }

        } catch (error) {
            console.error('خطأ في نظام الردود التلقائية:', error);
        }
    });
    // =================================================================================
    // --- نهاية نظام الردود التلقائية ---
    // =================================================================================

    client.on(Events.InteractionCreate, async interaction => {
        try {
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) {
                    console.error(`لم يتم العثور على الأمر /${interaction.commandName} في client.commands.`);
                    await interaction.reply({ content: 'عفوًا، هذا الأمر غير موجود أو حدث خطأ في تحميله.', ephemeral: true });
                    return;
                }
                await command.execute(interaction);
                return;
            }
            
            if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
                const guild = interaction.guild;
                const opener = interaction.user;
                const selectedValue = interaction.values[0];

                if (selectedValue === 'reset_menu') {
                    await interaction.deferUpdate();
                    return;
                }
                
                async function createTicket(type, roleId, categoryId, embedDetails) {
                    await interaction.deferReply({ ephemeral: true });
                    
                    const channelName = `${type}-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90);
                    
                    const existingChannel = guild.channels.cache.find(ch => ch.name === channelName && ch.parentId === categoryId);
                    if (existingChannel) {
                        await interaction.editReply({ content: `لديك بالفعل تذكرة من هذا النوع مفتوحة: ${existingChannel}` });
                        return;
                    }

                    const targetRole = guild.roles.cache.get(roleId);
                    const permissionOverwrites = [
                        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: opener.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                        ...(targetRole ? [{ id: targetRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [{ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }]),
                    ];

                    const ticketChannel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: categoryId,
                        permissionOverwrites,
                        reason: `Ticket opened by ${opener.tag} (${type})`,
                    });

                    const infoEmbed = new EmbedBuilder()
                        .setColor(embedDetails.color || 0x808080)
                        .setTitle(embedDetails.title)
                        .setImage(embedDetails.image)
                        .setDescription(`${opener} تم فتح تذكرتك بنجاح.`);
                    
                    const closeBtn = new ButtonBuilder().setCustomId('ticket_close').setLabel('حذف التيكيت').setStyle(ButtonStyle.Danger);
                    const claimBtn = new ButtonBuilder().setCustomId('ticket_claim').setLabel('استلام').setStyle(ButtonStyle.Primary);
                    const row = new ActionRowBuilder().addComponents(claimBtn, closeBtn);
                    
                    const mentionText = targetRole ? `${targetRole}` : `<@&${roleId}>`;
                    await ticketChannel.send({ content: `${mentionText}\n${opener}`, embeds: [infoEmbed], components: [row] });
                    
                    await interaction.editReply({ content: `تم إنشاء تذكرتك: ${ticketChannel}` });
                }

                if (selectedValue === 'support') {
                    await createTicket('ticket', '1419306051164966964', '1397022492090171392', {
                        title: 'الرجاء انتظار الدعم الفني',
                        image: 'https://media.discordapp.net/attachments/1397093949071687700/1433739302856294461/Picsart_25-10-16_13-18-43-513.jpg?ex=6905c947&is=690477c7&hm=cc9c64f687d99cf07fc18e898d1eaaf70f27b472a0fe9901069c9be26cd69f9e&=&format=webp&width=2797&height=933'
                    });
                    return;
                }
                
                if (selectedValue === 'reward') {
                    await createTicket('reward', '1419306155145953400', '1397022492090171392', {
                        title: 'تذكرة الريوارد',
                        image: 'https://media.discordapp.net/attachments/1433832273538711612/1434112148648235118/Picsart_25-10-16_13-18-43-513.jpg?ex=69072484&is=6905d304&hm=f2f1f426cdbf67c07f95db5e9d0339d476110baba8bd10fc40ea4c686e905b80&=&format=webp&width=2615&height=872'
                    });
                    return;
                }

                if (selectedValue === 'advertisement') {
                    const adsRoleId = '1419306155145953400';
                    const adsCategoryId = '1397022492090171392';

                    await createTicket('ads', adsRoleId, adsCategoryId, {
                        title: 'تذكرة إعلان',
                        image: 'https://media.discordapp.net/attachments/1433832273538711612/1436075334565888010/image.png?ex=690e48e0&is=690cf760&hm=88ebb29ea8c00615c80da44823be56fd7d06367e88e4fb21980e1af0b7f543e0&=&format=webp&quality=lossless&width=963&height=320',
                        description: 'الرجاء توضيح تفاصيل إعلانك وانتظار المسؤول.'
                    });
                    return;
                }
            }
            
            if (interaction.isStringSelectMenu() && interaction.customId === 'staff_application_select') {
                const guild = interaction.guild;
                const opener = interaction.user;
                const selectedValue = interaction.values[0];

                if (selectedValue === 'reset_menu') {
                    await interaction.deferUpdate();
                    return;
                }

                if (selectedValue === 'staff_application') {
                    await interaction.deferReply({ ephemeral: true });

                    const managementRoleId = '1419306155145953400'; 
                    const applicationsCategoryId = '1397022482929549333';

                    const channelName = `apply-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90);
                    
                    const existingChannel = guild.channels.cache.find(ch => ch.name === channelName && ch.parentId === applicationsCategoryId);
                    if (existingChannel) {
                        await interaction.editReply({ content: `لديك بالفعل تذكرة تقديم مفتوحة: ${existingChannel}` });
                        return;
                    }

                    const managementRole = guild.roles.cache.get(managementRoleId);
                    const permissionOverwrites = [
                        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: opener.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                        ...(managementRole ? [{ id: managementRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [{ id: managementRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }]),
                    ];

                    const ticketChannel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: applicationsCategoryId,
                        permissionOverwrites,
                        reason: `Staff application opened by ${opener.tag}`,
                    });

                    const infoEmbed = new EmbedBuilder()
                        .setColor(0x808080)
                        .setTitle('📝 تذكرة تقديم إدارة')
                        .setDescription(`أهلاً بك ${opener} في تذكرة التقديم.\n\nالرجاء الإجابة على الأسئلة التي سيتم طرحها عليك بصدق ووضوح.\nسيتم مراجعة طلبك من قبل الإدارة العليا.`)
                        .setFooter({ text: 'بالتوفيق في تقديمك!' });
                    
                    const closeBtn = new ButtonBuilder().setCustomId('ticket_close').setLabel('إغلاق التقديم').setStyle(ButtonStyle.Danger);
                    const claimBtn = new ButtonBuilder().setCustomId('ticket_claim').setLabel('استلام').setStyle(ButtonStyle.Primary);
                    const row = new ActionRowBuilder().addComponents(claimBtn, closeBtn);
                    
                    const mentionText = managementRole ? `${managementRole}` : `<@&${managementRoleId}>`;
                    await ticketChannel.send({ content: `${mentionText}\n${opener}`, embeds: [infoEmbed], components: [row] });
                    
                    await interaction.editReply({ content: `تم فتح تذكرة التقديم الخاصة بك: ${ticketChannel}` });
                    return;
                }
            }

            if (interaction.isButton() && interaction.customId === 'ticket_claim') {
                const member = interaction.member;
                const channel = interaction.channel;

                if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    await interaction.reply({ content: 'ليس لديك الصلاحية لاستلام هذه التذكرة.', ephemeral: true });
                    return;
                }

                await interaction.deferUpdate();

                const newClaimCount = incrementClaimCount(member.id);

                const disabledClaimBtn = new ButtonBuilder()
                    .setCustomId('ticket_claim_disabled')
                    .setLabel('تم الاستلام')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true);

                const originalCloseBtn = interaction.message.components[0].components.find(c => c.customId === 'ticket_close');
                
                const updatedRow = new ActionRowBuilder().addComponents(disabledClaimBtn, originalCloseBtn);

                await interaction.message.edit({ components: [updatedRow] });

                await channel.send({ content: `✅ تم استلام هذه التذكرة بواسطة ${member}.` });

                try {
                    await member.send({
                        content: `لقد قمت باستلام تذكرة جديدة (${channel.name}).\n**إجمالي استلاماتك الآن هو: ${newClaimCount} تذكرة.**`
                    });
                } catch (dmError) {
                    console.error(`فشل إرسال رسالة خاصة إلى ${member.user.tag}:`, dmError);
                    await channel.send({ content: `تنبيه لـ ${member}: لم أتمكن من إرسال إحصائياتك على الخاص.` });
                }
            }

            if (interaction.isButton() && interaction.customId === 'ticket_close') {
                const channel = interaction.channel;
                
                let openerId = null;
                try {
                    const messages = await channel.messages.fetch({ limit: 1, after: 0 });
                    const firstMessage = messages.first();
                    const openerMention = firstMessage?.mentions?.users?.first();
                    if (openerMention) {
                        openerId = openerMention.id;
                    }
                } catch (fetchError) {
                    console.error("لم أتمكن من جلب الرسالة الأولى للعثور على فاتح التذكرة.", fetchError);
                }

                await interaction.deferReply({ ephemeral: true });

                try {
                    if (openerId) {
                        const user = await client.users.fetch(openerId).catch(() => null);
                        if (user) {
                            let transcript = `📋 **نسخة من التذكرة (Transcript)**\n`;
                            transcript += `**السيرفر:** ${interaction.guild.name}\n`;
                            transcript += `**القناة:** #${channel.name}\n`;
                            transcript += `**تاريخ الإغلاق:** ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}\n`;
                            transcript += `**أغلقه:** ${interaction.user.tag}\n\n`;
                            transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                            
                            try {
                                const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                                const sortedMessages = Array.from(fetchedMessages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
                                
                                for (const msg of sortedMessages) {
                                    const date = new Date(msg.createdTimestamp).toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });
                                    transcript += `**[${date}]** ${msg.author.tag} ${msg.author.bot ? '(Bot)' : ''}\n`;
                                    if (msg.content) transcript += `${msg.content}\n`;
                                    if (msg.attachments.size > 0) {
                                        msg.attachments.forEach(att => {
                                            transcript += `📎 ${att.name || 'مرفق'}: ${att.url}\n`;
                                        });
                                    }
                                    if (msg.embeds.length > 0) {
                                        msg.embeds.forEach(embed => {
                                            if (embed.title) transcript += `📌 **${embed.title}**\n`;
                                            if (embed.description) transcript += `${embed.description}\n`;
                                            if (embed.fields && embed.fields.length > 0) {
                                                embed.fields.forEach(field => {
                                                    transcript += `   • ${field.name}: ${field.value}\n`;
                                                });
                                            }
                                        });
                                    }
                                    transcript += `\n`;
                                }
                            } catch (transcriptError) {
                                transcript += `⚠️ تعذر جمع بعض الرسائل\n`;
                            }
                            
                            transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                            transcript += `✅ تم إغلاق التذكرة بنجاح\n`;
                            
                            await user.send({ content: transcript }).catch(dmError => {
                                console.error(`فشل إرسال نسخة التذكرة إلى ${user.tag}:`, dmError);
                            });
                        }
                    }
                } catch (err) {
                    console.error('حدث خطأ أثناء إنشاء وإرسال نسخة التذكرة:', err);
                }
                
                await channel.delete('Ticket closed by user').catch(deleteError => {
                    console.error(`فشل حذف القناة #${channel.name}:`, deleteError);
                });
                await interaction.editReply({ content: 'تم حذف التذكرة بنجاح.' }).catch(() => {});
                return;
            }

        } catch (error) {
            console.error('An error occurred in InteractionCreate:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'حدث خطأ أثناء تنفيذ هذا الأمر!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ هذا الأمر!', ephemeral: true });
            }
        }
    });

    client.login(process.env.DISCORD_TOKEN);
}

startBot();
