/* WEB SOCKETS AND STREAM ELEMENTS SECTION */
/////////////////////////////////////////////
console.log(`In Mode: ${process.env.NODE_ENV}`);

const JWT = require('./token.js');
const db = require('./models'); // new require for db object

////////// STREAMER.BOT WEBSOCKET CLIENT //////////////
const WS = require('ws');

const ws = new WS.WebSocket('ws://127.0.0.1:8081/');

ws.on('open', function open() {
  console.log("SB Socket connected");
});

ws.on('message', function message(data) {
  console.log('received: %s', data);
});

function SBDoAction(name) {
  ws.send('{\
    "request": "DoAction",\
    "action": {\
      "name": "' + name + '"\
    },\
    "id": "1",\
  }');
}

function resetCountupTimer() {
  SBDoAction('resetCountupTimer')
}

function stopCountupTimer() {
  SBDoAction('stopCountupTimer')
}

function startCountupTimer() {
  SBDoAction('startCountupTimer')
}

function hideCountupTimer() {
  SBDoAction('hideCountupTimer')
}

function showCountupTimer() {
  SBDoAction('showCountupTimer')
}

////////// END STREAMER.BOT WEBSOCKET CLIENT //////////////


const io = require("socket.io-client");

const SEsocket = io('https://realtime.streamelements.com', {
    transports: ['websocket']
});

// Socket connected
SEsocket.on('connect', SEonConnect);

// Socket got disconnected
SEsocket.on('disconnect', SEonDisconnect);

// Socket is authenticated
SEsocket.on('authenticated', SEonAuthenticated);

SEsocket.on('event', (data) => {
    console.log("==> event");
    handleRealEvent(data);
});
SEsocket.on('event:test', (data) => {
    console.log("==> event:test");
    if (process.env.NODE_ENV == "test")
        handleTestEvent(data);
});
SEsocket.on('event:update', (data) => {
    console.log("==> event:update");
    console.log(data);

    handleRealEventUpdate(data);
});
SEsocket.on('event:reset', (data) => {
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

        // force to lowercase
        if (name !== undefined)
          name = name.toString().toLowerCase();
        if (sender !== undefined)
          sender = sender.toString().toLowerCase();
        if (gifted !== undefined)
          gifted = gifted.toString().toLowerCase();

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

        name = name.toString().toLowerCase();
        
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
        name = name.toString().toLowerCase();
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
      // force to lowercase
      if (name !== undefined)
        name = name.toString().toLowerCase();
      if (sender !== undefined)
        sender = sender.toString().toLowerCase();
      if (gifted !== undefined)
        gifted = gifted.toString().toLowerCase();

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

        /* Create a database entry for the buyer or update their tip */
        var { name, message } = ev;

        name = name.toString().toLowerCase();
        console.log(`${name} tipped $${amount}`);
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
        // force to lowercase
        if (name !== undefined)
          name = name.toString().toLowerCase();
        if (sender !== undefined)
          sender = sender.toString().toLowerCase();
        if (gifted !== undefined)
          gifted = gifted.toString().toLowerCase();

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
        name = name.toString().toLowerCase();

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
        name = name.toString().toLowerCase();
        
        console.log(`${name} cheered ${amount} bits`);

        /* Create a database entry for the buyer or update their bits */
        db.Bit.create({ name, amount, message })
        .catch((err) => {
            console.log('***There was an error creating a Bit db entry', JSON.stringify(contact))
            return res.status(400).send(err)
        });
    }
}

function SEonConnect() {
    console.log('Successfully connected to the websocket');
    SEsocket.emit('authenticate', {
        method: 'jwt',
        token: JWT
    });
}

function SEonDisconnect() {
    console.log('Disconnected from websocket');
    // Reconnect
}

