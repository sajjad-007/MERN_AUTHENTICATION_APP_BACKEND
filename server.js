const { app } = require('./app');
const {mongodbConnectin} = require("./database/dbConnect")

mongodbConnectin().then(()=>{
  app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running or port', process.env.PORT);
  });
})
