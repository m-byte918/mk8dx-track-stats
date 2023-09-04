const readLine = require("readline");
const fs = require("fs");
const stream = require("stream");
const { Table } = require("console-table-printer");

// DiscordChatExporter search criteria: "from:Toad#7861 track"

const timesPlayedLimit = 5;
const columnAlignment = "left";

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
    const lines = [];

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
                //spots: [], // 2D array
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
        /*if (difference > 0) {
            trackData[trackName].spots.push(lines[i - 7].match(/\d+/g));
        }*/
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

        trackObj.avgWRace = wRaces.reduce((partialSum, a) => partialSum + a, 0) / wRaces.length || 0;
        trackObj.avgLRace = lRaces.reduce((partialSum, a) => partialSum + a, 0) / lRaces.length || 0;

        trackObj.bestRace = Math.max(...wRaces);
        trackObj.worstRace = Math.min(...lRaces);

        // Prevent from infinite result if there are no winning/losing races
        trackObj.bestRace = isFinite(trackObj.bestRace) ? trackObj.bestRace : 0;
        trackObj.worstRace = isFinite(trackObj.worstRace) ? trackObj.worstRace : 0;

        /*const spotSums = {};
        for (const raceSpots of trackObj.spots) {
            for (const spot of raceSpots) {
                if (!spotSums[spot]) {
                    spotSums[spot] = 0
                }
                ++spotSums[spot];
            }
        }
        for (const spot of Object.keys(spotSums)) {
            spotSums[spot] /= wRaces.length;
        }
        console.log(spotSums);
        console.log(trackObj.spots);*/

        trackObjs.push({ name: trackName, data: trackObj });
    }
    trackObjs.sort((t1, t2) => t2.data.winRate - t1.data.winRate);

    // Format columns
    const plays = `Plays (>=${timesPlayedLimit})`;
    const table = new Table({
        columns: [
            { name: "Rank", alignment: columnAlignment },
            { name: "Track", alignment: columnAlignment },
            { name: "Win%", alignment: columnAlignment },
            { name: "Avg. Score", alignment: columnAlignment },
            { name: "Avg. Win Score", alignment: columnAlignment },
            { name: "Avg. Lose Score", alignment: columnAlignment },
            { name: "Best Race", alignment: columnAlignment },
            { name: "Worst Race", alignment: columnAlignment },
            //{ name: "Best Starting Spots", alignment: columnAlignment },
            { name: plays, alignment: columnAlignment },
        ]
    });

    // Print out the data
    console.log(`Total races scraped: ${totalRaces}, Total wars scraped: ${Math.floor(totalRaces / 12)}`);
    for (let i = 0, rank = 0; i < trackObjs.length; ++i) {
        const track = trackObjs[i];
        if (track.data.timesPlayed < timesPlayedLimit)
            continue;
        let row = {
            "Rank": ++rank,
            "Track": track.name,
            "Win%": Math.round(track.data.winRate) + 0,
            "Avg. Score": Math.round(track.data.avgScore) + 0,
            "Avg. Win Score": Math.round(track.data.avgWRace),
            "Avg. Lose Score": Math.round(track.data.avgLRace),
            "Best Race": Math.round(track.data.bestRace),
            "Worst Race": Math.round(track.data.worstRace),
            //"Best Starting Spots": "uwu",
        }
        row[plays] = track.data.timesPlayed;
        table.addRow(row, { color: (rank % 2 == 0) ? "white" : "cyan" }); // Alternate colors 
    }
    table.printTable();
})();
