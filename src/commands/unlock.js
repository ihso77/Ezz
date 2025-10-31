import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('فتح الروم بعد القفل')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addChannelOption(o => o.setName('channel').setDescription('القناة').addChannelTypes(ChannelType.GuildText)),
	execute: async interaction => {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		try {
			await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
			await interaction.reply({ content: `تم فتح ${channel}.`, ephemeral: true });
		} catch {
			await interaction.reply({ content: 'تعذر فتح القناة.', ephemeral: true });
		}
	},
};
