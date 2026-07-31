const Listing=require("../models/listing");
const axios = require("axios");

module.exports.index=async(req,res)=>{
   const allListings=await  Listing.find({});
   res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
   
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let{ id}=req.params;
    const listing=await Listing.findById(id)
    .populate({path:"reviews",populate:{path:"author"},})
    .populate("owner");
    if(!listing){
       req.flash("error","listing you requested for does not exist");
      return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async(req,res,next)=>{
    // let{title,description,image,price,location,country}=req.body;
    let url=req.file.path;
    let filename=req.file.filename;
   
    
      const newListing=new Listing(req.body.listing);

       // Get latitude & longitude from OpenStreetMap
    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: `${newListing.location}, ${newListing.country}`,
                format: "jsonv2",
                limit: 1,
            },
            headers: {
                "User-Agent": "wanderlust-app",
            },
        }
    );

    // Save coordinates if location is found
    if (response.data.length > 0) {
        newListing.geometry = {
            type: "Point",
            coordinates: [
                Number(response.data[0].lon),
                Number(response.data[0].lat),
            ],
        };
    }
     
      newListing.owner=req.user._id;
      newListing.image={url,filename};
      
    await newListing.save();
    req.flash("success","new listing created");
    res.redirect("/listings");

};

module.exports.renderEditForm=async(req,res)=>{
    let{ id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
       req.flash("error","listing you requested for does not exist");
      return res.redirect("/listings");
    }
  let originalImageUrl=listing.image.url;
 originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");


    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

// module.exports.updateListing=async(req,res)=>{
    
//     let{ id}=req.params;
//   let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});

//   if(typeof req.file !== "undefined"){
//   let url=req.file.path;
//     let filename=req.file.filename;
//     listing.image={url,filename};
//     await listing.save();
//   }
//    req.flash("success","listing updated");
//    res.redirect(`/listings/${id}`);

// };

module.exports.updateListing = async (req, res) => {

    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    // Update coordinates using OpenStreetMap
    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: `${listing.location}, ${listing.country}`,
                format: "jsonv2",
                limit: 1,
            },
            headers: {
                "User-Agent": "wanderlust-app",
            },
        }
    );

    if (response.data.length > 0) {
        listing.geometry = {
            type: "Point",
            coordinates: [
                Number(response.data[0].lon),
                Number(response.data[0].lat),
            ],
        };
    }

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = {
            url,
            filename,
        };
    }

    await listing.save();

    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let{ id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","listing deleted");
    res.redirect("/listings");
};


