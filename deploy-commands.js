const {SlashCommandBuilder} = require('@discordjs/builders');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const fs = require('fs');
const dotenv = require ('dotenv')

dotenv.config()

const commands = [],
    commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	commands.push(require(`./commands/${file}`).data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(process.env.CLIENT_TOKEN);
rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), {body: commands}).then(_ => console.log('Commands were successfully registered!'))
    .catch(console.error)