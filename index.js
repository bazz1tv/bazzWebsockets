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
    handleRealEvent(data);
});
socket.on('event:test', (data) => {
    console.log("==> event:test");
    if (process.env.NODE_ENV == "test")
        handleTestEvent(data);
});
socket.on('event:update', (data) => {
    console.log("==> event:update");
    console.log(data);

    handleRealEventUpdate(data);
});
socket.on('event:reset', (data) => {
    console.log("==> event:reset");
    console.log(data);
    // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-session-update
});

function handleRealEventUpdate(data)
{
    // see RealWorldEvents/ for data format

    if (data.name == 'subscriber-latest')
    {
        //console.log(data);
        const ev = data.data;
        var { name, amount, tier, message, sender, gifted } = ev;
        //var amt = 0; // months subbed or num_giftsubs

        // check if this is NOT a gift sub
        if ( ( !("gifted" in ev) || ev.gifted == false) &&
             ( !("bulkGifted" in ev) || ev.bulkGifted == false))
        {
            buyer = ev.name;
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

        //console.log(`the buyer is ${buyer}`);

        /* Create a database entry for the buyer or update their entry to state
        they subbed */
        
        let subExtension = false; // we're not using this table entry anymore. Default to false

        db.Sub.create({ name, amount, tier, gifted, sender, subExtension, message })
        .catch((err) => {
            console.log('***There was an error creating a Sub db entry', JSON.stringify(contact))
            return res.status(400).send(err)
        });
    }
    else if (data.name == 'cheer-latest')
    {
        var {name, amount, message} = data.data;
        
        console.log(`${name} cheered ${amount} bits`);

        /* Create a database entry for the buyer or update their bits */
        db.Bit.create({ name, amount, message })
        .catch((err) => {
            console.log('***There was an error creating a Bit db entry', JSON.stringify(contact))
            return res.status(400).send(err)
        });
    }
    else if (data.name == 'tip-latest')
    {
        //console.log(data);
        var { name, amount, message } = data.data;
        /* Unfortunately from test emulation alone, there is no way to
        get the currency. So for now I'll be ignoring the currency */
        console.log(`${name} tipped $${amount.toFixed(2)}`);

        /* Create a database entry for the buyer or update their tip */
        db.Tip.create({ name, amount, message })
        .catch((err) => {
            console.log('***There was an error creating a Tip db entry', JSON.stringify(contact))
            return res.status(400).send(err)
        });
    }
}

function handleRealEvent(data)
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
}

function handleTestEvent(data)
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

//////////////////////////////////////////////////////////////////////////////
/* OSC !! LED Guitar :O */
const OSC_HOST = '127.0.0.1'
const OSC_PORT = 7000

const { Client: OSCClient, Message: OSCMessage } = require('node-osc');

const oscClient = new OSCClient(OSC_HOST, OSC_PORT);
var oscCurrentLayer = 0, oscCurrentClip = 0

function oscLayerClipConnect(layer, clip)
{
  oscCurrentLayer = layer, oscCurrentClip = clip
  const oscMessage = new OSCMessage(
    '/composition/layers/' + layer + '/clips/' + clip + '/connect', 1);

  oscClient.send(oscMessage, (err) => {
    if (err) {
      console.error(new Error(err));
    }
    //oscClient.close();
  });

  console.log(`layer: '${oscCurrentLayer}', clip: '${oscCurrentClip}'`)
}
/////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////
/* END WEB SOCKETS AND STREAM ELEMENTS SECTION */
/////////////////////////////////////////////////


/* WEBSERVER SECTION  */
/////////////////////////////////////////////


var fs = require('fs'); // to serve static files
var http = require('http');
var url = require('url');
var exCounter = 0;

