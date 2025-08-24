const { app } = require('./app');
const { mongodbConnection } = require('./database/dbConnect');

mongodbConnection().then(() => {
  app.listen(process.env.PORT, () => {
    console.log('Server is running or port', process.env.PORT);
  });
});
