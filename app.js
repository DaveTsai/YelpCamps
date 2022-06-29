const express = require(`express`);
const methodOverride = require('method-override')
const app = express();
const path = require(`path`)
const ejsMate = require(`ejs-mate`)


app.engine(`ejs`, ejsMate)
app.set(`views`, path.join(__dirname, `views`))
app.set(`view engine`, `ejs`)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

//Set MongoDB with Mongoose
const mongoose = require(`mongoose`);
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


//呼叫Schema
const Campground = require(`./models/campground.js`);
const req = require("express/lib/request");

//db.on()"的第一個參數是資料庫狀態。這裡代表當發生錯誤時，顯示相應訊息。最後"db.once()"，一旦資料庫狀態為"open"，執行callback()，這裡只在console顯示連結成功
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
})


app.get(`/campgrounds`, async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render(`campgrounds/index.ejs`, { campgrounds })
})

app.get(`/campgrounds/new`, (req, res) => {
    res.render(`campgrounds/new.ejs`)
})
app.post(`/campgrounds`, async (req, res) => {
    const newCamp = new Campground(req.body)
    await newCamp.save()
    res.redirect(`/campgrounds/${newCamp._id}`)


})
//app.new 必須在app.get--id前面
app.get(`/campgrounds/:id`, async (req, res) => {
    const { id } = req.params
    const findCamp = await Campground.findById(id);
    res.render(`campgrounds/show.ejs`, { findCamp })
})


app.get(`/`, (req, res) => {
    res.render(`home.ejs`)
})

app.get(`/campgrounds/:id/edit`, async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    res.render(`campgrounds/edit.ejs`, { campground })
})

app.put(`/campgrounds/:id`, async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body })
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete(`/campgrounds/:id`, async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`)
})

app.listen(3000, () => {
    console.log(`Connected to Port 3000`)
})

