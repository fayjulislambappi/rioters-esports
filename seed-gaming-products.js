const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');
        const products = db.collection('products');

        console.log("--- Seeding Gaming Products (Game Top-UP) ---");

        const gamingProducts = [
            {
                name: "PUBG Mobile UC (Global)",
                slug: "pubg-mobile-uc-global",
                price: 115,
                category: "Game Top-UP",
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
                description: "Direct top-up for PUBG Mobile Global. Get UC instantly.",
                active: true,
                variants: [
                    { name: "60 UC", price: 115 },
                    { name: "325 UC", price: 550 },
                    { name: "660 UC", price: 1050 },
                    { name: "1800 UC", price: 2850 }
                ]
            },
            {
                name: "Free Fire Diamonds (Direct)",
                slug: "free-fire-diamonds-direct",
                price: 85,
                category: "Game Top-UP",
                image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
                description: "Top-up diamonds for your Garena Free Fire account.",
                active: true,
                variants: [
                    { name: "100 Diamonds", price: 85 },
                    { name: "310 Diamonds", price: 260 },
                    { name: "520 Diamonds", price: 430 },
                    { name: "1060 Diamonds", price: 850 }
                ]
            },
            {
                name: "Mobile Legends Diamonds",
                slug: "mobile-legends-diamonds",
                price: 165,
                category: "Game Top-UP",
                image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&q=80&w=800",
                description: "Fast delivery for Mobile Legends: Bang Bang Diamonds.",
                active: true,
                variants: [
                    { name: "86 Diamonds", price: 165 },
                    { name: "172 Diamonds", price: 325 },
                    { name: "257 Diamonds", price: 485 },
                    { name: "706 Diamonds", price: 1320 }
                ]
            },
            {
                name: "Steam Wallet Code (Global)",
                slug: "steam-wallet-global",
                price: 650,
                category: "Gift Card",
                image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=800",
                description: "Redeem global Steam wallet codes for your library.",
                active: true,
                variants: [
                    { name: "5 USD", price: 650 },
                    { name: "10 USD", price: 1250 },
                    { name: "20 USD", price: 2450 },
                    { name: "50 USD", price: 6100 }
                ]
            }
        ];

        // Also add variants to the existing Valorant VP product
        const valorantUpdate = {
            name: "Valorant VP Redeem Code (Global)",
            slug: "valorant-vp-global",
            image: "https://m.media-amazon.com/images/I/71Zp+3Q+JNL._AC_SL1500_.jpg",
            description: "Valorant Points (VP) for Global accounts. High speed delivery.",
            active: true,
            variants: [
                { name: "475 VP", price: 450 },
                { name: "1000 VP", price: 950 },
                { name: "2050 VP", price: 1900 },
                { name: "5350 VP", price: 4750 }
            ]
        };

        // Update Valorant
        await products.updateOne(
            { name: { $regex: '475 VP', $options: 'i' } },
            { $set: valorantUpdate },
            { upsert: true }
        );

        for (const product of gamingProducts) {
            console.log(`Seeding ${product.name}...`);
            await products.updateOne(
                { slug: product.slug },
                { $set: product },
                { upsert: true }
            );
        }

        console.log("Done seeding gaming products.");

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
