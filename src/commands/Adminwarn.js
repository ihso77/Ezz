import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addAdminWarning, getAdminWarningCount, resetAdminWarnings } from '../utils/adminWarningsStore.js';

// الرتب المسموحة باستخدام الأمر
const ALLOWED_ROLE_IDS = [
    '1418942792121585724',
    '1386827094096613378',
    '1386826290052464702'
];

export default {
    data: new SlashCommandBuilder()
        .setName('adminwarn')
        .setDescription('تحذير إداري')
        .addUserOption(o => o
            .setName('admin')
            .setDescription('حدد الإداري')
            .setRequired(true))
        .addStringOption(o => o
            .setName('reason')
            .setDescription('سبب التحذير')
            .setRequired(true)
            .addChoices(
                { name: 'لايوجد رابط', value: 'لايوجد رابط' },
                { name: 'لايوجد شعار', value: 'لايوجد شعار' },
                { name: 'آخر', value: 'آخر' }
            )),
    execute: async interaction => {
        // التحقق من الرتب المسموحة
        const member = interaction.member;
        if (!member) {
            await interaction.reply({ content: 'حدث خطأ في جلب معلومات العضو.', ephemeral: true });
            return;
        }

        const hasPermission = ALLOWED_ROLE_IDS.some(roleId => member.roles.cache.has(roleId));
        if (!hasPermission) {
            await interaction.reply({ 
                content: '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.', 
                ephemeral: true 
            });
            return;
        }

        const adminUser = interaction.options.getUser('admin', true);
        const reason = interaction.options.getString('reason', true);

        // التحقق من أن المستخدم المحدد عضو في السيرفر
        const adminMember = await interaction.guild.members.fetch(adminUser.id).catch(() => null);
        if (!adminMember) {
            await interaction.reply({ 
                content: '❌ العضو المحدد غير موجود في السيرفر.', 
                ephemeral: true 
            });
            return;
        }

        // إضافة التحذير
        const warningCount = addAdminWarning(adminUser.id, reason, interaction.user.id);

        // إنشاء embed للتحذير
        const warningEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⚠️ تحذير إداري')
            .setDescription(`تم تحذير الإداري: ${adminUser}\n\n**السبب:** ${reason}\n**عدد التحذيرات:** ${warningCount}/3`)
            .setFooter({ text: `تم التحذير بواسطة: ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [warningEmbed], ephemeral: false });

        // إرسال تحذير بالخاص للإداري
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⚠️ تحذير إداري')
                .setDescription(`عزيزي ${adminUser},\n\nتم تحذيرك من قبل الإدارة.\n\n**السبب:** ${reason}\n**عدد التحذيرات:** ${warningCount}/3\n\n⚠️ إذا وصلت إلى 3 تحذيرات، سيتم فصلك من السيرفر وإزالة جميع رتبك.`)
                .setFooter({ text: 'هذا تحذير من الإدارة' })
                .setTimestamp();

            await adminUser.send({ embeds: [dmEmbed] });
        } catch (dmError) {
            console.error(`فشل إرسال تحذير بالخاص لـ ${adminUser.tag}:`, dmError);
        }

        // التحقق من وصول التحذيرات إلى 3
        if (warningCount >= 3) {
            try {
                // إزالة جميع الرتب
                const rolesToRemove = adminMember.roles.cache.filter(role => role.id !== interaction.guild.roles.everyone.id);
                if (rolesToRemove.size > 0) {
                    await adminMember.roles.remove(rolesToRemove, 'وصل لـ 3 تحذيرات من الإدارة');
                }

                // فصل العضو
                await adminMember.kick('وصل لـ 3 تحذيرات من الإدارة');

                // إرسال رسالة بالخاص
                try {
                    const kickEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('❌ تم فصلك من السيرفر')
                        .setDescription(`عزيزي ${adminUser},\n\nتم فصلك من السيرفر بسبب:\n\n**وصلت إلى 3 تحذيرات**\n\nتم إزالة جميع رتبك.\n\nيمكنك العودة بعد تحسين أدائك.`)
                        .setFooter({ text: 'هذا إجراء من الإدارة' })
                        .setTimestamp();

                    await adminUser.send({ embeds: [kickEmbed] });
                } catch (kickDmError) {
                    console.error(`فشل إرسال رسالة الفصل بالخاص:`, kickDmError);
                }

                // إعادة تعيين التحذيرات
                resetAdminWarnings(adminUser.id);

                // إرسال إشعار في القناة
                const kickNotificationEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🚫 تم فصل إداري')
                    .setDescription(`تم فصل الإداري ${adminUser} (${adminUser.tag})\n\n**السبب:** وصل إلى 3 تحذيرات\n**تم إزالة جميع رتبه**`)
                    .setFooter({ text: `تم الفصل بواسطة: ${interaction.user.tag}` })
                    .setTimestamp();

                await interaction.followUp({ embeds: [kickNotificationEmbed], ephemeral: false });

            } catch (kickError) {
                console.error(`فشل فصل ${adminUser.tag}:`, kickError);
                await interaction.followUp({ 
                    content: `⚠️ تم إضافة التحذير، لكن فشل فصل الإداري. يرجى التحقق من الصلاحيات.`, 
                    ephemeral: true 
                });
            }
        }
    },
};

