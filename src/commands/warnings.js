import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { listWarnings } from '../../utils/warningsStore.js';

export default {
	data: new SlashCommandBuilder()
		.setName('warnings')
		.setDescription('عرض تحذيرات عضو')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)),
	execute: async interaction => {
		const user = interaction.options.getUser('user', true);
		const warnings = listWarnings(interaction.guild.id, user.id);
		if (!warnings.length) return interaction.reply({ content: 'لا يوجد تحذيرات.', ephemeral: true });
		const embed = new EmbedBuilder()
			.setTitle(`تحذيرات ${user.tag}`)
			.setColor(0xffaa00)
			.setDescription(warnings.map((w, i) => `#${i+1} • ID: ${w.id}\nالسبب: ${w.reason}\nالتاريخ: ${w.date}`).join('\n\n'));
		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
