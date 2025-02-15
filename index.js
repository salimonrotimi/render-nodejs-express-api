require('dotenv').config(); // OR   require('dotenv/config')
// security packages
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cors = require('cors');

const express = require('express'); // server
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const authRoute = require('./routes/reglogin-route');
const jobsRoute = require('./routes/jobs-route');

const tokenAuth = require('./middleware/access-jwt-auth'); // for protecting all the paths in the 'jobsRoute'


const port = process.env.PORT || 3000;

app.set('trust proxy', 1); // This is important since 'express' server will be mounted or deployed on an online server
// MIDDLEWARES
app.use(bodyParser.json()); // OR   app.use(express.json())
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes in window milliseconds
        max: 100 // limit each IP to 100 requests per windowMs
    })
);

// built-in middleware to handle urlencoded data (i.e. form-data)
// 'content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: true })); // OR app.use(bodyParser.urlencoded({ extended: true }));

//built-in middleware for serving static files e.g. css, images and texts
app.use(express.static('./public')); // OR   app.use(express.static(path.join(__dirname, '/public')));

app.use('/api/v1/auth', authRoute); // the route becomes http://localhost:3000//api/v1/auth
app.use('/api/v1/jobs', tokenAuth, jobsRoute); // the route becomes http://localhost:3000//api/v1/jobs

// listens for the database connection before starting the server.
mongoose.connection.once('open', () => {
    app.listen(port, () => console.log(`Server listening at port ${port}`));
});