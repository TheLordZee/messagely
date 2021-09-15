const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

module.exports = router;