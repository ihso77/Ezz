import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { addWarning } from '../utils/warningsStore.js';

export default {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('إعطاء تحذير لعضو')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
		.addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(true)),
	execute: async interaction => {
		const user = interaction.options.getUser('user', true);
		const reason = interaction.options.getString('reason', true);
		const id = addWarning(interaction.guild.id, user.id, reason);
		await interaction.reply({ content: `تم تحذير ${user.tag}. رقم التحذير: ${id}`, ephemeral: true });
	},
};
