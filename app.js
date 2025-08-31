const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const { errorMiddleware } = require('./error/error');
const app = express();
const allRoutes = require('./routes/auth.apiRoutes');
const cookieParser = require('cookie-parser');
const {
  removeUnverifiedAccounts,
} = require('./automation/removeUnverifiedAccounts');
dotenv.config({ path: './config/config.env' });

app.use(
  cors({
    origin: 'https://sajjad-auth-v1.netlify.app/auth',
    methods: ['POST', 'GET', 'PUT'],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/user', allRoutes);
removeUnverifiedAccounts();

app.use(errorMiddleware);

module.exports = { app };
