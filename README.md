What
====

Persistent Stream events tracking (even when stream offline, hopefully) and
recording into database.

New and Resubs
Gift Subs
Tips
Cheers

How
===

StreamElements Websocket API

Models
======

.\node_modules\.bin\sequelize model:generate --name Sub --attributes name:string,amount:integer,tier:string,gifted:boolean,sender:string,subExtension:boolean,month:string,message:text

.\node_modules\.bin\sequelize model:generate --name Tip --attributes name:string,amount:decimal,message:text

 .\node_modules\.bin\sequelize model:generate --name Bit --attributes name:string,amount:integer,message:text

Scratchpad
==========

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