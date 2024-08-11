const mongoClient = require('mongodb').MongoClient

const state={
    db:null
}
module.exports.connect=(cb)=>{
    const url='mongodb://localhost:27017'
    const dbname='brand-square'
    

    mongoClient.connect(url,true)
    const client = new mongoClient(url, { monitorCommands: true });
    state.db=client.db(dbname)
    cb(state.db)
}
module.exports.get=()=>{
    return state.db
}