import { SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('عرض صورة البروفايل لعضو')
		.addUserOption(o => o.setName('user').setDescription('العضو')),
	execute: async interaction => {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const url = user.displayAvatarURL({ size: 1024, extension: 'png' });
		await interaction.reply({ content: url, ephemeral: false });
	},
};
