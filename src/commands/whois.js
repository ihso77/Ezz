import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('whois')
		.setDescription('معلومات مفصلة عن العضو')
		.addUserOption(o => o.setName('user').setDescription('العضو')),
	execute: async interaction => {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const member = await interaction.guild.members.fetch(user.id).catch(() => null);
		const presence = member?.presence;
		const status = presence?.status ?? 'offline';
		const activities = presence?.activities?.map(a => `${a.type}: ${a.name}`).join(', ') || '—';
		const roles = member ? member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.toString()).join(', ') || 'لا يوجد' : 'N/A';
		const embed = new EmbedBuilder()
			.setTitle(`Whois: ${user.tag}`)
			.setThumbnail(user.displayAvatarURL({ size: 256 }))
			.addFields(
				{ name: 'الحالة', value: status, inline: true },
				{ name: 'انضم للسيرفر', value: member ? `<t:${Math.floor(member.joinedTimestamp/1000)}:R>` : 'N/A', inline: true },
				{ name: 'إنشاء الحساب', value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>`, inline: true },
				{ name: 'النشاط', value: activities },
				{ name: 'الرتب', value: roles }
			);
		await interaction.reply({ embeds: [embed] });
	},
};
