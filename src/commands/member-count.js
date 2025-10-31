import { SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('member-count')
		.setDescription('عرض عدد الأعضاء الإجمالي في السيرفر'),
	execute: async interaction => {
		await interaction.guild.members.fetch();
		await interaction.reply({ content: `عدد الأعضاء: ${interaction.guild.memberCount}` });
	},
};
