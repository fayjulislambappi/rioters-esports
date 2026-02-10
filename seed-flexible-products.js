const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');
        const products = db.collection('products');

        console.log("--- Seeding Flexible Gaming Products (Arekta Mode) ---");

        const flexibleProducts = [
            {
                name: "Valorant VP (Global & Asia)",
                slug: "valorant-vp-flexible",
                price: 0, // Price will come from pack selection
                category: "Game Top-UP",
                image: "https://m.media-amazon.com/images/I/71Zp+3Q+JNL._AC_SL1500_.jpg",
                description: "Vandalize your enemies with premium Valorant Points. Fast delivery to all regions.",
                active: true,
                optionGroups: [
                    {
                        name: "Region",
                        type: "selection",
                        required: true,
                        options: [
                            { name: "Global", price: 0 },
                            { name: "Asia / SEA", price: 10 }
                        ]
                    },
                    {
                        name: "Package",
                        type: "selection",
                        required: true,
                        options: [
                            { name: "475 VP", price: 450 },
                            { name: "1000 VP", price: 950 },
                            { name: "2050 VP", price: 1900 },
                            { name: "5350 VP", price: 4750 }
                        ]
                    },
                    {
                        name: "Player ID (Riot ID)",
                        type: "input",
                        required: true,
                        placeholder: "e.g. Rioter#1234"
                    }
                ]
            },
            {
                name: "PUBG Mobile UC (Global Direct)",
                slug: "pubg-uc-flexible",
                price: 0,
                category: "Game Top-UP",
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
                description: "Direct top-up for PUBG Mobile. Enter your Player ID and get UC instantly.",
                active: true,
                optionGroups: [
                    {
                        name: "Top-up Method",
                        type: "selection",
                        required: true,
                        options: [
                            { name: "Direct ID Top-up", price: 0 },
                            { name: "Login Based (Cheap)", price: -20 }
                        ]
                    },
                    {
                        name: "UC Pack",
                        type: "selection",
                        required: true,
                        options: [
                            { name: "60 UC", price: 115 },
                            { name: "325 UC", price: 580 },
                            { name: "660 UC", price: 1150 },
                            { name: "1800 UC", price: 2950 }
                        ]
                    },
                    {
                        name: "Player ID",
                        type: "input",
                        required: true,
                        placeholder: "Enter 10-digit Player ID"
                    }
                ]
            },
            {
                name: "Free Fire Diamonds",
                slug: "free-fire-flexible",
                price: 0,
                category: "Game Top-UP",
                image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
                description: "Fastest Free Fire diamonds top-up in Bangladesh.",
                active: true,
                optionGroups: [
                    {
                        name: "Diamond Pack",
                        type: "selection",
                        required: true,
                        options: [
                            { name: "100 Diamonds", price: 85 },
                            { name: "310 Diamonds", price: 260 },
                            { name: "520 Diamonds", price: 430 },
                            { name: "1060 Diamonds", price: 850 }
                        ]
                    },
                    {
                        name: "Player ID",
                        type: "input",
                        required: true,
                        placeholder: "Enter UID"
                    }
                ]
            }
        ];

        // Clear existing related products to avoid confusion during dev
        await products.deleteMany({ slug: { $in: flexibleProducts.map(p => p.slug) } });
        // Also remove the old ones if slugs differ but names similar
        await products.deleteMany({ name: { $regex: /VP|UC|Diamonds/i }, optionGroups: { $exists: false } });

        for (const product of flexibleProducts) {
            console.log(`Seeding ${product.name}...`);
            await products.insertOne(product);
        }

        console.log("Done seeding flexible products.");

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
