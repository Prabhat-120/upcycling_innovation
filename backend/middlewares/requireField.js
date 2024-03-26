const validateReqBody =  (req, res, next)=> { 
    let reqbody = req.body;
    if(Object.keys(reqbody).length === 0) {                                       //it return if req.body doesn't have any field.
      return res.status(400).send('req.body does not have any value');
    }else{
      for(let key in reqbody){                                                     //if any field 
        if(reqbody.hasOwnProperty(key)){
          if(reqbody[key] ==='' || reqbody[key].length===0){
            return res.status(422).json({error:`${key} is required. It cannot have an empty value.`});
          }
        }    
      }
    }
    // Call the next middleware function
    next();
};

module.exports=validateReqBody;