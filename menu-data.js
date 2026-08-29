// menu-data.js - Cinema F&B Data Configuration
const cinemaMenuData = {
    cinemaId: "maxus_01",
    cinemaName: "Maxus Cinema",
    items: [
        {
            id: "fam_popcorn",
            category: "regular",
            name: "Family Tub Popcorn",
            description: "Sharing size (Tap flavor below to switch)",
            price: 250,
            image: "FSalted.jpeg",
            hasFlavors: true,
            flavors: [
                { name: "Caramel", image: "Fcaramel.jpeg", title: "Family Tub Popcorn (Caramel)" },
                { name: "Cheese", image: "FCheese.jpeg", title: "Family Tub Popcorn (Cheese)" },
                { name: "Masala", image: "FMasala.jpeg", title: "Family Tub Popcorn (Masala)" },
                { name: "Salted", image: "FSalted.jpeg", title: "Family Tub Popcorn (Salted)" }
            ]
        },
        {
            id: "samosa",
            category: "eatables",
            name: "Samosa (2PCS)",
            description: "Hot & crispy traditional snack",
            price: 80,
            image: "samosa.jpeg",
            hasFlavors: false
        }
        // આ જ રીતે બાકીની બધી આઇટમ્સ અહીં ઉમેરી શકાશે
    ]
};