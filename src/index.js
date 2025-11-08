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
	console.log(`Logged in as ${c.user.tag}`);
	
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
				const adminRoleId = '1419306051164966964';
				const supportCategoryId = '1397022492090171392';
				const channelName = `ticket-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90);
				const adminRole = guild.roles.cache.get(adminRoleId);
				const permissionOverwrites = [
					{ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
					...(adminRole ? [{ id: adminRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [{ id: adminRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }]),
					{ id: opener.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
				];
				const ticketChannel = await guild.channels.create({
					name: channelName,
					type: ChannelType.GuildText,
					parent: supportCategoryId,
					permissionOverwrites,
					reason: `Ticket opened by ${opener.tag} (support)`,
				});
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
				const rewardRoleId = '1419306155145953400';
				const supportCategoryId = '1397022492090171392';
				const channelName = `ticket-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90);
				const rewardRole = guild.roles.cache.get(rewardRoleId);
				const permissionOverwrites = [
					{ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
					...(rewardRole ? [{ id: rewardRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [{ id: rewardRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }]),
					{ id: opener.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
				];
				const ticketChannel = await guild.channels.create({
					name: channelName,
					type: ChannelType.GuildText,
					parent: supportCategoryId,
					permissionOverwrites,
					reason: `Ticket opened by ${opener.tag} (reward)`,
				});
				const infoEmbed = new EmbedBuilder()
					.setColor(0x808080)
					.setTitle('تذكرة الريوارد')
					.setImage('https://media.discordapp.net/attachments/1433832273538711612/1434112148648235118/Picsart_25-10-16_13-18-43-513.jpg?ex=69072484&is=6905d304&hm=f2f1f426cdbf67c07f95db5e9d0339d476110baba8bd10fc40ea4c686e905b80&=&format=webp&width=2615&height=872')
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
			const adsRoleId = '1418942792121585724';
			const adsCategoryId = '1397022474159526050';
			const channelName = `ticket-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90);
			const adsRole = guild.roles.cache.get(adsRoleId);
			const permissionOverwrites = [
				{ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
				...(adsRole ? [{ id: adsRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [{ id: adsRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }]),
				{ id: opener.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
			];
			const ticketChannel = await guild.channels.create({
				name: channelName,
				type: ChannelType.GuildText,
				parent: adsCategoryId,
				permissionOverwrites,
				reason: `Ticket opened by ${opener.tag} (ads)`,
			});
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
		
		if (interaction.isStringSelectMenu() && interaction.customId === 'staff_application_select') {
			const selectedValue = interaction.values[0];
			
			if (selectedValue === 'reset_menu') {
				await interaction.deferUpdate();
				return;
			}
			
			if (selectedValue === 'staff_application') {
				const guild = interaction.guild;
				const opener = interaction.user;
				await interaction.deferReply({ ephemeral: true });
				const staffCategoryId = '1397022482929549333';
				const staffRoleId = '1418942792121585724';
				const channelName = `تقديم-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90);
				const staffRole = guild.roles.cache.get(staffRoleId);
				const permissionOverwrites = [
					{ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
					...(staffRole ? [{ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [{ id: staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }]),
					{ id: opener.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
				];
				const ticketChannel = await guild.channels.create({
					name: channelName,
					type: ChannelType.GuildText,
					parent: staffCategoryId,
					permissionOverwrites,
					reason: `Staff application by ${opener.tag}`,
				});
				const infoEmbed = new EmbedBuilder()
					.setColor(0x808080)
					.setTitle('تقديم إدارة')
					.setImage('https://media.discordapp.net/attachments/1433832273538711612/1436075334565888010/image.png?ex=690e48e0&is=690cf760&hm=88ebb29ea8c00615c80da44823be56fd7d06367e88e4fb21980e1af0b7f543e0&=&format=webp&quality=lossless&width=963&height=320')
					.setDescription(`${opener} تم فتح تذكرة التقديم بنجاح.\nالرجاء ملئ الطلب بشكل صحيح.`);
				const closeBtn = new ButtonBuilder().setCustomId('ticket_close').setLabel('حذف التيكيت').setStyle(ButtonStyle.Danger);
				const row = new ActionRowBuilder().addComponents(closeBtn);
				const mentionText = staffRole ? `${staffRole}` : `<@&${staffRoleId}>`;
				await ticketChannel.send({ content: `${mentionText}\n${opener}`, embeds: [infoEmbed], components: [row] });
				await interaction.editReply({ content: `تم إنشاء تذكرة التقديم: ${ticketChannel}` });
				return;
			}
		}
		
		
		if (interaction.isButton() && interaction.customId === 'ticket_close') {
			const channel = interaction.channel;
			const openerMention = channel?.messages?.cache?.first()?.mentions?.users?.first();
			const openerId = openerMention?.id;
			await interaction.deferReply({ ephemeral: true });
			try {
				if (openerId) {
					const user = await interaction.client.users.fetch(openerId).catch(() => null);
					if (user) {
						let transcript = `📋 **ترانسكريبت التيكيت**\n`;
						transcript += `**السيرفر:** ${interaction.guild.name}\n`;
						transcript += `**القناة:** ${channel.name}\n`;
						transcript += `**تاريخ الإغلاق:** ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}\n`;
						transcript += `**أغلقه:** ${interaction.user.tag}\n\n`;
						transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
						
						try {
							const messages = await channel.messages.fetch({ limit: 100 });
							const sortedMessages = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
							
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
						transcript += `✅ تم إغلاق التيكيت بنجاح\n`;
						
						const maxLength = 1900;
						if (transcript.length > maxLength) {
							const parts = [];
							let currentPart = '';
							const lines = transcript.split('\n');
							
							for (const line of lines) {
								if ((currentPart + line + '\n').length > maxLength) {
									if (currentPart) parts.push(currentPart);
									currentPart = line + '\n';
								} else {
									currentPart += line + '\n';
								}
							}
							if (currentPart) parts.push(currentPart);
							
							for (let i = 0; i < parts.length; i++) {
								await user.send({ 
									content: i === 0 ? `📋 **ترانسكريبت تذكرتك في ${interaction.guild.name}**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` : `**جزء ${i + 1}:**`,
									embeds: [new EmbedBuilder().setDescription(parts[i]).setColor(0x5865F2).setTimestamp()]
								}).catch(() => {});
							}
						} else {
							await user.send({ 
								embeds: [
									new EmbedBuilder()
										.setColor(0x5865F2)
										.setTitle('📋 تم إغلاق تذكرتك')
										.setDescription(`**السيرفر:** ${interaction.guild.name}\n**القناة:** ${channel.name}\n**تاريخ الإغلاق:** ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}\n**أغلقه:** ${interaction.user.tag}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${transcript}`)
										.setTimestamp()
										.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
								]
							}).catch(() => {});
						}
					}
				}
				await interaction.editReply({ content: '✅ سيتم حذف التيكيت.' });
				await channel.delete().catch(() => {});
			} catch (e) {
				console.error('Error closing ticket:', e);
				await interaction.editReply({ content: '❌ تعذر حذف التيكيت.' }).catch(() => {});
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
	
	if (message.channel.id === '1434534543133507614') {
		try {
			const gifUrl = 'https://media.discordapp.net/attachments/1397095407745499196/1429784555220369408/standard_1.gif?ex=690fc9e2&is=690e7862&hm=d4ac6478cb2f2716d75d54a0fce1d773a9cf00ed363f3eb465df589e06e1d859&=&width=2797&height=163';
			await message.channel.send({ content: gifUrl });
		} catch (err) {
			console.error('Failed to send gif:', err);
		}
	}
	
	if (message.content.trim() === 'فراغ') {
		const allowed = ROLE_IDS.some(id => message.member?.roles.cache.has(id));
		if (!allowed) return;
		const text = `.✦  　　　　　　　　　　.　　　　　　　　　✦ 　　　　. 　　　　　　　　　✦ 　　　　　❀ ‏Ezz ❀　　       　✦    　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦ 　   　　　,　　　　　　　　　*　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　　　　　　　　　.　　　　　 　　 　　　.　　　　　　　　　✦ 　　　　 　           　　　　　　　　　　　　　　❀ ‏Ezz ❀　　　　　˚　　　✦  　   　　　　,　　　　　　　　　　　       　    　　　　　　　　　　　　　　　　.　　　✦   　　    　　　　　 　　　　　.　　　　　　　　　　　　　.　　　　　　　　　　　　　*　　　　　　　　　. 　　　　　　　　　　.　　　　　　✦ 　　　　　　　❀ ‏Ezz ❀ ✦  　　　　　　　　　　　　　　　　       　   　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦  　   　　　,　　　　　　　　　*　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　✦ 　　　　　　　　.　　　　　 　　 　　　.　　❀ ‏Ezz ❀　　　　　　　　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　　 　✦    　　　　,　　　　　　　　✦ 　　　       　    　　　　　　　　　　　　　　　　.　　　  　　 ✦    　　　　　 　　　　　.　　　　　　　　　　　　　.　　　　　　　　　　　　　　　* 　　   　　　　　 ✦　　　　　　　　　　. 　　　　　　　　　　.　　　　　✦ 　　　　　　　　.❀ ‏Ezz ❀ 　　　　　　　　　　　　　　　　       　   　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　       ✦  　   　　　,　　　　　　　　　❀ ‏Ezz ❀　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　　　　　　　　　.　　　　　 　　 　　　.　　　　　　　✦ 　　　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　　 　   　　　　,　　　　　　　　　　　       　    　　　　　　　　　　　　　　　　.　　　  　　    　　　　　 　　　　　.　　　　　　　　　　　　❀ ‏ ❀ ‏Ezz　.　　　　　　　　　　　　　　　* 　　   　　　　　 ✦*　　　　　　　　　.✦  　　　　　　  　　　　.　　　　　　　　　✦ 　　　　. 　　　　　　　　　✦ 　　　　　　　       　✦    　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦  　   　　　,　　　‏Ezz ❀ ‏ ❀　　　　　　*　　     　　　　 　　,　　　‍ ‍ ‍ ‍ 　 　　　　　　　　　　　　.　　　　　 　　 　　　.　　　　　　　　    ✦ 　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　 ✦  　   　　　　,　　　　　 　　　　　　       　    　　　　　　　　　　　　　　　　.　　　✦   　　    　　　　　 　　　　　.　　　　　　　　　　　　　.　　　　　　　　　　‏Ezz ❀ ‏❀　　　*　　　　　　　　　. 　　　　　　　　　　.　　　　　　  : ✦ 　　　　　　　.✦  　　　　　　　　　　　　　　　　       　   　　　　 　　　　　　　　　　　　　　　　       　   　　　　　　　　　　　　　　　　       　    ✦  　   　　　,　　　　❀ ‏Ezz ❀　　　　　*　　     　　　　 　　,　　　 ‍ ‍ ‍ ‍ 　 　　　　✦ 　　　　　　　　.　　　　　 　　 　　　.　　　　　　　　 　　　　　 　           　　　　　　　　　　　　　　　　　　　˚　　　 　✦    　　　　,　　　　　　　　✦ 　　　       　    　　　　　　　　　　　　.　　　❀ Ezz  ❀`;
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
