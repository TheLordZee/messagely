const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");
const User = require("../models/user")
const bcrypt = require("bcrypt");
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', async (req, res, next) => {
    const results = await User.all()
    return res.json({users : results})
})
/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', async (req, res, next) => {
    try{
        const results = await User.get(req.params.username)
        return res.json({user : results})
    }catch(e){
        next(e);
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', async (req, res, next) => {
    const results = await User.messagesTo()
    return res.json({messages : results})
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
 
 router.get('/:username/from', async (req, res, next) => {
    const results = await User.messagesFrom()
    return res.json({messages : results})
})

 module.exports = router;