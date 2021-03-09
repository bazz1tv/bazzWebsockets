const db = require('./models'); // new require for db object

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

	console.log(`prime_subs = ${prime_subs}`);
	console.log(`tier1_subs = ${tier1_subs}`);
	console.log(`tier2_subs = ${tier2_subs}`);
	console.log(`tier3_subs = ${tier3_subs}\n`);

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

	console.log(`tier1_gsubs = ${tier1_gsubs}`);
	console.log(`tier2_gsubs = ${tier2_gsubs}`);
	console.log(`tier3_gsubs = ${tier3_gsubs}\n`);

	const prime_money = prime_subs * 2.50;
	const tier1_money = ((tier1_subs + tier1_gsubs) * 2.50);
	const tier2_money = ((tier2_subs + tier2_gsubs) * 5.00);
	const tier3_money = ((tier3_subs + tier3_gsubs) * 10.00);

	console.log(`prime_money = ${prime_money}`);
	console.log(`tier1_money = ${tier1_money}`);
	console.log(`tier2_money = ${tier2_money}`);
	console.log(`tier3_money = ${tier3_money}\n`);

	// Tips and bits
	const tips = await db.Tip.sum('amount');
	console.log(`tips = ${tips}`);
	const bits = await db.Bit.sum('amount');
	console.log(`bits = ${bits}`);

	// Aggregate all
	const prize_pool_money = prime_money + tier1_money +
		tier2_money + tier3_money + tips + (bits / 100);

	console.log(`Total pool money = ${prize_pool_money}`);
}

calcPoolMoney();