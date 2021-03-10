/* WEB SOCKETS AND STREAM ELEMENTS SECTION */
/////////////////////////////////////////////
console.log(`In Mode: ${process.env.NODE_ENV}`);

const JWT = require('./token.js');
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
    handleEvent(data);
});
socket.on('event:test', (data) => {
    console.log("==> event:test");
    if (process.env.NODE_ENV == "test")
        handleEvent(data);
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

function handleEvent(data)
{
    console.log(data);
    if (data.listener == 'subscriber-latest')
    {
        //console.log(data);
        var ev = data.event;
        var buyer = "";
        var amount = 0;
        var gifted = false;
        //var amt = 0; // months subbed or num_giftsubs

        // check if this is NOT a gift sub
        if ( ( !("gifted" in ev) || ev.gifted == false) &&
             ( !("bulkGifted" in ev) || ev.bulkGifted == false))
        {
            buyer = ev.name;
            amount = ev.amount;
            gifted = false;
            console.log(`${buyer} subbed for ${amount} months`);
        }
        else if (("gifted" in ev) && ev.gifted == true) // single gift sub
        {
            buyer = ev.sender;
            // in this case ev.amount = "gift" so do not update the amount variable for the DB,
            // which is only taking integer.
            amount = 1;
            gifted = true;
            console.log(`${buyer} gifted a sub to ${ev.name}`);
        }
        else if (("bulkGifted" in ev) && ev.bulkGifted == true) // Community gift sub
        {
            buyer = ev.sender;
            amount = ev.amount;
            gifted = true;
            console.log(`${buyer} gifted ${ev.amount} gift subs`);
        }

        //console.log(`the buyer is ${buyer}`);

        /* Create a database entry for the buyer or update their entry to state
        they subbed */
        var { name, tier, sender, subExtension, month, message } = ev;
        db.Sub.create({ name, amount, tier, gifted, sender, subExtension, month, message })
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
}

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



//////////////////////////////////////////////////
/* END WEB SOCKETS AND STREAM ELEMENTS SECTION */
/////////////////////////////////////////////////


/* WEBSERVER SECTION  */
/////////////////////////////////////////////

var http = require('http');
var url = require('url');

var Wait = 0;
http.createServer(async function (req, res) {
  var response = "";
  res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if ( req.method === 'OPTIONS' ) {
        res.writeHead(200);
        res.end();
        return;
    }
    else res.writeHead(200, {'Content-Type': 'text/html'});
  var q = url.parse(req.url, true).query;
  if (q.cmd === "nukem")
  {
    /*obs.send('SetCurrentScene', {
        'scene-name': 'Just me (Fade)'
    })*/
    response = nukem();
  }
  else if (q.cmd === "GetPoolMoney")
  {
    response = (await calcPoolMoney()).toString();
    //console.log(response);
  }

  res.end(response);
}).listen(11111);

const OBSWebSocket = require('obs-websocket-js');


const password = require('./pass.js');
const obs = new OBSWebSocket();
obs.connect({
        address: 'localhost:4444',
        password: password
    })
    .then(() => {
        console.log(`Success! We're connected & authenticated.`);

        //return obs.send('GetMute', {'source': 'confetti'});
    })
    //.then(data => {
    //    console.log(`${data.name}: ${data.muted} Available Scenes!`);

        //data.sources.forEach(scene => {
            //if (scene.name !== data.currentScene) {
                //console.log(`${scene.name}`);

                /*obs.send('SetCurrentScene', {
                    'scene-name': scene.name
                });
            //}
        });*/
    //})
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
    });

obs.on('SwitchScenes', data => {
    console.log(`New Active Scene: ${data.sceneName}`);
});

// You must add this handler to avoid uncaught exceptions.
obs.on('error', err => {
    console.error('socket error:', err);
});


function nukem()
{
    var response = "";
    var curtime = new Date();
    if (curtime > Wait)
    {
        Wait = new Date(new Date().getTime() + 30 * 1000);
        function1(false);
        setTimeout(function() { function1(true) }, 100);
        setTimeout(function() { function3(false) }, 400);
        setTimeout(function() { function1(false) }, 8000);
        setTimeout(function() { function3(true) }, 30 * 1000);
    }
    else
    {
        var diff = (Wait - curtime) / 1000;
        response = "On cooldown. " + diff + "s left";
    }

    return response;
}


function function1(vis)
{
    obs.send('SetSceneItemProperties', {
        'scene-name': 'overlay',
        'item': 'confetti',
        'visible': vis
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
    });

    obs.send('SetSceneItemProperties', {
        'scene-name': 'overlay',
        'item': 'explosion1',
        'visible': vis
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
    });

    obs.send('SetSceneItemProperties', {
        'scene-name': 'overlay',
        'item': 'combo breaker',
        'visible': vis
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
    });
}

function function3(vis)
{
    obs.send('SetSceneItemProperties', {
        'scene-name': 'overlay',
        'item': 'emotes',
        'visible': vis
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
    });
}

/* END WEBSERVER SECTION  */
/////////////////////////////////////////////


/* CALC SECTION
////////////////////////////////////////////////*/
//const db = require('./models'); // new require for db object
const DEBUG=true;

async function calcPoolMoney()
{
    // Get total Tier 1 Subs (no gifts)
    // SELECT COUNT(*) FROM Subs WHERE tier="1000" AND gifted=0;
    const prime_subs = await db.Sub.count({
      where: {
        tier: "prime",
        gifted: {
            [db.Sequelize.Op.or]: [false, null],
        }
      }
    }) || 0;
    const tier1_subs = await db.Sub.count({
      where: {
        tier: "1000",
        gifted: {
            [db.Sequelize.Op.or]: [false, null],
        }
      }
    }) || 0;
    const tier2_subs = await db.Sub.count({
      where: {
        tier: "2000",
        gifted: {
            [db.Sequelize.Op.or]: [false, null],
        }
      }
    }) || 0;
    const tier3_subs = await db.Sub.count({
      where: {
        tier: "3000",
        gifted: {
            [db.Sequelize.Op.or]: [false, null],
        }
      }
    }) || 0;

    if (DEBUG)
    {
        console.log(`prime_subs = ${prime_subs}`);
        console.log(`tier1_subs = ${tier1_subs}`);
        console.log(`tier2_subs = ${tier2_subs}`);
        console.log(`tier3_subs = ${tier3_subs}\n`);
    }

    // Get total gifted Tier 1 subs
    // SELECT SUM(amount) FROM Subs WHERE tier="1000" AND gifted=1;
    // Note: The below sum() functions return NaN if there are no values to sum,
    //   so I cast to 0 if NaN with (|| 0)
    const tier1_gsubs = await db.Sub.sum('amount',{
      where: {
        tier: { [db.Sequelize.Op.or]: ["1000", "prime"] },
        gifted: 1
      }
    }) || 0;
    const tier2_gsubs = await db.Sub.sum('amount',{
      where: {
        tier: "2000",
        gifted: 1
      }
    }) || 0;
    const tier3_gsubs = await db.Sub.sum('amount',{
      where: {
        tier: "3000",
        gifted: 1
      }
    }) || 0;

    if (DEBUG)
    {
        console.log(`tier1_gsubs = ${tier1_gsubs}`);
        console.log(`tier2_gsubs = ${tier2_gsubs}`);
        console.log(`tier3_gsubs = ${tier3_gsubs}\n`);
    }

    const prime_money = prime_subs * 2.50;
    const tier1_money = ((tier1_subs + tier1_gsubs) * 2.50);
    const tier2_money = ((tier2_subs + tier2_gsubs) * 5.00);
    const tier3_money = ((tier3_subs + tier3_gsubs) * 10.00);

    if (DEBUG)
    {
        console.log(`prime_money = ${prime_money}`);
        console.log(`tier1_money = ${tier1_money}`);
        console.log(`tier2_money = ${tier2_money}`);
        console.log(`tier3_money = ${tier3_money}\n`);
    }

    // Tips and bits
    const tips = await db.Tip.sum('amount') || 0;
    const bits = await db.Bit.sum('amount') || 0;

    if (DEBUG)
    {
        console.log(`tips = ${tips}`);
        console.log(`bits = ${bits}`);
    }

    // Aggregate all
    const prize_pool_money = prime_money + tier1_money +
        tier2_money + tier3_money + tips + (bits / 100);

    console.log(`Total pool money = ${prize_pool_money}`);
    return prize_pool_money;
}

async function calcEntries(user)
{
    var entries = 0;

    // get their actual sub, if any
    const subs = await db.Sub.findAll({
      where: {
        name: user,
        gifted: {
            [Op.or]: [false, null],
        }
      }
    });

    //console.log(subs);
    subs.forEach(sub => {
        if (sub.tier == "1000" || sub.tier == "prime")
        {
            if (DEBUG) console.log(`Tier 1 or prime Sub, ${sub.amount} months.`);
            entries += 1 * sub.amount;
        }
        else if (sub.tier == "2000")
        {
            if (DEBUG) console.log(`Tier 2 Sub, ${sub.amount} months.`);
            entries += 2 * sub.amount;
        }
        else if (sub.tier == "3000")
        {
            if (DEBUG) console.log(`Tier 3 Sub, ${sub.amount} months.`);
            entries += 3 * sub.amount;
        }
    });

    if (DEBUG) console.log(`entries = ${entries}`);

    // Get total gifted Tier 1 subs
    // SELECT SUM(amount) FROM Subs WHERE tier="1000" AND gifted=1;
    // Note: The below sum() functions return NaN if there are no values to sum,
    //   so I cast to 0 if NaN with (|| 0)
    const tier1_gsubs = await db.Sub.sum('amount',{
      where: {
        tier: "1000",
        gifted: 1,
        sender: user
      }
    }) || 0;
    const tier2_gsubs = await db.Sub.sum('amount',{
      where: {
        tier: "2000",
        gifted: 1,
        sender: user
      }
    }) || 0;
    const tier3_gsubs = await db.Sub.sum('amount',{
      where: {
        tier: "3000",
        gifted: 1,
        sender: user
      }
    }) || 0;

    const tier1_gsubs_entries = (tier1_gsubs * 1),
          tier2_gsubs_entries = (tier2_gsubs * 2),
          tier3_gsubs_entries = (tier3_gsubs * 3);

    if (DEBUG)
    {
        console.log(`tier1_gsubs = ${tier1_gsubs}. tier1_gsubs_entries = ${tier1_gsubs_entries}`);
        console.log(`tier2_gsubs = ${tier2_gsubs}. tier2_gsubs_entries = ${tier2_gsubs_entries}`);
        console.log(`tier3_gsubs = ${tier3_gsubs}. tier3_gsubs_entries = ${tier3_gsubs_entries}\n`);
    }

    entries += tier1_gsubs_entries + tier2_gsubs_entries + tier3_gsubs_entries;
    if (DEBUG) console.log(`entries = ${entries}`);

    // Tips and bits
    const tips = await db.Tip.sum('amount',{
      where: {
        name: user
      }
    }) || 0;

    const tip_entries = tips / 2;
    entries += tip_entries;

    if (DEBUG)
    {
        console.log(`tips = ${tips}. tip_entries = ${tip_entries}`);
        console.log(`entries = ${entries}`);
    }

    const bits = await db.Bit.sum('amount',{
      where: {
        name: user
      }
    }) || 0;

    const bits_entries = Math.floor(bits / 200);

    entries += bits_entries;
    if (DEBUG) console.log(`bits = ${bits}. bits_entries = ${bits_entries}`);


    console.log(`${user} has ${entries} entries`);
}

async function getAllEntrants()
{
    /* SELECT name from Subs WHERE gifted=false UNION
       SELECT sender from Subs WHERE gifted=true UNION
       SELECT name from Tips UNION
       SELECT name from Bits; */
    const names = await db.sequelize.query(
       "SELECT name from Subs WHERE gifted=false OR gifted is null UNION \
        SELECT sender from Subs WHERE gifted=true UNION \
        SELECT name from Tips UNION \
        SELECT name from Bits", { type: db.Sequelize.SELECT });
    //console.log(names);
    return names;
}

//calcPoolMoney();
//calcEntries('ns3c');
//getAllEntrants();










