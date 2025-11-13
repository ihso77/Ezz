import { SlashCommandBuilder, ChannelType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

const PANEL_IMAGE = 'https://cdn.discordapp.com/attachments/1438037917124788267/1438521792296652800/Picsart_25-10-16_13-18-43-513.jpg?ex=69172f51&is=6915ddd1&hm=11fe8fbf7548e562ec12486d86dd5432923a9796582c42275bec8742ca9e157b&';
const TARGET_CHANNEL_ID = '1397022592954663016';
const ALLOWED_ROLES = ['1419306155145953400', '1418942792121585724'];

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
			.setTitle('تذكرة الريوارد')
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

