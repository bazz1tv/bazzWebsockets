const db = require('./models'); // new require for db object
const DEBUG=false;

/* CALC SECTION
////////////////////////////////////////////////*/

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
            [db.Sequelize.Op.or]: [false, null],
        }
      },
      order: [
        ['amount', 'DESC']
      ],
      limit: 1
    });

    console.log(subs);
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
    let tier1_gsubs = await db.Sub.findAll({
      where: {
        tier: "1000",
        gifted: 1,
        sender: user
      }
    }) || 0;
    let tier2_gsubs = await db.Sub.findAll({
      where: {
        tier: "2000",
        gifted: 1,
        sender: user
      }
    }) || 0;
    let tier3_gsubs = await db.Sub.findAll({
      where: {
        tier: "3000",
        gifted: 1,
        sender: user
      }
    }) || 0;

    if (tier1_gsubs !== 0)
        tier1_gsubs = tier1_gsubs.length;
    if (tier2_gsubs !== 0)
        tier2_gsubs = tier2_gsubs.length;
    if (tier3_gsubs !== 0)
        tier3_gsubs = tier3_gsubs.length;

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

    const tip_entries = Math.floor(tips / 2);
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


    return entries; //console.log(`${user} has ${entries} entries`);
}

async function getAllSubs()
{
    const names = await db.sequelize.query(
       "SELECT name from Subs WHERE gifted=false OR gifted is null", { type: db.Sequelize.SELECT });
    //console.log(names);
    return names[0];
}

// Candidates are people who have contributed during the sweepstakes, but they
// may have 0 entries (eg. they cheered but didn't cheer enough to reach 1 entry)
async function getAllCandidates()
{
    /* SELECT name from Subs WHERE gifted=false UNION
       SELECT sender as name from Subs WHERE gifted=true UNION
       SELECT name from Tips UNION
       SELECT name from Bits; */
    const names = await db.sequelize.query(
       "SELECT name from Subs WHERE gifted=false OR gifted is null UNION \
        SELECT sender as name from Subs WHERE gifted=true UNION \
        SELECT name from Tips UNION \
        SELECT name from Bits", { type: db.Sequelize.SELECT });
    //console.log(names);
    return names[0];
}

function sortHelper (a, b) {
  if (a.entries < b.entries) return 1;
  if (a.entries > b.entries) return -1;
  return 0;
}
// this returns an array objects containing name and entries keys, descending sorted by entries.
async function getAllEntrants()
{
	let names = await getAllCandidates();
	//console.log(names);
	
	// Calculate entries for each user and remove 0 entry users
	for (let i = names.length - 1; i >= 0; i -= 1)
	{
		let name = names[i];
		numEntries = await calcEntries(name.name);
	    if (numEntries == 0) {
	        names.splice(i, 1);
	    }
	    else name.entries = numEntries;
	}
	//console.log(names);

	// Sort the list in descending order (highest entries at the top)
	names = names.sort( sortHelper );

    console.log("ENTRANTS Before Transfers");
    console.log(names)

    //iterate through the FROM of all the transfers
    const transfers = await db.Transfer.findAll();
    /*
        [
            {from: from, to: to, amount: amount},
            ...
        ]
    */
    // check for that name in `names` js var

    console.log("Finding the FROM entrants of transfers")
    for (let i = 0; i < transfers.length; i+=1)
    {
        // Assert that the FROM exists in `names`
        let transfer = transfers[i];
        let amount = parseInt(transfer.amount)
        let fromEntrant = await findEntrant(names, transfer.from);
        console.log(fromEntrant);

        // Check if the TO exists in `names`
        let toEntrant = await findEntrant(names, transfer.to);
        if (toEntrant != null)
        {
            // Yes: Adjust the tickets of TO
            console.log("\tTO Entrant found: ", toEntrant)
            toEntrant.entries += amount;
            console.log("\tincreasing by " + amount + " entries")
        }
        else
        {
            let obj = { name: transfer.to, entries: amount }
            console.log("\tAdding new entrant: ", obj)
            // No: Add a new entry into `names` with TO and AMOUNT
            names.push( obj );
        }

        // Adjust the FROM entrant's ticket amount
        fromEntrant.entries -= amount;
    }

    return names.sort( sortHelper );
}

