const express = require('express');
const app = express();
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const path = require("path");
const Campground = require("../models/campground");
//const campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors}= require('./seedHelpers');
const { title } = require('process');

mongoose.connect('mongodb://localhost:27017/yelpcamp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const sample = array => array[Math.floor(Math.random()*array.length)];
const price = Math.floor(Math.random()*20)+10;

const db = mongoose.connection;
db.on("error",console.error.bind(console, "connection error:"));
db.once("open",()=>{
    console.log("database connected");
});

const seedDB = async()=>{
    await Campground.deleteMany({});
    for (let i=0; i<10; i++){
        const random = Math.floor(Math.random()*1000);
        const c=new Campground({
            location:`${cities[random].city}, ${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/460289/1600x900",
            price
            
            


        })
        await c.save();
    }
}

seedDB();