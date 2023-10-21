function errorhandler(err,req,res,next){
    if(err.name==='UnauthorizedError'){
        //jwt authentication error
       return res.status(401).json({message:'the user is not authorized'})
    }
// validation error
    if(err.name==='ValidationError'){
      return  res.status(401).json({message:err})
    }

//default to 500 server error
    return res.status(500).json(err)
}
