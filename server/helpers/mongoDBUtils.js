const mongoose = require('mongoose');

 const getMongoDBID = (id) =>{
    return mongoose.Types.ObjectId(id)
}

module.exports = getMongoDBID;