var Wait = 0;
var response = "";
http.createServer(async function (req, res) {
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
  const {pathname, query, href} = url.parse(req.url, true);
  console.log(`web server request: ${href}`);
  if (pathname == "/bazz/ExerciseRemote")
  {
    let file = __dirname + '/public_html/' + "exerciseRemote.html";
    console.log(`file = '${file}'`)
    try {
      response = fs.readFileSync(file, 'utf8')
      //console.log(data)
    } catch (err) {
      console.error(err)
      response = JSON.stringify(err);
    }
  }
  else if (query.cmd === "nukem")
  {
    response = nukem();
  }
  else if (query.cmd === "GetPoolMoney")
  {
    response = (await calcPoolMoney()).toString();
  }
  else if (query.cmd === "GetLockedTier")
  {
    poolmoney = await calcPoolMoney();
    response = GetLockedTierHelper(poolmoney).toFixed(0);
  }
  else if (query.cmd === "UnlockTier")
  {
    unlockTier();
    response = "Played UnlockTier stuff ;)";
  }
///////////////// EXERCISE REMOTE!!
  else if (query.cmd === "ExerciseStart")
  {
    exCounter = 0;
    SetTextGDIPlusText("Exercise Counter", exCounter.toString())
    SetSourceVisibility("overlay", "Exercise Counter", true)
    response = exCounter.toString(); // "Set Exercise Counter to " + exCounter
  }
  else if (query.cmd === "ExerciseInc")
  {
    SetTextGDIPlusText("Exercise Counter", (++exCounter).toString())
    response = exCounter.toString(); //"Set Exercise Counter to " + exCounter
  }
  else if (query.cmd === "ExerciseEnd")
  {
    exCounter = 0;
    SetSourceVisibility("overlay", "Exercise Counter", false)
    SetTextGDIPlusText("Exercise Counter", exCounter.toString())
    setConfettiExplosion(false)
    setTimeout(function() { setConfettiExplosion(true) }, 100);
    setTimeout(function() { setConfettiExplosion(false) }, 8000);
    response = ''; //"Ended Exercise Timer " + exCounter
  }
/////////////////////////////////////////////////////////
// LED GUITAR STUFFS
  else if (query.cmd === "glava")
  {
    oscLayerClipConnect(2, 9)
    response = "Set Guitar to LAVA MODE!!"
  }
  else if (query.cmd === "glines")
  {
    oscLayerClipConnect(2, 5)
    response = "Set Guitar to LINES MODE!!"
  }
  else if (query.cmd === "gsparkles")
  {
    oscLayerClipConnect(2, 4)
    response = "Set Guitar to SPARKLES MODE!!"
  }
  else if (query.cmd === "gstrobe")
  {
    oscLayerClipConnect(2, 11)
    response = "Set Guitar to STROBE MODE!!"
  }
  else if (query.cmd === "gpulse")
  {
    oscLayerClipConnect(2, 12)
    response = "Set Guitar to PULSE MODE!!"
  }
  else if (query.cmd === "gcam1")
  {
    oscLayerClipConnect(2, 13)
    response = "Set Guitar to CAM1 MODE!!"
  }
  else if (query.cmd === "gpastel")
  {
    oscLayerClipConnect(2, 14)
    response = "Set Guitar to PASTEL MODE!!"
  }
  else if (query.cmd === "gcolor")
  {
    /* DEPENDENCY: in Resolume
     * Link the clip's RGB fields to the Dashboard knobs 1-3 */
    let base = '/composition/layers/' + oscCurrentLayer
    base += '/clips/' + oscCurrentClip + '/dashboard/link'

    const r = parseFloat(query.r),
          g = parseFloat(query.g),
          b = parseFloat(query.b)

    {
      const oscMessage = new OSCMessage(base + '1', r);
      oscClient.send(oscMessage, (err) => {
        if (err) {
          console.error(new Error(err));
        }
      });
    }

    {
      const oscMessage = new OSCMessage(base + '2', g);
      oscClient.send(oscMessage, (err) => {
        if (err) {
          console.error(new Error(err));
        }
      });
    }

    {
      const oscMessage = new OSCMessage(base + '3', b);
      oscClient.send(oscMessage, (err) => {
        if (err) {
          console.error(new Error(err));
        }
      });
    }

    response = `Set layer: '${oscCurrentLayer}', clip: '${oscCurrentClip}' to RGB(${r}, ${g}, ${b})`
  }


  console.log(`Handled '${pathname}', '${query.cmd}'`);

  console.log(`response = '${response}'`);
  res.end(response);
}).listen(11111);

