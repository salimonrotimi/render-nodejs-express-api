const express = require('express');
const router = express.Router();
const { registeredUsers, register, login, dashboard, refreshTokenJWT, logout } = require('../controller/reglogin_controllers');
const accessTokenAuthMiddleware = require('../middleware/access-jwt-auth');


router.route('/').get(registeredUsers); // same as  router.get('/', registeredUsers)
router.route('/register').post(register); // same as  router.post('/register', register)
router.route('/login').post(login) // same as  router.post('/login', login)
router.route('/dashboard').get(accessTokenAuthMiddleware, dashboard); // same as  
// router.get('/dashboard', authTokenMiddleware, dashboard)
router.route('/refresh-token').post(refreshTokenJWT); // same as  router.post('/refresh-token', refreshTokenJWT)
router.route('/logout').post(accessTokenAuthMiddleware, logout); // same as  router.post('/logout', logout)


module.exports = router;