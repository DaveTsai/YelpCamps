const express = require(`express`);
const methodOverride = require('method-override')
const app = express();
const path = require(`path`)
const ExpressError = require(`./utils/ExpressError.js`)
const catchAsync = require(`./utils/catchAsync`)
const ejsMate = require(`ejs-mate`)
const { campgroundSchema, reviewSchema } = require("./schema.js")
const session = require("express-session")
const flash = require("connect-flash")


app.engine(`ejs`, ejsMate)
app.set(`views`, path.join(__dirname, `views`))
app.set(`view engine`, `ejs`)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, `public`)))

const sessionConfig = {
    secret: "Thisisasecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash("successTag");
    res.locals.error = req.flash("errorTag")
    next();
})


//Set MongoDB with Mongoose
const mongoose = require(`mongoose`);
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


//呼叫Schema
const Campground = require(`./models/campground.js`);
const Review = require("./models/review.js")
const req = require("express/lib/request");
const AppError = require('./utils/ExpressError.js');

//db.on()"的第一個參數是資料庫狀態。這裡代表當發生錯誤時，顯示相應訊息。最後"db.once()"，一旦資料庫狀態為"open"，執行callback()，這裡只在console顯示連結成功
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
})
const SchemaValidation = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const reviewError = error.details.map(el => el.message).join(",")
        throw new ExpressError(reviewError, 400)
    }
    else {
        next();
    }

}


app.get(`/campgrounds`, catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render(`campgrounds/index.ejs`, { campgrounds })
})
)

app.get(`/campgrounds/new`, (req, res) => {
    res.render(`campgrounds/new.ejs`)
})
app.post(`/campgrounds`, SchemaValidation, catchAsync(async (req, res) => {

    const newCamp = new Campground(req.body)
    await newCamp.save()
    req.flash("successTag", "Successfully made a campground")
    res.redirect(`/campgrounds/${newCamp._id}`)
})
)
//app.new 必須在app.get--id前面
app.get(`/campgrounds/:id`, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate("reviews");
    if (!campground) {
        req.flash("errorTag", "Campground is not exist")
        return res.redirect(`/campgrounds`)
    }
    res.render(`campgrounds/show.ejs`, { campground })
})
)


app.get(`/`, (req, res) => {
    res.render(`home.ejs`)
})

app.get(`/campgrounds/:id/edit`, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash("errorTag", "Campground is not exist")
        return res.redirect(`/campgrounds`)
    }
    res.render(`campgrounds/edit.ejs`, { campground })
})
)

app.put(`/campgrounds/:id`, SchemaValidation, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body })
    req.flash("successTag", "Campground is edited.")
    res.redirect(`/campgrounds/${campground._id}`)
})
)

app.delete(`/campgrounds/:id`, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    req.flash("successTag", "Successfully delete a campground")
    res.redirect(`/campgrounds`)
})
)

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    const newReviews = new Review(req.body)
    campground.reviews.push(newReviews);
    await campground.save();
    await newReviews.save();
    req.flash("successTag", "Successfully create a review")
    res.redirect(`/campgrounds/${campground._id}`)

}))

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash("successTag", "Successfully delete a review")
    res.redirect(`/campgrounds/${id}`)
}))

app.all(`* `, (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) { err.message = "Oh NO something went wrong" }
    res.status(statusCode).render("error.ejs", { err })

})


app.listen(3000, () => {
    console.log(`Connected to Port 3000`)
})

