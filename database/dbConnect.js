const mongoose = require('mongoose')

const mongodbConnectin = async(req,res) =>{
    try {
        const dbConnection = await mongoose.connect(process.env.MONGODB_URI,{
            dbName: "AUTHENTICATION APP"
        })
        if (dbConnection) {
            console.log("Database connection Successfull");
        }else{
            console.error('Database connection failed');
        }
    } catch (error) {
        console.error("error from mongodb connection",error)
    }
}

module.exports = {mongodbConnectin}