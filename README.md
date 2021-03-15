What
====

Persistent Stream events tracking (even when stream offline) and
recording into database.

New and Resubs
Gift Subs
Tips
Cheers

How
===

StreamElements Websocket API

TODO
====

1) ANIMATE THE OVERLAY WHEN AN EVENT OCCURS!!
2) 25:35:00
3) Hooking into bazz1.com Sweepstakes page.
4) Web server responses instantly, fires other functions from a setTimeout()

- Make an Event Queue for safer execution of OBS scene / source switching.

New Entrants who tie with others, should be at the bottom of the tie.

Models
======

.\node_modules\.bin\sequelize model:generate --name Sub --attributes name:string,amount:integer,tier:string,gifted:boolean,sender:string,subExtension:boolean,month:string,message:text

.\node_modules\.bin\sequelize model:generate --name Tip --attributes name:string,amount:decimal,message:text

 .\node_modules\.bin\sequelize model:generate --name Bit --attributes name:string,amount:integer,message:text

Scratchpad
==========

$env:NODE_ENV="test"

node .\index.js 2>&1 | % ToString | Tee-Object -Append test2.log.txt

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

SELECT * FROM Subs;

SELECT name, SUM(amount) FROM Bits GROUP BY name;
SELECT name, SUM(amount) FROM Bits WHERE name="ns3c" GROUP BY name;

SELECT SUM(amount) FROM Subs WHERE name="ns3c";
SELECT SUM(amount) FROM Subs WHERE sender="ns3c";
SELECT SUM(amount) FROM Bits WHERE name="ns3c";
SELECT SUM(amount) FROM Tips WHERE name="Carena";

// Get total Tier 1 Subs (no gifts)
SELECT COUNT(*) FROM Subs WHERE tier="1000" AND gifted=0;
// tier 2
SELECT COUNT(*) FROM Subs WHERE tier="2000" AND gifted=0;
// tier 3
SELECT COUNT(*) FROM Subs WHERE tier="3000" AND gifted=0;

// Get total gifted Tier 1 subs
SELECT SUM(amount) FROM Subs WHERE tier="1000" AND gifted=1;
SELECT SUM(amount) FROM Subs WHERE tier="2000" AND gifted=1;
SELECT SUM(amount) FROM Subs WHERE tier="3000" AND gifted=1;

// Get Total Tips
SELECT SUM(amount) from Tips;
// Get Total Bits
SELECT SUM(amount) FROM Bits;


// Aggregate all
tier1_money = ((tier1_subs + tier1_gsubs) * 2.50);
tier2_money = ((tier2_subs + tier2_gsubs) * 5.00);
tier3_money = ((tier3_subs + tier3_gsubs) * 10.00);

prize_pool_money = tier1_money + tier2_money + tier3_money + tips + (bits / 100);

delete from sqlite_sequence where name='Subs' OR name="Tips" OR name="Bits";

SELECT name from Subs WHERE gifted=false OR gifted is null UNION SELECT sender from Subs WHERE gifted=true UNION SELECT name from Tips UNION SELECT name from Bits