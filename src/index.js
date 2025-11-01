import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection, Events, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
import { addNickname } from './utils/nicknameStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

client.commands = new Collection();

function loadCommands() {
	const commandsDir = path.join(__dirname, 'commands');
	let files = [];
	try {
		files = readdirSync(commandsDir).filter(f => f.endsWith('.js'));
	} catch (_) {
		return;
	}
	for (const file of files) {
		const filePath = path.join(commandsDir, file);
		import(pathToFileURL(filePath).href).then(mod => {
			const command = mod.default;
			if (command?.data?.name && typeof command.execute === 'function') {
				client.commands.set(command.data.name, command);
			}
		}).catch(console.error);
	}
}

function pathToFileURL(filePath) {
	const url = new URL('file:');
	const pathname = path.resolve(filePath).replace(/\\/g, '/');
	url.pathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return url;
}

async function refreshTicketPanel(channelId) {
	if (!channelId) return;
	const channel = await client.channels.fetch(channelId).catch(() => null);
	if (!channel || channel.type !== ChannelType.GuildText) return;
	try {
		const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
		if (messages) {
			const panelMsgs = messages.filter(m => m.author.id === client.user.id && m.components?.some(r => r.components?.some(c => c.customId === 'ticket_select')));
			for (const msg of panelMsgs.values()) await msg.delete().catch(() => {});
		}
	} catch {}
	const PANEL_IMAGE = 'https://media.discordapp.net/attachments/1397093949071687700/1433739302856294461/Picsart_25-10-16_13-18-43-513.jpg?ex=6905c947&is=690477c7&hm=cc9c64f687d99cf07fc18e898d1eaaf70f27b472a0fe9901069c9be26cd69f9e&=&format=webp&width=2797&height=933';
	const embed = new EmbedBuilder().setColor(0x808080).setTitle('تذكره الدعم الفني').setImage(PANEL_IMAGE);
	const select = new StringSelectMenuBuilder()
		.setCustomId('ticket_select')
		.setPlaceholder('اختر نوع التذكرة')
		.addOptions([
			{ label: 'الدعم الفني', value: 'support', emoji: { id: '1386132899874472098', name: 'estaff_ds' } },
			{ label: 'ريوارد', value: 'reward', emoji: { id: '1434107495722520617', name: '1531vslgiveaway' } },
		]);
	const row = new ActionRowBuilder().addComponents(select);
	await channel.send({ embeds: [embed], components: [row] }).catch(() => {});
}

client.once(Events.ClientReady, async c => {
	console.log(`Logged in as ${c.user.tag}`);
	const panelChannelId = process.env.TICKET_PANEL_CHANNEL_ID;
	await refreshTicketPanel(panelChannelId);
});

client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
	if (oldMember.nickname !== newMember.nickname) {
		addNickname(newMember.guild.id, newMember.id, newMember.nickname ?? newMember.user.globalName ?? newMember.user.username);
	}
});

