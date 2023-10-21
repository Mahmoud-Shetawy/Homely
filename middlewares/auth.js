
const islogin=async(req,res,next)=>{

try{
console.log(req.session.user_id)
     next()

} catch(err){
    console.log(err)
}

}

const islogout=async(req,res,next)=>{

    try{
    if(req.session.user_id){
        console.log("is logout"+" "+req.session.user_id)
    }
    next()
    } catch(err){
        console.log(err)
    }
    
    }




module.exports={
    islogin,
    islogout 
}



