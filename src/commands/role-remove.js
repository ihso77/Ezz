import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('role-remove')
		.setDescription('إزالة رتبة من عضو')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
		.addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true)),
	execute: async interaction => {
		const user = interaction.options.getUser('user', true);
		const role = interaction.options.getRole('role', true);
		const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
		if (!member) return interaction.reply({ content: 'لا يمكن إيجاد العضو.', ephemeral: true });
		await member.roles.remove(role).catch(() => null);
		await interaction.reply({ content: `تمت إزالة الرتبة ${role} من ${user.tag}`, ephemeral: true });
	},
};
