import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('boosters')
		.setDescription('عرض قائمة الداعمين (Boosters) للسيرفر'),
	execute: async interaction => {
		await interaction.guild.members.fetch();
		const boosters = interaction.guild.members.cache.filter(m => m.premiumSince);
		if (boosters.size === 0) return interaction.reply({ content: 'لا يوجد داعمين حالياً.', ephemeral: true });
		const embed = new EmbedBuilder()
			.setTitle('قائمة الداعمين')
			.setDescription(boosters.map(m => `${m} • منذ <t:${Math.floor(m.premiumSinceTimestamp/1000)}:R>`).join('\n'));
		await interaction.reply({ embeds: [embed] });
	},
};