function SEonAuthenticated(data) {
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
  if (pathname == '/bazz/mediaState')
  {
    console.log(`GetMediaState() => source: '${query.source}'`);
    obs.send('GetMediaState', {
        'sourceName': query.source,
    })
    .then((data) => {
      console.log(`${data.mediaState}`);
      response = data.mediaState;
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
    });
  }
  else if (pathname == '/bazz/mediaTime')
  {
    console.log(`GetMediaTime() => source: '${query.source}'`);
    obs.send('GetMediaTime', {
        'sourceName': query.source,
    })
    .then((data) => {
      console.log(data);
      response = data;
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
    });
  }
  else if (pathname == "/bazz/ExerciseRemote")
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
  else if (pathname == '/bazz/twitchClips')
  {
    response = '<iframe \
   src="https://clips.twitch.tv/embed?clip=FamousConcernedOwlPMSTwin-K7pk_farGkktmfk0&parent=localhost&parent=bazz1.com" width="1080" height="1080" allowfullscreen="true"> \
    </iframe>'
  }
  else if (query.cmd === "nukem")
  {
    response = nukem();
  }
  else if (query.cmd === "setmsg")
  {
    //response = query.msg;
    SetTextGDIPlusText("msg", query.msg);
    response = 'Set the message to "' + query.msg + '"!'
  }
  else if (query.cmd === "setfilter")
  {
    /* Color Source Settings look like:
      sourceSettings: { color: 268435711, height: 1080, width: 1920 }
    */
    const alpha = 16
    const hold = 10000
    var sourceSettings = { color: 0 }
    var sourceName = "ColorOverlay"

    console.log(query)

    // console.log(await GetSourceSettings(sourceName))
    // #FF0000FF ( ALPHA | B | G | R )
    // Convert eg. #FF0000 => #FF0000FF

    if ( query.color.toLowerCase() === "off" )
    {
      //await SetSourceVisibility("overlay", sourceName, false)
      response = "Turned off Color Filter"
    }
    else if ( query.color.toLowerCase() === "rainbow" )
    {
      response = "Activating RAINBOW filter for " + hold / 1000 + " seconds!"
      var intervalID = setInterval( doRainbow, 350);
      setTimeout(function() { clearInterval(intervalID) }, hold);
    }
    else
    {
      var o = hex2rgb(query.color);
      if (o === false) {
        o = hex2rgb(wordToHexColor(query.color))
        if (o === false) {
          response = 'Enter valid hex code for input.  E.g. #f0db4f, rainbow, green. Input: ' + query.color
        }
        else
        {
          sourceSettings.color = alpha << 24 | (o.b << 16) | (o.g << 8) | (o.r << 0);
          SetSourceSettings(sourceName, sourceSettings)
          //await SetSourceVisibility("overlay", sourceName, true)
          response = "Set Color Filter to " + query.color + " for " + hold / 1000 + " seconds"
        }
      }
      else
      {
        sourceSettings.color = alpha << 24 | (o.b << 16) | (o.g << 8) | (o.r << 0);
        SetSourceSettings(sourceName, sourceSettings)
        //await SetSourceVisibility("overlay", sourceName, true)
        response = "Set Color Filter to " + query.color
      }
    }
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
///////////COUNTUP TIMER REMOTE////////////
  else if (query.cmd === "resetCountupTimer") {
    resetCountupTimer();
    response = '';
  }
  else if (query.cmd === "stopCountupTimer") {
    stopCountupTimer();
    response = '';
  }
  else if (query.cmd === "startCountupTimer") {
    startCountupTimer();
    response = '';
  }
  else if (query.cmd === "hideCountupTimer") {
    hideCountupTimer();
    response = '';
  }
  else if (query.cmd === "showCountupTimer") {
    showCountupTimer();
    response = '';
  }
///////////////////////////////////////////
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

function GetSourceSettings(source)
{
    let retry;
    let retry_times = 2;
    let result = 0;

    do {
        retry = false;
        console.log('GetSourceSettings() => source: ' + `'${source}'`);
        result = obs.send('GetSourceSettings', {
            'sourceName': source
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
    return result;
}
// Helper function for setfilter
function hex2rgb(hex) {
  var validHEXInput = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!validHEXInput) {
      return false;
  }
  var output = {
    r: parseInt(validHEXInput[1], 16),
    g: parseInt(validHEXInput[2], 16),
    b: parseInt(validHEXInput[3], 16),
  };
  return output;
}

function wordToHexColor(color) {
  var colours = {
      "aliceblue":"#f0f8ff", "antiquewhite":"#faebd7", "aqua":"#00ffff", "aquamarine":"#7fffd4", "azure":"#f0ffff",  "beige":"#f5f5dc", "bisque":"#ffe4c4", "black":"#000000", "blanchedalmond":"#ffebcd", "blue":"#0000ff", "blueviolet":"#8a2be2", "brown":"#a52a2a", "burlywood":"#deb887",  "cadetblue":"#5f9ea0", "chartreuse":"#7fff00", "chocolate":"#d2691e", "coral":"#ff7f50", "cornflowerblue":"#6495ed", "cornsilk":"#fff8dc", "crimson":"#dc143c", "cyan":"#00ffff",  "darkblue":"#00008b", "darkcyan":"#008b8b", "darkgoldenrod":"#b8860b", "darkgray":"#a9a9a9", "darkgreen":"#006400", "darkkhaki":"#bdb76b", "darkmagenta":"#8b008b", "darkolivegreen":"#556b2f",  "darkorange":"#ff8c00", "darkorchid":"#9932cc", "darkred":"#8b0000", "darksalmon":"#e9967a", "darkseagreen":"#8fbc8f", "darkslateblue":"#483d8b", "darkslategray":"#2f4f4f", "darkturquoise":"#00ced1",  "darkviolet":"#9400d3", "deeppink":"#ff1493", "deepskyblue":"#00bfff", "dimgray":"#696969", "dodgerblue":"#1e90ff",  "firebrick":"#b22222", "floralwhite":"#fffaf0", "forestgreen":"#228b22", "fuchsia":"#ff00ff",  "gainsboro":"#dcdcdc", "ghostwhite":"#f8f8ff", "gold":"#ffd700", "goldenrod":"#daa520", "gray":"#808080", "green":"#008000", "greenyellow":"#adff2f",
      "honeydew":"#f0fff0", "hotpink":"#ff69b4", "indianred ":"#cd5c5c", "indigo":"#4b0082", "ivory":"#fffff0", "khaki":"#f0e68c",  "lavender":"#e6e6fa", "lavenderblush":"#fff0f5", "lawngreen":"#7cfc00", "lemonchiffon":"#fffacd", "lightblue":"#add8e6", "lightcoral":"#f08080", "lightcyan":"#e0ffff", "lightgoldenrodyellow":"#fafad2",  "lightgrey":"#d3d3d3", "lightgreen":"#90ee90", "lightpink":"#ffb6c1", "lightsalmon":"#ffa07a", "lightseagreen":"#20b2aa", "lightskyblue":"#87cefa", "lightslategray":"#778899", "lightsteelblue":"#b0c4de",  "lightyellow":"#ffffe0", "lime":"#00ff00", "limegreen":"#32cd32", "linen":"#faf0e6",  "magenta":"#ff00ff", "maroon":"#800000", "mediumaquamarine":"#66cdaa", "mediumblue":"#0000cd", "mediumorchid":"#ba55d3", "mediumpurple":"#9370d8", "mediumseagreen":"#3cb371", "mediumslateblue":"#7b68ee",        "mediumspringgreen":"#00fa9a", "mediumturquoise":"#48d1cc", "mediumvioletred":"#c71585", "midnightblue":"#191970", "mintcream":"#f5fffa", "mistyrose":"#ffe4e1", "moccasin":"#ffe4b5", "navajowhite":"#ffdead", "navy":"#000080",  "oldlace":"#fdf5e6", "olive":"#808000", "olivedrab":"#6b8e23", "orange":"#ffa500", "orangered":"#ff4500", "orchid":"#da70d6",  "palegoldenrod":"#eee8aa",
      "palegreen":"#98fb98", "paleturquoise":"#afeeee", "palevioletred":"#d87093", "papayawhip":"#ffefd5", "peachpuff":"#ffdab9", "peru":"#cd853f", "pink":"#ffc0cb", "plum":"#dda0dd", "powderblue":"#b0e0e6", "purple":"#800080",  "rebeccapurple":"#663399", "red":"#ff0000", "rosybrown":"#bc8f8f", "royalblue":"#4169e1",  "saddlebrown":"#8b4513", "salmon":"#fa8072", "sandybrown":"#f4a460", "seagreen":"#2e8b57", "seashell":"#fff5ee", "sienna":"#a0522d", "silver":"#c0c0c0", "skyblue":"#87ceeb", "slateblue":"#6a5acd", "slategray":"#708090", "snow":"#fffafa", "springgreen":"#00ff7f", "steelblue":"#4682b4",   "tan":"#d2b48c", "teal":"#008080", "thistle":"#d8bfd8", "tomato":"#ff6347", "turquoise":"#40e0d0", "violet":"#ee82ee",   "wheat":"#f5deb3", "white":"#ffffff", "whitesmoke":"#f5f5f5", "yellow":"#ffff00", "yellowgreen":"#9acd32"
  };
        
  if (typeof colours[color.toLowerCase()] != 'undefined')
      return colours[color.toLowerCase()];
  return false;
}

function doRainbow()
{
  const alpha = 16
  let sourceSettings = { color: 0 }
  let sourceName = "ColorOverlay"
  let colors = [0xff0000, 0xffff00, 0xff00ff,
                0x00ff00, 0x00ffff, 0x0000ff]
  if( typeof doRainbow.counter == 'undefined' || doRainbow.counter == colors.length) {
    doRainbow.counter = 0;
  }

  //console.log("counter = " + doRainbow.counter)

  let o = colors[doRainbow.counter]
  //console.log("o = " + o)
  sourceSettings.color = (alpha << 24) | o
  //console.log("final color = " + sourceSettings.color)
  SetSourceSettings(sourceName, sourceSettings)

  doRainbow.counter++;
}

function SetSourceSettings(sourceName, sourceSettings)
{
    let retry;
    let retry_times = 2;
    let result = 0;

    do {
        retry = false;
        console.log('SetSourceSettings() => sourceName: ' + `'${sourceName}'`);
        result = obs.send('SetSourceSettings', {
            'sourceName': sourceName,
            'sourceSettings': sourceSettings
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
    return result;
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










