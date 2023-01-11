const readLine = require("readline");
const fs = require("fs");
const stream = require('stream');

// DiscordChatExporter search criteria: "from:Toad#7861 track"

const lines = [];
const timesPlayedLimit = 5;

// Read collected toad bot data
function readLines({ input }) {
    const output = new stream.PassThrough({ objectMode: true });
    const rl = readLine.createInterface({ input });
    rl.on("line", line => {
        output.write(line);
    });
    rl.on("close", () => {
        output.push(null);
    });
    return output;
}
const input = fs.createReadStream(process.argv[2]);

(async () => {
    // Read the data
    for await (const line of readLines({ input })) {
        lines.push(line);
    }
    
    // Accumulate the data
    const trackData = { }
    let totalRaces = 0;
    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        if (line !== "Track") {
            continue;
        }
        const trackName = lines[i + 1];
        const difference = parseInt(lines[i - 1]);

        if (!trackData[trackName]) {
            // Create object if it does not exist
            trackData[trackName] = {
                scores: [],
                timesPlayed: 0,
                avgScore: 0,
                winRate: 0,
                avgWRace: 0,
                avgLRace: 0,
                bestRace: 0,
                worstRace: 0,
            }
        }
        trackData[trackName].scores.push(difference);
        ++totalRaces;
    }

    // Collect statistics
    const trackObjs = [];
    for (const trackName of Object.keys(trackData)) {
        const trackObj = trackData[trackName];

        trackObj.timesPlayed = trackObj.scores.length;

        const wRaces = trackObj.scores.filter((n) => n > 0);
        const lRaces = trackObj.scores.filter((n) => n < 0);

        trackObj.winRate = wRaces.length / trackObj.timesPlayed * 100;

        trackObj.avgScore = trackObj.scores.reduce((partialSum, a) => partialSum + a, 0) / trackObj.timesPlayed;

        trackObj.avgWRace = wRaces.reduce((partialSum, a) => partialSum + a, 0) / wRaces.length;
        trackObj.avgLRace = lRaces.reduce((partialSum, a) => partialSum + a, 0) / lRaces.length || 0;

        trackObj.bestRace = Math.max(...wRaces);
        trackObj.worstRace = Math.min(...lRaces);

        trackObjs.push({ name: trackName, data: trackObj });
    }
    trackObjs.sort((t1, t2) => t2.data.winRate - t1.data.winRate);

    // Print out the data
    const tableData = [];
    console.log(`Total races scraped: ${totalRaces}, Total wars scraped: ${Math.floor(totalRaces / 12)}`);
    for (const track of trackObjs) {
        if (track.data.timesPlayed < timesPlayedLimit)
            continue;
        let row = {
            "Track name": track.name,
            "Win rate": Math.round(track.data.winRate) + 0,
            "Average score": Math.round(track.data.avgScore) + 0,
            "Avg. Winning Race": Math.round(track.data.avgWRace),
            "Avg. Losing Race": Math.round(track.data.avgLRace),
            "Best race": Math.round(track.data.bestRace),
            "Worst race": Math.round(track.data.worstRace),
        }
        row[`Times played (>=${timesPlayedLimit})`] = track.data.timesPlayed;
        tableData.push(row);
    }
    console.table(tableData);
})();
