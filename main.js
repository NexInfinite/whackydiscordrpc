// Script made by NexInfinite, original script made by ThatOneCalculator. Check out our githubs:
// NexInfinite: https://github.com/Nexinfinite
// ThatOneCalculator: https://github.com/thatonecalculator

import RPC from 'discord-rpc'
import axios from 'axios'

// Edit these with your API TOKEN from last https://www.last.fm/api/accounts, the USERNAME of your last fm account,
// your RPC client ID, and the default text (what will be shown when you stop listening to music)

// CHANGE ALL OF THESE
const TOKEN = "lastfmtoken"
const USERNAME = "discordusername"
const CLIENTID = "dsicordclientid"
var defaultText = "(don't get rick rolled)"

// More advanced setup
// If you want a button to say "Listen along", set this to true
const SONGBUTTON = true;
var songButtonDefaultText = "Not a rick roll"
var songButtonDefaultUrl = "https://www.youtube.com/watch?v=DLzxrzFCyOs"  // Lol get rick rolled


// Update the RPC, this should be eddited to fit around your needs
function updateRPC() {
    client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
            assets: {
                large_image: 'panda'  // Name of your icon
            },
            details: 'Thanks for checking me out! Here are some of my links.', // Details section 
            state: stateText,
            // The buttons, max 2
            buttons: [
                { label: 'More about me!', url: 'https://julians.work' },
                { label: songButtonText, url: songButtonUrl }
            ]
        }
    })
}


// The rest of this code here is not needing to be read, but you can read it anyway if you are interested.
// Everything has been commented wheere needing to be.
const client = new RPC.Client({ transport: 'ipc' })
var stateText = defaultText;
var url = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + USERNAME + '&api_key=' + TOKEN + '&format=json';
var songButtonText = songButtonDefaultText
var songButtonUrl = songButtonDefaultUrl


// This is the main function, everything starts from here.
async function main() { 
    // Making a request to last fm and checking if a song is playing. If a song is playing we set the stateText to "playing SONG by ARTIST"
    var result = await makeGetRequest(url);
    if (result[0]) {
        stateText = result[1];
        if (SONGBUTTON) {
            songButtonUrl = result[2];
            songButtonText = "Listen along!";
        }
    }

    // Login to the client, if there is an error its almost always because discord is closed so we make a generic output.
    // Other errors are usually because you've reloaded this script too many times and are on cooldown; for most people this wont crop up.
    client.login({clientId: CLIENTID}).catch(err => {
        console.log("Couldn't connect, discord is not open.");
        return false; // We return false here to make pm2 stop and restart, this is only useful if you use pm2.
    });
} 


// When we login to the client this is run, to make everything streamline its all been put in modules
// The first thing this does is update the RPC and then creates a loop every 15 seconds to check if a song has changes or stopped playing. 
client.on('ready', () => {
    updateRPC();
    console.log('Started!');
    setInterval(checkIfSongUpdated, 15000);  // Loops every 15 seconds to check if a new song is playing or if a song has stopped.
})


// Checks of the song has updated or not
async function checkIfSongUpdated() {
    var stateTextTemp = stateText;
    var result = await makeGetRequest(url); 

    // Check if song title has updated
    if (stateTextTemp != result[1]) {
        // If song title updated, check if its nowplaying, if it is change stateText to "playing SONG by ARTIST", if not change it to defaultText.
        if (result[0]) {
            stateText = result[1];
            if (SONGBUTTON) {
                songButtonUrl = result[2];
                songButtonText = "Listen along!";
            }
            console.log("New song!")
        } else {
            stateText = defaultText;
            if (SONGBUTTON) {
                songButtonText = songButtonDefaultText;
                songButtonUrl = songButtonDefaultUrl;
            }
            console.log("Stop playing music!")
        }

        // Seeing as either music has started or stopped, we must update the RPC.
        updateRPC();
    }
}

// Make request to last fm
function makeGetRequest(path) { 
    // This part was, as always, coppied from stack overflow but it works so who cares?
    return new Promise(function (resolve, reject) { 
        axios.get(path).then( 
            (response) => { 
                var result = response.data; 

                var isPlaying = false;
                var nowPlaying = defaultText;
                var songUrl = "https://www.youtube.com/watch?v=DLzxrzFCyOs";

                // This is where we check if a song is playing, is it is we set the nowPlaying to "Listening to SONG by ARTIST"
                try {
                    if (result['recenttracks']['track'][0]['@attr']['nowplaying'] == "true") {
                        nowPlaying = "Listening to " + result['recenttracks']['track'][0]['name'] + " by " + result['recenttracks']['track'][0]['artist']['#text'];
                        isPlaying = true;
                        songUrl = result['recenttracks']['track'][0]['url']
                    }
                } catch {
                    // Not listening to music...
                }

                resolve([isPlaying, nowPlaying, songUrl]); 
            }, 
                (error) => { 
                console.log(error);
                return false; 
            } 
        ); 
    }); 
} 
  
// Run main to start everything
// Try catch to hopefully fix some issues with last fm crashing
try {
    main(); 
} catch {
    console.log("Some sort of error... restarting!");
}