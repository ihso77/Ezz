import { SlashCommandBuilder, ChannelType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

const PANEL_IMAGE = 'https://media.discordapp.net/attachments/1397093949071687700/1433739302856294461/Picsart_25-10-16_13-18-43-513.jpg?ex=6905c947&is=690477c7&hm=cc9c64f687d99cf07fc18e898d1eaaf70f27b472a0fe9901069c9be26cd69f9e&=&format=webp&width=2797&height=933';
const TARGET_CHANNEL_ID = '1397022592954663016';
const ALLOWED_ROLES = ['1428103206705172673', '1418942792121585724'];

export default {
	data: new SlashCommandBuilder()
		.setName('send-ticket-panel')
		.setDescription('إرسال لوحة التيكيت في القناة المحددة'),
	execute: async interaction => {
		const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
		if (!member || !ALLOWED_ROLES.some(r => member.roles.cache.has(r))) {
			return interaction.reply({ content: 'ليس لديك الصلاحية لاستخدام هذا الأمر.', ephemeral: true });
		}
		const channel = await interaction.guild.channels.fetch(TARGET_CHANNEL_ID).catch(() => null);
		if (!channel || channel.type !== ChannelType.GuildText) {
			return interaction.reply({ content: 'القناة المحددة غير موجودة أو غير صالحة.', ephemeral: true });
		}
		const embed = new EmbedBuilder()
			.setColor(0x808080)
			.setTitle('تذكره الدعم الفني')
			.setImage(PANEL_IMAGE);

		const select = new StringSelectMenuBuilder()
			.setCustomId('ticket_select')
			.setPlaceholder('اختر نوع التذكرة')
			.addOptions([
				
				{ label: 'ريوارد', value: 'reward', emoji: { id: '1434107495722520617', name: '1531vslgiveaway' } },
			]);
		const row = new ActionRowBuilder().addComponents(select);

		// try to find existing panel and edit it
		const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
		const existing = messages?.find(m => m.author.id === interaction.client.user.id && m.components?.some(r => r.components?.some(c => c.customId === 'ticket_select')));
		if (existing) {
			await existing.edit({ embeds: [embed], components: [row] });
			return interaction.reply({ content: 'تم تحديث لوحة التذاكر.', ephemeral: true });
		}
		await channel.send({ embeds: [embed], components: [row] });
		await interaction.reply({ content: 'تم إرسال لوحة التذاكر.', ephemeral: true });
	},
};

