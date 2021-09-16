const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user")

const {
    BCRYPT_WORK_FACTOR,
    SECRET_KEY
} = require("../config");

const {
  ensureLoggedIn,
  ensureAdmin
} = require("../middleware/auth");
  
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
 router.post('/login', async (req, res, next) => {
    try {
      const {
        username,
        password
      } = req.body;
      if (!username || !password) {
        throw new ExpressError("Username and password required", 400);
      }
      const results = await db.query(
        `SELECT username, password 
         FROM users
         WHERE username = $1`,
        [username]);
      const user = results.rows[0];
      if (user) {
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign({
            username
          }, SECRET_KEY);
          return res.json({
            message: `Logged in!`,
            token
          })
        }
      }
      throw new ExpressError("Invalid username/password", 400);
    } catch (e) {
      return next(e);
    }
  })

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try{
        const {username, password, first_name, last_name, phone} = req.body;
        if(!username || !password || !first_name || !last_name || !phone){
            throw new ExpressError("Missing needed info", 400)
        }
        const user = await User.register(username, password, first_name, last_name, phone)
        const token = jwt.sign({
            username
          }, SECRET_KEY);
        return res.json({user, token})
    }catch(e){
        next(e)
    }
})
module.exports = router;