const express = require('express');
const router = express.Router();
const {campgroundSchema, reviewSchema} = require('../schemas.js');
const catchAsync = require('../utils/Async');
const Campground = require("../models/campground");
const flash = require('connect-flash');



const validateCampground = (req, res, next)=>{
    
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else{
        next();
    }

}


router.get('/new',catchAsync(async(req,res)=>{
    res.render("campgrounds/new.ejs");
}));

router.post('/',validateCampground, catchAsync(async(req,res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success','Successfully made');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/',async(req,res)=>{
    const cs = await Campground.find({});
    res.render("campgrounds/index.ejs",{cs});
})

router.get('/:id',async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    //console.log(campground);
    res.render("campgrounds/show.ejs", {campground});
})

router.get('/:id/edit', catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit.ejs",{ campground});
}))

router.put('/:id',validateCampground, async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground},{useFindAndModify: false});
    req.flash('success','Successfully updated');
    res.redirect(`/campgrounds/${campground._id}`);
})

router.delete('/:id',async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

module.exports = router;