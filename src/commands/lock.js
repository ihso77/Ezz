import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDescription('قفل الروم ومنع إرسال الرسائل')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addChannelOption(o => o.setName('channel').setDescription('القناة').addChannelTypes(ChannelType.GuildText)),
	execute: async interaction => {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		try {
			await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
			await interaction.reply({ content: `تم قفل ${channel}.`, ephemeral: true });
		} catch {
			await interaction.reply({ content: 'تعذر قفل القناة.', ephemeral: true });
		}
	},
};
