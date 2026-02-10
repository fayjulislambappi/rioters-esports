const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');
        const products = db.collection('products');

        console.log("--- Updating Valorant VP Product Image ---");

        // Match product by partial name to be robust
        const result = await products.updateOne(
            { name: { $regex: '475 VP', $options: 'i' } },
            {
                $set: {
                    image: "https://m.media-amazon.com/images/I/71Zp+3Q+JNL._AC_SL1500_.jpg",
                    name: "Valorant VP Redeem Code (475 VP)"
                }
            }
        );

        if (result.matchedCount > 0) {
            console.log("Successfully updated the product image.");
        } else {
            console.log("Product not found. Listing potential matches:");
            const matches = await products.find({ name: /VP/i }).toArray();
            console.log(JSON.stringify(matches.map(m => m.name), null, 2));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
