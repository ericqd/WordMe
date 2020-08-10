const Discord = require('discord.js')
const client = new Discord.Client()
const {token,prefix} = require("./config.json")
const fetch = require('node-fetch')
require('dotenv').config()
const key = process.env.API_KEY

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
    
    client.user.setActivity("with JavaScript")

    client.guilds.cache.forEach((guild) => {
        console.log(guild.name)
        guild.channels.cache.forEach((channel) => {
            console.log(` - ${channel.name} ${channel.type} ${channel.id} `)
        })
        //general text channel id: 739256319541772312
    })
    let generalChannel = client.channels.cache.get("739256319541772312");
    generalChannel.send("Thanks for adding me to your server. To get started type !commands to see what type of commands I have to offer.")
})

client.on('message', (receivedMessage) =>{
    if(receivedMessage.author == client.user){
        return
    }
    if(receivedMessage.content.startsWith("!")){
        processCommand(receivedMessage)
    }
})

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.splice(1)

    if(primaryCommand == "help"){
        helpCommand(arguments, receivedMessage)
    }
    else if(primaryCommand == "wotd"){
        wotdCommand(arguments, receivedMessage)
    }
    else if(primaryCommand =="search"){
        searchCommand(arguments,receivedMessage)
    }
    else if(primaryCommand == "random"){
        randomCommand(arguments, receivedMessage)
    }
    else if(primaryCommand == "commands"){
        commands(arguments,receivedMessage)
    }
    else{
        receivedMessage.channel.send("Unknown Command. Try `!commands`")
    }
}

function wotdCommand(arguments,receivedMessage){
    fetch(`https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=${key}`)
        .then(res => res.json())
        .then(data => receivedMessage.channel.send("Word of the day: " + data.word + "\n" + "Definition: " + data.definitions[0]["text"]))
        .catch(error => receivedMessage.channel.send("error"))
}
function searchCommand(arguments, receivedMessage){
    if(arguments.length < 1){
        receivedMessage.channel.send("You must enter a word to search")
        return
    }
    if(arguments.length > 1){
        receivedMessage.channel.send("Opps looks like you entered multiple words. Try again with just one")
        return
    }
    fetch(`https://api.wordnik.com/v4/word.json/${arguments}/definitions?limit=200&includeRelated=false&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=${key}`)
        .then(res => res.json())
        .then(data => receivedMessage.channel.send("Word: " + data[0]["word"] + "\n" + "Part of Speech: " + data[0]["partOfSpeech"] + "\n" + "Definition: " + data[0]["text"]))
        .catch(error => console.log("error"))

}
function randomCommand(arguments, receivedMessage){
    fetch(`https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=${key}`)
        .then(res => res.json())
        .then(data => {
            let randWord = data["word"]
            async function main(){
                try{
                    let definition = await fetchData(randWord)
                    console.log(definition)
                    receivedMessage.channel.send("Random Word: " + randWord + "\n" + "Definition: " + definition)
                }catch (err) {
                    console.log(err)
                }
                
            }
            main()
        })
        .catch(error => console.log(error))
}
function commands(arguments, receivedMessage){
    receivedMessage.channel.send("!wotd - gives you the word of the day with a definition" + "\n" + "!search (word to seach) - allows you to search for the meaning of a word" + "\n" + "!random - outputs a random word and a definition" )

}
function helpCommand(arguments, receivedMessage){
    if(arguments.length == 0){
        receivedMessage.channel.send("I'm not sure what you need help with. Try `!help [topic]`")
    }
    else{
        receivedMessage.channel.send("It looks like you need help with "  + arguments)
    }
}
async function fetchData(word){
    let res = await fetch(`https://api.wordnik.com/v4/word.json/${word}/definitions?limit=200&includeRelated=false&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=${key}`)
    let data = await res.json()
    data = data[0]["text"]
    return data
}


client.login(token)