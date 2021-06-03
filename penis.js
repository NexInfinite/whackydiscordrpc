import RPC from 'discord-rpc'

const client = new RPC.Client({ transport: 'ipc' })

client.on('ready', () => {
    client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
            assets: {
                large_image: 'panda'
            },
            details: 'Thanks for checking me out! Here are some of my links.',
            buttons: [
                { label: 'More about me!', url: 'https://julians.work' },
                { label: 'Not a rick roll', url: 'https://www.youtube.com/watch?v=DLzxrzFCyOs' }
            ]
        }
      })

    console.log('started!')
})

client.login({clientId: '799353041509285898'}).catch(err => {
    console.log("Couldn't connect lol");
    return false;
});