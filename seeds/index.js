
const mongoose = require(`mongoose`);
const Campground = require(`../models/campground.js`);
const cities = require(`./cities.js`)
const { places, descriptors } = require(`./seedHelpers`);


mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
    // userCreateIndex: true, 
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
})

// const sample = (array) => array[Math.floor(Math.random() * array.length)];

function sample(array) {
    return array[Math.floor(Math.random() * array.length)]
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 5
        const camp = new Campground({
            location: `${cities[random1000].city},${cities[random1000].state}`
            , title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400`,
            description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy.`,
            price

        })
        await camp.save();
    }

}

//connection.close 可以讓你不用回terminal手動關閉index.js（本檔案）
seedDB().then(() => {
    mongoose.connection.close()
})
