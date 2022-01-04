require('dotenv').config(); //initialize dotenv
const { Client, Intents, Collection } = require('discord.js'); // Require the necessary discord.js classes
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS] }); //create new client with intents

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
      await command.execute(interaction)
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

client.login(process.env.CLIENT_TOKEN); //login bot with token