const express = require('express');
const router = express.Router();
const {reviewSchema} = require('../schemas.js');
const catchAsync = require('../utils/Async');
const Campground = require("../models/campground");
const flash = require('connect-flash');
// const {campgroundSchema, reviewSchema} = require('./schemas.js');
const Review = require('../models/reviews');
const ExpressError = require('../utils/ExpressError');



const validateReview = (req, res, next)=>{
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else{
        next();
    }

}

router.post('/',validateReview, catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','made');
    res.redirect(`/campgrounds/${campground._id}`);

}))

router.delete('/:reviewId',catchAsync(async(req, res)=>{
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }},{useFindAndModify: false});
    const review = await Review.findOneAndDelete(reviewId);
    req.flash('success','deleted');
    res.redirect(`/campgrounds/${campground._id}`);
}))

module.exports = router;