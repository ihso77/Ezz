import { SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('join-date')
		.setDescription('عرض تاريخ انضمام العضو')
		.addUserOption(o => o.setName('user').setDescription('العضو')),
	execute: async interaction => {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const member = await interaction.guild.members.fetch(user.id).catch(() => null);
		if (!member) return interaction.reply({ content: 'لا يمكن إيجاد العضو.', ephemeral: true });
		await interaction.reply({ content: `${user} انضم منذ: <t:${Math.floor(member.joinedTimestamp/1000)}:R>` });
	},
};
