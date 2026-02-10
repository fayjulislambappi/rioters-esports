const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');
        const products = db.collection('products');

        console.log("--- Seeding Football Jerseys ---");

        const jerseyData = [
            {
                name: "Team Alpha Pro Jersey 2026",
                slug: "team-alpha-jersey-2026",
                price: 750,
                category: "Merchandise",
                image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=800",
                description: "Official Team Alpha 2026 Pro Jersey. Moisture-wicking fabric, athletic fit.",
                active: true,
                variants: [
                    { name: "Half Sleeve", price: 750 },
                    { name: "Full Sleeve", price: 900 }
                ],
                addOns: [
                    { name: "Custom Name & Number", price: 100 }
                ]
            },
            {
                name: "Rioters Esports Elite Kit",
                slug: "rioters-elite-kit",
                price: 750,
                category: "Merchandise",
                image: "https://images.unsplash.com/photo-1580087444641-da28448ec629?auto=format&fit=crop&q=80&w=800",
                description: "The official Rioters Esports elite kit. Designed for maximum performance.",
                active: true,
                variants: [
                    { name: "Half Sleeve", price: 750 },
                    { name: "Full Sleeve", price: 900 }
                ],
                addOns: [
                    { name: "Custom Name & Number", price: 100 }
                ]
            },
            {
                name: "Shadow Squad Stealth Jersey",
                slug: "shadow-stealth-jersey",
                price: 750,
                category: "Merchandise",
                image: "https://images.unsplash.com/photo-1542461927-466f28b248a8?auto=format&fit=crop&q=80&w=800",
                description: "Limited edition stealth jersey for the Shadow Squad.",
                active: true,
                variants: [
                    { name: "Half Sleeve", price: 750 },
                    { name: "Full Sleeve", price: 900 }
                ],
                addOns: [
                    { name: "Custom Name & Number", price: 100 }
                ]
            },
            {
                name: "Real Madrid Pro Jersey 2026",
                slug: "real-madrid-jersey-2026",
                price: 750,
                category: "Merchandise",
                image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
                description: "Official Real Madrid 2026 Home Jersey. The classic white and gold. Engineered for champions.",
                active: true,
                variants: [
                    { name: "Half Sleeve", price: 750 },
                    { name: "Full Sleeve", price: 900 }
                ],
                addOns: [
                    { name: "Custom Name & Number", price: 100 }
                ]
            }
        ];

        for (const jersey of jerseyData) {
            console.log(`Checking/Seeding ${jersey.name}...`);
            await products.updateOne(
                { slug: jersey.slug },
                { $set: jersey },
                { upsert: true }
            );
        }

        console.log("Done seeding jerseys.");

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