function GetLockedTierHelper(poolmoney)
{
    var i=0;
    const tier = [25, 50, 100, 200, 500, 1000, 2000];
    for (; i < tier.length; i++)
    {
        if (poolmoney < tier[i])
        {
            return (i+1);
        }
    }

    return 0;
}



const OBSWebSocket = require('obs-websocket-js');


const password = require('./pass.js');
const obs = new OBSWebSocket();

function connect_obs(obs)
{
    obs.connect({
        address: 'localhost:4444',
        password: password
    })
    .then(() => {
        console.log(`Success! We're connected & authenticated.`);
    })
    .catch(err => {
        console.log(err);
    });
}

connect_obs(obs);

obs.on('SwitchScenes', data => {
    //console.log(`New Active Scene: ${data.sceneName}`);
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
        setNuke(false);
        setTimeout(function() { setNuke(true) }, 100);
        setTimeout(function() { setEmotes(false) }, 400);
        setTimeout(function() { setNuke(false) }, 8000);
        setTimeout(function() { setEmotes(true) }, 30 * 1000);
    }
    else
    {
        var diff = (Wait - curtime) / 1000;
        response = "On cooldown. " + diff + "s left";
    }

    return response;
}

function SetSourceVisibility(scene, source, vis)
{
    let retry;
    let retry_times = 2;

    do {
        retry = false;
        console.log(`SetSourceVisibility() => scene: '${scene}', source: '${source}', vis: ${vis}`);
        obs.send('SetSceneItemProperties', {
            'scene-name': scene,
            'item': source,
            'visible': vis
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
            if (err.code == 'NOT_CONNECTED')
            {
                connect_obs(obs);
            }
            retry_times++;
            retry = true;
        });
    } while (retry && retry_times >= 0)
}

function SetTextGDIPlusText(source, text)
{
    let retry;
    let retry_times = 2;

    do {
        retry = false;
        console.log('SetTextGDIPlusProperties() => source: ' +
                    `'${source}', text: ${text}`);
        obs.send('SetTextGDIPlusProperties', {
            'source': source,
            'text': text
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
            if (err.code == 'NOT_CONNECTED')
            {
                connect_obs(obs);
            }
            retry_times--;
            retry = true;
        });
    } while (retry && retry_times >= 0)
}


function unlockTier(vis)
{
    setUnlockTierVisibilities(false);
    setTimeout(function() { setUnlockTierVisibilities(true) }, 1000);
    setTimeout(function() { setUnlockTierVisibilities(false) }, 9000);
}

function setUnlockTierVisibilities(vis)
{
    SetSourceVisibility('overlay', 'confetti', vis);
    SetSourceVisibility('overlay', 'explosion1', vis);
}

function setConfettiExplosion(vis)
{
    SetSourceVisibility('overlay', 'confetti', vis);    
    SetSourceVisibility('overlay', 'explosion1', vis);
}

function setNuke(vis)
{
    setConfettiExplosion(vis)
    setComboBreaker(vis)
}

function setComboBreaker(vis)
{
    SetSourceVisibility('overlay', 'combo breaker', vis);
}

function setEmotes(vis)
{
    SetSourceVisibility('overlay', 'emotes', vis);
}

/* END WEBSERVER SECTION  */
/////////////////////////////////////////////


/* CALC SECTION
////////////////////////////////////////////////*/
//const db = require('./models'); // new require for db object
const DEBUG=false;

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










