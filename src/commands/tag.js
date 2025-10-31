import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('tag')
		.setDescription('إرسال رسالة تتضمن منشن لرتبة محددة')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true))
		.addStringOption(o => o.setName('message').setDescription('الرسالة').setRequired(true)),
	execute: async interaction => {
		const role = interaction.options.getRole('role', true);
		const message = interaction.options.getString('message', true);
		await interaction.reply({ content: `${role} ${message}` });
	},
};
