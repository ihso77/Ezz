import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('check-permissions')
		.setDescription('عرض صلاحيات العضو الحالية')
		.addUserOption(o => o.setName('user').setDescription('العضو')),
	execute: async interaction => {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const member = await interaction.guild.members.fetch(user.id).catch(() => null);
		if (!member) return interaction.reply({ content: 'لا يمكن إيجاد العضو.', ephemeral: true });
		const perms = member.permissions.toArray();
		const pretty = perms.map(p => p.replaceAll('_', ' ').toLowerCase()).join(', ') || 'لا توجد صلاحيات خاصة';
		const embed = new EmbedBuilder().setTitle(`صلاحيات ${user.tag}`).setDescription(pretty);
		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