async function findEntrant(names, name)
{
    for (let i = 0; i < names.length; i+=1)
    {
        let n = names[i];
        if (n.name == name)
        {
            return n;
        }
    }

    return null;
}

async function findSub(name)
{
    let names = await getAllSubs();
    //console.log(names)
    for (let i = 0; i < names.length; i+=1)
    {
        let obj = names[i];
        //console.log(`obj.name = '${obj.name}', name = '${name}'`)
        if (obj.name === name)
        {
            return true;
        }
    }
    //console.log("returning false")
    return false;
}

async function getTopScores(howMany)
{
	let scores = await getAllEntrants();
	//console.log(names);

	//let numEntrants = names.length;
	//console.log(`There are ${numEntrants} entrants in the sweepstakes`);

	if (howMany == 0)
		howMany = scores.length;
	return scores.slice(0, howMany);
}

async function getNumEntrants()
{
	return (await getAllEntrants()).length;
}

async function main()
{
    var myArgs = process.argv.slice(2);
    console.log('myArgs: ', myArgs);

    if (myArgs[0] == 'createTransfer')
    {
        // assume sanitized
        let from = myArgs[1];
        let to = myArgs[2];
        let amount = parseInt(myArgs[3]);

        const transfer = await db.Transfer.create({ from: from, to: to, amount: amount });
    }
    else if (myArgs[0] == 'getTopScores')
    {
        let amount = (myArgs.length == 2) ? parseInt(myArgs[1]) : 0;
        console.log(await getTopScores(amount));
    }
    else if (myArgs[0] == 'printNames')
    {
      let everyone = await getTopScores(0);
      for (let i = 0; i < everyone.length; i+=1)
      {
        let obj = everyone[i];
        //console.log(`obj.name = '${obj.name}', name = '${name}'`)
        for (let t = 0; t < obj.entries; t+=1)
        {
          console.log(obj.name)
        }
      }
    }
    else if (myArgs[0] == 'getNumEntrants')
    {
        console.log(await getNumEntrants());
    }
    else if (myArgs[0] == 'insertSub')
    {
        if (myArgs.length != 4)
        {
            console.log ("Usage: insertSub [name] [totalMonths] [tier]");
            return;
        }

        // TODO: Make sure `name` isn't already in the Subs Table
        // INSERT INTO Subs (id,name,amount,tier,createdAt,updatedAt) VALUES(76,'mrgaleer',4,'1000','2021-03-22 17:36:43.899 +00:00','2021-03-22 17:36:43.899 +00:00');
        let name = myArgs[1];
        let tier = myArgs[2]; // eg. '1000'
        let amount = parseInt(myArgs[3]);

        const sub = await db.Sub.create({ name: name, amount: amount, tier: tier });
    }
    else if (myArgs[0] == 'findSub')
    {
        let name = myArgs[1]
        if ( (await findSub(name)) === false )
        {
            console.log (`'${name}' sub does not exist`);
        }
        else
        {
            console.log (`'${name}' sub exists`);
        }
    }
    else if (myArgs[0] == 'insertBit')
    {
        if (myArgs.length != 3)
        {
            console.log ("Usage: insertBit [name] [bits]");
            return;
        }

        // TODO: Make sure `name` isn't already in the Subs Table
        //  INSERT INTO Subs (id,name,amount,tier,createdAt,updatedAt) VALUES(76,'mrgaleer',4,'1000','2021-03-22 17:36:43.899 +00:00','2021-03-22 17:36:43.899 +00:00');
        let name = myArgs[1];
        let amount = parseInt(myArgs[2]);

        const bit = await db.Bit.create({ name: name, amount: amount });
    }
}

main();