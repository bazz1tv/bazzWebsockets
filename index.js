JWT = require('./token.js');
const db = require('./models'); // new require for db object

const io = require("socket.io-client");
const socket = io('https://realtime.streamelements.com', {
    transports: ['websocket']
});

// Socket connected
socket.on('connect', onConnect);

// Socket got disconnected
socket.on('disconnect', onDisconnect);

// Socket is authenticated
socket.on('authenticated', onAuthenticated);

socket.on('event', (data) => {
    console.log("==> event");
    console.log(data);
    if (data.listener == 'subscriber-latest')
    {
        //console.log(data);
        var ev = data.event;
        var buyer = "";
        var amount = 0;
        //var amt = 0; // months subbed or num_giftsubs

        // check if this is NOT a gift sub
        if ( ( !("gifted" in ev) || ev.gifted == false) &&
             ( !("bulkGifted" in ev) || ev.bulkGifted == false))
        {
            buyer = ev.name;
            amount = ev.amount;
            console.log(`${buyer} subbed for ${amount} months`);
        }
        else if (("gifted" in ev) && ev.gifted == true) // single gift sub
        {
            buyer = ev.sender;
            // in this case ev.amount = "gift" so do not update the amount variable for the DB,
            // which is only taking integer.
            amount = 1;
            console.log(`${buyer} gifted a sub to ${ev.name}`);
        }
        else if (("bulkGifted" in ev) && ev.bulkGifted == true) // Community gift sub
        {
            buyer = ev.sender;
            amount = ev.amount;
            console.log(`${buyer} gifted ${ev.amount} gift subs`);
        }

        //console.log(`the buyer is ${buyer}`);

        /* Create a database entry for the buyer or update their entry to state
        they subbed */
        var { name, tier, gifted, bulkGifted, sender, subExtension, month, message } = ev;
        db.Sub.create({ name, amount, tier, gifted, bulkGifted,
            sender, subExtension, month, message })
        .catch((err) => {
            console.log('***There was an error creating a Sub db entry', JSON.stringify(contact))
            return res.status(400).send(err)
        });
    }
    else if (data.listener == 'tip-latest')
    {
        //console.log(data);
        var ev = data.event;
        var amount = ev.amount.toFixed(2);
        /* Unfortunately from test emulation alone, there is no way to
        get the currency. So for now I'll be ignoring the currency */
        console.log(`${ev.name} tipped $${amount}`);

        /* Create a database entry for the buyer or update their tip */
        var { name, message } = ev;
        db.Tip.create({ name, amount, message })
        .catch((err) => {
            console.log('***There was an error creating a Tip db entry', JSON.stringify(contact))
            return res.status(400).send(err)
        });
    }
    else if (data.listener == 'cheer-latest')
    {
        //console.log(data);
        var ev = data.event;
        var {name, amount, message} = ev;
        
        console.log(`${name} cheered ${amount} bits`);

        /* Create a database entry for the buyer or update their bits */
        db.Bit.create({ name, amount, message })
        .catch((err) => {
            console.log('***There was an error creating a Bit db entry', JSON.stringify(contact))
            return res.status(400).send(err)
        });
    }
/*

==> event:test
{
  listener: 'subscriber-latest',
  event: {
    type: 'subscriber',
    name: 'Rene',
    amount: 1,
    count: 7,
    isTest: true,
    tier: 'prime',
    gifted: false,
    bulkGifted: false,
    sender: 'Collete',
    items: [ [Object], [Object], [Object], [Object], [Object] ],
    subExtension: false,
    month: 'September',
    message: 'Howdy, my name is Bill'
  }
}

==> event:test
{
  listener: 'subscriber-latest',
  event: {
    type: 'subscriber',
    name: 'Kiah',
    amount: 1,
    count: 1,
    items: [ [Object], [Object], [Object], [Object], [Object] ],
    tier: '1000',
    month: 'March',
    isTest: true,
    message: 'Do not fear a man that spams 1000 memes, instead fear a man that spams a meme 1000 times'
  }
}
*/
    
});
socket.on('event:test', (data) => {
    console.log("==> event:test");
    console.log(data);
    // Structure as on JSON Schema
});
socket.on('event:update', (data) => {
    console.log("==> event:update");
    console.log(data);
    // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-session-update
});
socket.on('event:reset', (data) => {
    console.log("==> event:reset");
    console.log(data);
    // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-session-update
});

//console.log("3");

function onConnect() {
    console.log('Successfully connected to the websocket');
    socket.emit('authenticate', {
        method: 'jwt',
        token: JWT
    });
}

function onDisconnect() {
    console.log('Disconnected from websocket');
    // Reconnect
}

function onAuthenticated(data) {
    const {
        channelId
    } = data;

    console.log(`Successfully connected to channel ${channelId}`);
}