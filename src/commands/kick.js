import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('طرد عضو من السيرفر')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
		.addStringOption(o => o.setName('reason').setDescription('السبب')), 
	execute: async interaction => {
		const user = interaction.options.getUser('user', true);
		const reason = interaction.options.getString('reason') ?? 'No reason provided';
		const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
		if (!member) return interaction.reply({ content: 'لا يمكن إيجاد العضو.', ephemeral: true });
		if (!member.kickable) return interaction.reply({ content: 'لا أستطيع طرد هذا العضو.', ephemeral: true });
		await member.kick(reason);
		await interaction.reply({ content: `تم طرد ${user.tag} | السبب: ${reason}`, ephemeral: true });
	},
};
