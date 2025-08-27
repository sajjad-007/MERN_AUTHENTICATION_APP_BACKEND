const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const { errorMiddleware } = require('./error/error');
const app = express();
const allRoutes = require('./routes/auth.apiRoutes');
const cookieParser = require('cookie-parser');
dotenv.config({ path: './config/config.env' });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());  

app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/user', allRoutes);
app.use(errorMiddleware);

module.exports = { app };
