const express =require ('express');
const mongoose = require("mongoose");
const router =express.Router({mergeParams:true});
const catchasync = require("../utilities/catchasync");
const expresserror = require("../utilities/expresserror");
const campground = require("../models/campground");
const review = require("../models/review");
const { Campgroundschema,reviewschema } = require("../schemas.js"); //this schema is for servers side joi validations

const validatereview = (req, res, next) => {         //    it will validate every async function of reviewschema
    const { error } = reviewschema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new expresserror(msg, 400);
    } else {
      next();
    }
  
   
  };

//adding reviews

router.post("/",validatereview,catchasync(async(req, res) => {
    const { id } = req.params;
    const thatcamp = await campground.findById(id);
  
    const Review = new review(req.body.review);
  
    thatcamp.reviews.push(Review);
    await Review.save();
  
    await thatcamp.save();
    req.flash('success','Succesfully created review');
  
    res.redirect(`/campgrounds/${thatcamp._id}`);
  })
  );

  //deleting reviews
  
  router.delete("/:reviewid",catchasync(async(req,res)=>{
  const {id,reviewid}=req.params;
  await campground.findByIdAndUpdate(id, {$pull: {reviews:reviewid}});
  await review.findByIdAndDelete(req.params.reviewid);
  req.flash('success','Succesfully deleted review');
  res.redirect(`/campgrounds/${id}`)
    
  }))

  module.exports=router;