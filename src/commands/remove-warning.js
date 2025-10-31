import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { removeWarning } from '../../utils/warningsStore.js';

export default {
	data: new SlashCommandBuilder()
		.setName('remove-warning')
		.setDescription('إزالة تحذير من سجل عضو')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
		.addStringOption(o => o.setName('id').setDescription('رقم التحذير').setRequired(true)),
	execute: async interaction => {
		const user = interaction.options.getUser('user', true);
		const id = interaction.options.getString('id', true);
		const ok = removeWarning(interaction.guild.id, user.id, id);
		await interaction.reply({ content: ok ? 'تمت الإزالة.' : 'لم يتم العثور على التحذير.', ephemeral: true });
	},
};
