const express = require('express');
const app = express();
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const path = require("path");
const methodOverride = require('method-override');
const Campground = require("./models/campground");

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

app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

app.get('/',(req,res)=>{
    res.render("home.ejs");
})

app.get('/campgrounds/new',async(req,res)=>{
    res.render("campgrounds/new.ejs");
});

app.post('/campgrounds',async(req,res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

app.put('/campgrounds/:id',async(req,res)=>{
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
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/show.ejs", {campground});
})

app.get('/campgrounds/:id/edit',async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit.ejs",{ campground});
})




app.listen(3000,()=>{
    console.log("listening");
})