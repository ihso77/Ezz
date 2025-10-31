import { SlashCommandBuilder, ChannelType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

const PANEL_IMAGE = 'https://media.discordapp.net/attachments/1433832273538711612/1433872382216503359/Picsart_25-10-16_13-18-24-693.png?ex=69064537&is=6904f3b7&hm=95742b3e7dab19183c25197b33fc6bc0f8c333462c9237977f79f46b75788ff2&=&format=webp&quality=lossless&width=963&height=320';
const ALLOWED_ROLES = ['1428103206705172673', '1418942792121585724'];
const ADS_CHANNEL_ID = '1397022589825843452';

export default {
	data: new SlashCommandBuilder()
		.setName('setup-tickets-ads')
		.setDescription('إرسال لوحة تيكيت الإعلانات في الروم المحدد'),
	execute: async interaction => {
		const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
		if (!member || !ALLOWED_ROLES.some(r => member.roles.cache.has(r))) {
			return interaction.reply({ content: 'ليس لديك الصلاحية لاستخدام هذا الأمر.', ephemeral: true });
		}
		const channel = await interaction.guild.channels.fetch(ADS_CHANNEL_ID).catch(() => null);
		if (!channel || channel.type !== ChannelType.GuildText) {
			return interaction.reply({ content: 'القناة المحددة غير موجودة أو غير صالحة.', ephemeral: true });
		}
		const embed = new EmbedBuilder()
			.setColor(0x808080)
			.setTitle('تذكره شراء الاعلانات')
			.setImage(PANEL_IMAGE);

		const select = new StringSelectMenuBuilder()
			.setCustomId('ticket_ads_select')
			.setPlaceholder('اختر نوع التذكرة')
			.addOptions([
				{ label: 'شراء اعلانات', value: 'ads', emoji: { id: '1421961116111601755', name: 'IMG_1638' } },
			]);
		const row = new ActionRowBuilder().addComponents(select);

		// try to find existing panel and edit it
		const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
		const existing = messages?.find(m => m.author.id === interaction.client.user.id && m.components?.some(r => r.components?.some(c => c.customId === 'ticket_ads_select')));
		if (existing) {
			await existing.edit({ embeds: [embed], components: [row] });
			return interaction.reply({ content: 'تم تحديث لوحة تيكيت الإعلانات.', ephemeral: true });
		}
		await channel.send({ embeds: [embed], components: [row] });
		await interaction.reply({ content: 'تم إرسال لوحة تيكيت الإعلانات.', ephemeral: true });
	},
};

