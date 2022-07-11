const {SlashCommandBuilder} = require('@discordjs/builders')
const {MessageEmbed} = require('discord.js')
const dotenv = require('dotenv')

//Determine facility
function determineRoles(user, discRoles) {
    // console.log(user)
    // console.log(user.visiting_facilities)
    // console.log(user.facility)
    if (user.facility === 'ZLC') { //roles for ZLC members
        if (user.rating_short === 'OBS')
            discRoles.push('Observer')
        else 
            discRoles.push('ZLC Specialist')
        return discRoles //EXIT FUNCTION HERE
    }

    if (user.visiting_facilities.length == 0) { //if visiting nowhere, can't be a visitor
        if (['ZMP', 'ZSE', 'ZOA', 'ZLA', 'ZDV', 'ZHQ'].includes(user.facility))
            discRoles.push('ZLC Neighbor')
        else
            discRoles.push('Guest')
        return discRoles //exit here
    }

    const visitingFacilities = user.visiting_facilities.map(fac => fac.facility) //thanks allie
    //console.log(visitingFacilities)
    if (visitingFacilities.includes('ZLC'))
        discRoles.push('ZLC Visitor')
    if (['ZMP', 'ZSE', 'ZOA', 'ZLA', 'ZDV', 'ZHQ'].includes(user.facility))
        discRoles.push('ZLC Neighbor')
    else 
        discRoles.push('Guest')
    return discRoles
}

dotenv.config()

module.exports = {
  name       : 'giveroles',
  description: 'Assign Roles from Linked Account',
  data       : new SlashCommandBuilder()
    .setName('giveroles')
    .setDescription('Assign roles for channel access. Your Discord account must be linked on the VATUSA website.'),
  execute (interaction, id, res, g) {
    //Initialize Vars
    const {MessageEmbed} = require('discord.js'),
          axios          = require('axios'),
          https          = require('https'),
          guild          = g ? g : interaction.guild

    let req = axios
    //Check for dev API
    // console.log('\nprocess:\n' + process)
    // console.log('\nprocess.env:\n' + process.env)
    if (process.env.apiUrl.indexOf('dev') > -1) {
      req = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        }),
        params: {
            apikey: process.env.apiKey
        }
      })
    }

    //Make the API Call to determine user information
    req.get(process.env.apiUrl + 'user/' + interaction.member.id + '?d')
      .then(result => {
          //console.log(result)
          const {status, data} = result
          if (status !== 200) {
            sendError(interaction, MessageEmbed, 'Unable to communicate with API.', res)
          } else {
            const user = data.data
// console.log(interaction.member)
            //Instantiate Variables
            const member  = interaction.member
            let discRoles      = [],
                newNick    = member.nickname,
                nickChange = false
            if (member.permissions.has('ADMINISTRATOR')){
                return sendError(interaction, MessageEmbed, `Since you have an administrator role, your roles could not be automatically updated.`)
            }
            
            discRoles = determineRoles(user, discRoles)
            //Determine Nickname
            //console.log(discRoles)
            for (let i = 0; i <discRoles.length; i++) {
                if (discRoles[i] === 'ZLC Specialist') {
                    newNick = `${user.fname} ${user.lname} | ${user.rating_short}`
                } else if (discRoles[i] === 'ZLC Visitor') {
                    newNick = `${user.fname} ${user.lname} | ${user.rating_short} | ${user.facility}`
                } else if (discRoles[i] === 'ZLC Neighbor') {
                    newNick = `${user.fname} ${user.lname} | ${user.rating_short} | ${user.facility}`
                } else if (discRoles[i] === 'Observer') {
                    newNick = `${user.fname} ${user.lname} | ${user.rating_short}`
                } else if (discRoles[i] === 'Guest') {
                    newNick = `${user.fname} ${user.lname} | ${user.rating_short} | ${user.facility}`
                }
            }
            //Assign Nickname
            if (newNick !== member.nickname) {
                nickChange = true
                member.setNickname(newNick, 'Role Synchronization').then((rtnMember)=> {console.log(rtnMember)}).catch(e => console.error(e))
            }
            //Assign Roles
            let roleStr = '',
                excluded = ['Training Staff', 'Assistant Staff', 'Staff', 'Nitro Booster', 'Media', 'Event Controller', 'God Save the Queen']
            member.roles.cache.forEach(role => {
                if (role.id !== guild.roles.everyone.id
                    && excluded.indexOf(role.name) < 0
                    && discRoles.indexOf(role.name) < 0)
                    member.roles.remove(role).catch(e => console.error(e))
            })
            for (let i = 0; i < discRoles.length; i++) {
                const role = guild.roles.cache.find(role => role.name === discRoles[i])
                member.roles.add(role).catch(e => console.error(e))
                roleStr += `${role} `
            }
            if (res)
                return res.json({
                    status: 'OK',
                    msg: `Your roles have been assigned, ${newNick}!<br><em>${discRoles.join(', ')}</em>`
                })
            const embed = new MessageEmbed()
                .setTitle('Your roles have been assigned.')
                .setColor(0x5cb85c)
                .setDescription(roleStr)
            embed.setFooter(`Your new nickname is: ${newNick}`)
            interaction.reply({embeds: [embed]})
          }
        }
      )
      .catch(error => {
          console.error(error)
          if (error.response.status === 404) {
              sendError(interaction, MessageEmbed, 'Your Discord account is not linked on VATUSA. Link it here: https://vatusa.net/my/profile', res, false, 'Not Linked')
          } else sendError(interaction, MessageEmbed, error.data !== undefined ? error.data.toJSON() : 'Unable to communicate with API.', res)
        })
    }
}

function sendError (interaction, me, msg, res, footer = true, header = false) {
    if (res)
        return res.json({
            status: 'error',
            msg: msg
        })
    const embed = new me()
        .setTitle(header ? header : 'Error!')
        .setColor(0xFF0000)
        .setDescription(msg)
    if (footer) embed.setFooter("Please try again later")
    interaction.reply({embeds: [embed]})
}