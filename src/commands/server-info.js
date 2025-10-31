import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('server-info')
		.setDescription('عرض معلومات السيرفر'),
	execute: async interaction => {
		const g = interaction.guild;
		const embed = new EmbedBuilder()
			.setTitle(g.name)
			.addFields(
				{ name: 'الأعضاء', value: String(g.memberCount), inline: true },
				{ name: 'القنوات', value: String(g.channels.cache.size), inline: true },
				{ name: 'تاريخ الإنشاء', value: `<t:${Math.floor(g.createdTimestamp/1000)}:R>` }
			)
			.setThumbnail(g.iconURL({ size: 128 }));
		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
