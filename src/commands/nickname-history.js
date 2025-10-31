import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getNicknameHistory } from '../../utils/nicknameStore.js';

export default {
	data: new SlashCommandBuilder()
		.setName('nickname-history')
		.setDescription('عرض تاريخ ألقاب العضو')
		.addUserOption(o => o.setName('user').setDescription('العضو')),
	execute: async interaction => {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const list = getNicknameHistory(interaction.guild.id, user.id);
		if (!list.length) return interaction.reply({ content: 'لا يوجد سجل ألقاب محفوظ لهذا العضو بعد.', ephemeral: true });
		const embed = new EmbedBuilder()
			.setTitle(`سجل الألقاب: ${user.tag}`)
			.setDescription(list.map((n, i) => `${i+1}. ${n}`).join('\n'));
		await interaction.reply({ embeds: [embed] });
	},
};
