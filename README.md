# mk8dx-track-stats
Collects and formats some statistics based on MK8DX track data collected by Toad Bot

![sample output](https://raw.githubusercontent.com/m-byte918/mk8dx-track-stats/main/sample.png)

## Dependencies
* [Node.JS v17.4.0 or later](https://nodejs.org/en/download/current/)
* [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter)


## How to use
1. Use DiscordChatExporter to export your team's toad bot channel to a text document named `data.txt` using the following search criteria: `from:Toad#7861 track`
2. Save that text document to the same directory as this file
3. Open a terminal in the same directory and run the following commands:
    * `npm install`
    * `node compile.js data.txt`

## Note
* Output is limited by minimum times played (default is 5 races), adjust the `timesPlayedLimit` variable in `compile.js` to see more or less tracks on the table.
* This program is ONLY designed to collect Toad bot data from races where **_the track abbreviation_** was given. If it looks like there is missing data, it is likely that the person doing the /race command did not enter the track abbreviation.
