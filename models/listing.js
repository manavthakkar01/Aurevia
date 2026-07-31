const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  geometry: {
    type: {
        type: String,
        enum: ["Point"],
        default: "Point"
    },
    coordinates: {
        type: [Number],
        default: [0, 0]
    }
},

  image: {
   url:String,
   filename:String,

  },

  price: Number,
  location: String,
  country: String,
  reviews: [
      {
          type: Schema.Types.ObjectId,
          ref: "Review",
      },
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },

  // category:{
  //   type:String,
  //   enum:["trending","room","iconic cities","mountains","castles","amazing pools","camping","farms","arctic"]
  // }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}
    });
  }
});




const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;