client.on(Events.InteractionCreate, async interaction => {
	try {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) return;
			await command.execute(interaction);
			return;
		}
		if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
			const guild = interaction.guild;
			const opener = interaction.user;
			const selectedValue = interaction.values[0];
			
			if (selectedValue === 'support') {
				await interaction.deferReply({ ephemeral: true });
				const supportRoleIds = ['1419306051164966964', '1419306155145953400'];
				const adminRoleId = '1419306051164966964';
				const supportCategoryId = '1397022492090171392';
				const channelName = `ticket-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90);
				const permissionOverwrites = [
					{ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
					...supportRoleIds.map(id => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] })),
					{ id: opener.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
				];
				const ticketChannel = await guild.channels.create({
					name: channelName,
					type: ChannelType.GuildText,
					parent: supportCategoryId,
					permissionOverwrites,
					reason: `Ticket opened by ${opener.tag} (support)`,
				});
				const adminRole = guild.roles.cache.get(adminRoleId);
				const infoEmbed = new EmbedBuilder()
					.setColor(0x808080)
					.setTitle('الرجاء انتظار الدعم الفني')
					.setImage('https://media.discordapp.net/attachments/1397093949071687700/1433739302856294461/Picsart_25-10-16_13-18-43-513.jpg?ex=6905c947&is=690477c7&hm=cc9c64f687d99cf07fc18e898d1eaaf70f27b472a0fe9901069c9be26cd69f9e&=&format=webp&width=2797&height=933')
					.setDescription(`${opener} تم فتح تذكرتك بنجاح.`);
				const closeBtn = new ButtonBuilder().setCustomId('ticket_close').setLabel('حذف التيكيت').setStyle(ButtonStyle.Danger);
				const row = new ActionRowBuilder().addComponents(closeBtn);
				const mentionText = adminRole ? `${adminRole}` : `<@&${adminRoleId}>`;
				await ticketChannel.send({ content: `${mentionText}\n${opener}`, embeds: [infoEmbed], components: [row] });
				await interaction.editReply({ content: `تم إنشاء تذكرتك: ${ticketChannel}` });
				return;
			}
			
			if (selectedValue === 'reward') {
				await interaction.deferReply({ ephemeral: true });
				const supportRoleIds = ['1419306051164966964', '1419306155145953400'];
				const rewardRoleId = '1419306155145953400';
				const supportCategoryId = '1397022492090171392';
				const channelName = `ticket-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90);
				const permissionOverwrites = [
					{ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
					...supportRoleIds.map(id => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] })),
					{ id: opener.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
				];
				const ticketChannel = await guild.channels.create({
					name: channelName,
					type: ChannelType.GuildText,
					parent: supportCategoryId,
					permissionOverwrites,
					reason: `Ticket opened by ${opener.tag} (reward)`,
				});
				const rewardRole = guild.roles.cache.get(rewardRoleId);
				const infoEmbed = new EmbedBuilder()
					.setColor(0x808080)
					.setTitle('تذكرة الريوارد')
					.setImage('https://media.discordapp.net/attachments/1397093949071687700/1433739302856294461/Picsart_25-10-16_13-18-43-513.jpg?ex=6905c947&is=690477c7&hm=cc9c64f687d99cf07fc18e898d1eaaf70f27b472a0fe9901069c9be26cd69f9e&=&format=webp&width=2797&height=933')
					.setDescription(`${opener} تم فتح تذكرتك بنجاح.`);
				const closeBtn = new ButtonBuilder().setCustomId('ticket_close').setLabel('حذف التيكيت').setStyle(ButtonStyle.Danger);
				const row = new ActionRowBuilder().addComponents(closeBtn);
				const mentionText = rewardRole ? `${rewardRole}` : `<@&${rewardRoleId}>`;
				await ticketChannel.send({ content: `${mentionText}\n${opener}`, embeds: [infoEmbed], components: [row] });
				await interaction.editReply({ content: `تم إنشاء تذكرتك: ${ticketChannel}` });
				return;
			}
		}
		if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_ads_select') {
			const guild = interaction.guild;
			const opener = interaction.user;
			await interaction.deferReply({ ephemeral: true });
			const supportRoleIds = ['1419306051164966964', '1419306155145953400'];
			const adsRoleId = '1418942792121585724';
			const adsCategoryId = '1397022474159526050';
			const channelName = `ticket-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90);
			const permissionOverwrites = [
				{ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
				...supportRoleIds.map(id => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] })),
				{ id: adsRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
				{ id: opener.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
			];
			const ticketChannel = await guild.channels.create({
				name: channelName,
				type: ChannelType.GuildText,
				parent: adsCategoryId,
				permissionOverwrites,
				reason: `Ticket opened by ${opener.tag} (ads)`,
			});
			const adsRole = guild.roles.cache.get(adsRoleId);
			const infoEmbed = new EmbedBuilder()
				.setColor(0x808080)
				.setTitle('لرؤيه اسعار الاعلانات توجه الئ <#1397022586466209842>')
				.setImage('https://media.discordapp.net/attachments/1397022589825843452/1433739124321423422/Picsart_25-10-16_13-18-24-693.jpg?ex=6905c91c&is=6904779c&hm=9cca4f862cdfde66a30ac123b31d2342a0cf084f1770c5309940be0f3fb6ca8b&=&format=webp&width=2797&height=933')
				.setDescription(`${opener} تم فتح تذكرتك بنجاح.`);
			const closeBtn = new ButtonBuilder().setCustomId('ticket_close').setLabel('حذف التيكيت').setStyle(ButtonStyle.Danger);
			const row = new ActionRowBuilder().addComponents(closeBtn);
			const mentionText = adsRole ? `${adsRole}` : `<@&${adsRoleId}>`;
			await ticketChannel.send({ content: `${mentionText}\n${opener}`, embeds: [infoEmbed], components: [row] });
			await interaction.editReply({ content: `تم إنشاء تذكرتك: ${ticketChannel}` });
			return;
		}
		if (interaction.isButton() && interaction.customId === 'ticket_close') {
			const channel = interaction.channel;
			const openerMention = channel?.messages?.cache?.first()?.mentions?.users?.first();
			const openerId = openerMention?.id;
			await interaction.deferReply({ ephemeral: true });
			try {
				if (openerId) {
					const user = await interaction.client.users.fetch(openerId).catch(() => null);
					if (user) await user.send({ content: `تم إغلاق تذكرتك في ${interaction.guild.name}. شكرًا لتواصلك.` }).catch(() => {});
				}
				await interaction.editReply({ content: 'سيتم حذف التيكيت.' });
				await channel.delete().catch(() => {});
			} catch (e) {
				await interaction.editReply({ content: 'تعذر حذف التيكيت.' }).catch(() => {});
			}
			return;
		}
	} catch (error) {
		console.error(error);
		if (!interaction.isRepliable()) return;
		if (interaction.deferred || interaction.replied) await interaction.followUp({ content: 'حدث خطأ أثناء التفاعل.', ephemeral: true });
		else await interaction.reply({ content: 'حدث خطأ أثناء التفاعل.', ephemeral: true });
	}
});

const TRIGGER_WORD = 'خط';
const ROLE_IDS = ['1418942792121585724', '1428103206705172673'];
const GIF_URL = 'https://media.discordapp.net/attachments/1397095407745499196/1429784555220369408/standard_1.gif?ex=6905e6a2&is=69049522&hm=fbf94c4a518b3329a2abe2a2e7f5313e3b0aa61c4ca96bfaf5a8f3d6fb9efa35&=&width=2797&height=163';

client.on('messageCreate', async message => {
	if (!message.inGuild()) return;
	if (message.author.bot) return;
	if (message.content.trim() === 'فراغ') {
		const allowed = ROLE_IDS.some(id => message.member?.roles.cache.has(id));
		if (!allowed) return;
		const text = `.✦  　　　　　　　　　　.　　　　　　　　　✦ 　　　　. 　　　　　　　　　✦ 　　　　　❀ ‏Ezz ❀　　       　✦    　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦ 　   　　　,　　　　　　　　　*　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　　　　　　　　　.　　　　　 　　 　　　.　　　　　　　　　✦ 　　　　 　           　　　　　　　　　　　　　　❀ ‏Ezz ❀　　　　　˚　　　✦  　   　　　　,　　　　　　　　　　　       　    　　　　　　　　　　　　　　　　.　　　✦   　　    　　　　　 　　　　　.　　　　　　　　　　　　　.　　　　　　　　　　　　　*　　　　　　　　　. 　　　　　　　　　　.　　　　　　✦ 　　　　　　　❀ ‏Ezz ❀ ✦  　　　　　　　　　　　　　　　　       　   　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦  　   　　　,　　　　　　　　　*　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　✦ 　　　　　　　　.　　　　　 　　 　　　.　　❀ ‏Ezz ❀　　　　　　　　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　　 　✦    　　　　,　　　　　　　　✦ 　　　       　    　　　　　　　　　　　　　　　　.　　　  　　 ✦    　　　　　 　　　　　.　　　　　　　　　　　　　.　　　　　　　　　　　　　　　* 　　   　　　　　 ✦　　　　　　　　　　. 　　　　　　　　　　.　　　　　✦ 　　　　　　　　.❀ ‏Ezz ❀ 　　　　　　　　　　　　　　　　       　   　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　       ✦  　   　　　,　　　　　　　　　❀ ‏Ezz ❀　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　　　　　　　　　.　　　　　 　　 　　　.　　　　　　　✦ 　　　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　　 　   　　　　,　　　　　　　　　　　       　    　　　　　　　　　　　　　　　　.　　　  　　    　　　　　 　　　　　.　　　　　　　　　　　　❀ ‏ ❀ ‏Ezz　.　　　　　　　　　　　　　　　* 　　   　　　　　 ✦*　　　　　　　　　.✦  　　　　　　  　　　　.　　　　　　　　　✦ 　　　　. 　　　　　　　　　✦ 　　　　　　　       　✦    　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦  　   　　　,　　　‏Ezz ❀ ‏ ❀　　　　　　*　　     　　　　 　　,　　　‍ ‍ ‍ ‍ 　 　　　　　　　　　　　　.　　　　　 　　 　　　.　　　　　　　　    ✦ 　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　 ✦  　   　　　　,　　　　　 　　　　　　       　    　　　　　　　　　　　　　　　　.　　　✦   　　    　　　　　 　　　　　.　　　　　　　　　　　　　.　　　　　　　　　　‏Ezz ❀ ‏❀　　　*　　　　　　　　　. 　　　　　　　　　　.　　　　　　  : ✦ 　　　　　　　.✦  　　　　　　　　　　　　　　　　       　   　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦  　   　　　,　　　　❀ ‏Ezz ❀　　　　　*　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　✦ 　　　　　　　　.　　　　　 　　 　　　.　　　　　　　　 　　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　　 　✦    　　　　,　　　　　　　　✦ 　　　       　    　　　　　　　　　　　　.　　　❀ Ezz  ❀`; 
		await message.channel.send({ content: text });
		return;
	}
	if (message.content.trim() === TRIGGER_WORD) {
		const hasAllowedRole = ROLE_IDS.some(id => message.member?.roles.cache.has(id));
		if (!hasAllowedRole) return;
		try {
			await message.channel.send({ content: GIF_URL });
			await message.delete().catch(() => {});
		} catch (err) {
			console.error('Failed handling trigger:', err);
		}
	}
});

loadCommands();

const token = process.env.DISCORD_TOKEN;
if (!token) {
	console.error('يرجى وضع التوكن في ملف .env باسم DISCORD_TOKEN');
	process.exit(1);
}

client.login(token);
