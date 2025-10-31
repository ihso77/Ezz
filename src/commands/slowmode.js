import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('slowmode')
		.setDescription('تحديد مدة الانتظار بين الرسائل في الروم')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addIntegerOption(o => o.setName('time').setDescription('الثواني (0 لتعطيل)').setRequired(true))
		.addChannelOption(o => o.setName('channel').setDescription('القناة المستهدفة').addChannelTypes(ChannelType.GuildText)),
	execute: async interaction => {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		const time = interaction.options.getInteger('time', true);
		if (!('setRateLimitPerUser' in channel)) return interaction.reply({ content: 'هذه القناة لا تدعم السلو مود.', ephemeral: true });
		await channel.setRateLimitPerUser(Math.max(0, time));
		await interaction.reply({ content: `تم ضبط السلو مود إلى ${Math.max(0,time)} ثانية في ${channel}.`, ephemeral: true });
	},
};
