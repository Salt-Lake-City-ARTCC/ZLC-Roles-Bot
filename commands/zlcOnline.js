const Discord = require('discord.js');
const Vatsim = require('../utils/vatsimdataparser');
const {SlashCommandBuilder} = require('@discordjs/builders');
const zlcCallsignList = ['SLC_', 'BOI_', 'BZN_', 'BIL_', 'GTF_', 'HLN_', 'TWF_', 'MSO_', 'PVU_', 'OGD_', 'GPI_', 'SUN_', 'IDA_', 'JAC_', 'PIH_'];
const partialCallSign = zlcCallsignList;

module.exports = {
    name       : 'zlconline',
    description: 'Display online ZLC members',
    data       : new SlashCommandBuilder()
        .setName('zlconline')
        .setDescription('Display a list of all online ZLC controllers'),
    execute (interaction) {
        zlcOnline(interaction)
        }
};

async function zlcOnline(interaction) {
    if (interaction.guild && !interaction.channel.permissionsFor(interaction.guild.me).has('EMBED_LINKS')) {
        await interaction.reply(
            `The bot does not have permissions to send Embeds in this channel. Please enable that permission.`
        );
    }

    const vatsimEmbed = new Discord.MessageEmbed()
        .setTitle(`ZLC Online Controllers`)
        .setColor('#0bd721')
        .setFooter(`Source: VATSIM API`)
        .setTimestamp();

    try{
        const { atcList } = await Vatsim.getPartialAtcClientInfo(partialCallSign);

        atcList.forEach((atc) => {
            vatsimEmbed.addField(`${atc.callSign}`, `Name: ${atc.name}, Frequency: ${atc.frequency}`);
        });
    } catch (error) {
        vatsimEmbed.setColor('#ff0000').setDescription(`${error.message}`);
    }
    interaction.reply({embeds: [vatsimEmbed]});
    
}