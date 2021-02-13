const express = require('express');
const app = express();
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const path = require("path");
const methodOverride = require('method-override');
const Campground = require("./models/campground");
const ejsMate = require('ejs-mate');
const ajax = require('ajax');
const {start}= require('repl');
const catchAsync = require('./utils/Async');
const ExpressError = require('./utils/ExpressError');
const router = require('router');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const Review = require('./models/reviews');

mongoose.connect('mongodb://localhost:27017/yelpcamp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
    
});

const db = mongoose.connection;
db.on("error",console.error.bind(console, "connection error:"));
db.once("open",()=>{
    console.log("database connected");
})

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));



// app.get('/makecamp',async(req,res)=>{
//     const camp = new Campground({title: 'My home', description: "cheap one"});
//     await camp.save();
//     res.send(camp);
// })


const validateCampground = (req, res, next)=>{
    
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else{
        next();
    }

}

const validateReview = (req, res, next)=>{
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else{
        next();
    }

}

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

app.get('/',(req,res)=>{
    res.render("home.ejs");
})

app.get('/campgrounds/new',catchAsync(async(req,res)=>{
    res.render("campgrounds/new.ejs");
}));

app.post('/campgrounds',validateCampground, catchAsync(async(req,res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.put('/campgrounds/:id',validateCampground, async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground},{useFindAndModify: false});
    res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id',async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})




app.get('/campgrounds',async(req,res)=>{
    const cs = await Campground.find({});
    res.render("campgrounds/index.ejs",{cs});
})

app.get('/campgrounds/:id',async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    //console.log(campground);
    res.render("campgrounds/show.ejs", {campground});
})

app.get('/campgrounds/:id/edit',validateCampground, async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit.ejs",{ campground});
})

app.post('/campgrounds/:id/reviews',catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}))

app.delete('/campgrounds/:id/reviews/:reviewId',async(req, res)=>{
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }},{useFindAndModify: false});
    const review = await Review.findOneAndDelete(reviewId);
    res.redirect(`/campgrounds/${campground._id}`);
})


app.all('*',(req, res, next)=>{
    next(new ExpressError('Sorry, page not found',404));
})

app.use((err, req, res, next)=>{
    const {statusCode =500} = err;
    if(!err.message) err.message = "Something wrong";
    res.status(statusCode).render("error.ejs", {err});

})


app.listen(3000,()=>{
    console.log("listening");
})