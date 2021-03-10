const db = require('./models'); // new require for db object
const DEBUG=false;

async function calcPoolMoney()
{
	// Get total Tier 1 Subs (no gifts)
	// SELECT COUNT(*) FROM Subs WHERE tier="1000" AND gifted=0;
	const prime_subs = await db.Sub.count({
	  where: {
	    tier: "prime",
	    gifted: 0
	  }
	});
	const tier1_subs = await db.Sub.count({
	  where: {
	    tier: "1000",
	    gifted: 0
	  }
	});
	const tier2_subs = await db.Sub.count({
	  where: {
	    tier: "2000",
	    gifted: 0
	  }
	});
	const tier3_subs = await db.Sub.count({
	  where: {
	    tier: "3000",
	    gifted: 0
	  }
	});

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
	    tier: "1000",
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
	const tips = await db.Tip.sum('amount');
	const bits = await db.Bit.sum('amount');

	if (DEBUG)
	{
		console.log(`tips = ${tips}`);
		console.log(`bits = ${bits}`);
	}

	// Aggregate all
	const prize_pool_money = prime_money + tier1_money +
		tier2_money + tier3_money + tips + (bits / 100);

	console.log(`Total pool money = ${prize_pool_money}`);
}

async function calcEntries(user)
{
	var entries = 0;

	// get their actual sub, if any
	const subs = await db.Sub.findAll({
	  where: {
	    name: user,
	    gifted: false,
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

calcPoolMoney();
calcEntries('ns3c');