# mk8dx-track-stats
Collects and formats some statistics based on MK8DX track data collected by Toad Bot

## Dependencies
* Node.JS v17.4.0 or later
* [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter)


## How to use
1. Use DiscordChatExporter to export your team's toad bot channel to a text document named `data.txt` using the following search criteria: `from:Toad#7861 track`
2. Save that text document to the same directory as this file
3. Open a terminal in the same directory and run the following command `node compile.js data.txt`
