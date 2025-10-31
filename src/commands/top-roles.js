import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('top-roles')
		.setDescription('عرض أعلى الرتب وعدد الأعضاء في كل رتبة'),
	execute: async interaction => {
		await interaction.guild.roles.fetch();
		await interaction.guild.members.fetch();
		const roles = interaction.guild.roles.cache
			.filter(r => r.name !== '@everyone')
			.map(r => ({ role: r, count: r.members.size }))
			.sort((a,b) => b.count - a.count)
			.slice(0, 15);
		if (roles.length === 0) return interaction.reply({ content: 'لا يوجد رتب.', ephemeral: true });
		const embed = new EmbedBuilder()
			.setTitle('أعلى الرتب')
			.setDescription(roles.map(r => `${r.role} • ${r.count} عضو`).join('\n'));
		await interaction.reply({ embeds: [embed] });
	},
};
