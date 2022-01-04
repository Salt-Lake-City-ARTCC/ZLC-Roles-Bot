require('dotenv').config(); //initialize dotenv
const { Client, Intents, Collection, ClientUser } = require('discord.js'); // Require the necessary discord.js classes
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS] }); //create new client with intents
const axios = require('axios')
const https = require('https')
client.commands = new Collection()
const fs = require('fs')
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command)
}

//Message Listener
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return //Skip if interaction is not a registered command

    const command = client.commands.get(interaction.commandName)
    if (!command) return //Command does not exist
    try {
      await command.execute(interaction)  //attempt to run command
    } catch (err) {
      console.error(err)
      await interaction.reply({content: 'Unable to execute command. Something broke. :('})
    }
  }
)
//when client is ready...
client.once('ready', () => {
    console.log('Ready!');
});

var memberList = []
async function membersFetch(guildID) {
  const list = client.guilds.cache.get(guildID) //get server info
  if (!list) return console.log("Guild not found.", list) //if no server data, return
  await list.members.fetch() //gather all server members
  console.log(list)
  memberList = list.members.cache.map(member => member.id) //make an array of the ID's of all server members
  //console.log(memberList)
}

setTimeout(() => { membersFetch('511898647013752841'); }, 10000) //fetch member info from server, delay allows data to initialize
setTimeout(() => { memberList.forEach(autoroles(memberid));}, 15000)


function autoroles(userID) {
  let req = axios
  req = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    }),
    params: {
      apikey: process.env.apiKey
    }
  })

  req.get(process.env.apiUrl + 'user/' + userID + '?d')//how to pass member ID?
    .then(result => {
      const {status, data} = result
      if (status !==200) {return
      } else {
        const user = data.data
        const member = 
      }
      
    }) 
}


client.login(process.env.CLIENT_TOKEN); //login bot with token