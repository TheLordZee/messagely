const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");
const {authenticateJWT, ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth")
const Message = require("../models/message")

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', authenticateJWT, async (req, res, next) => {
    try{
        const message = await Message.get(req.param.id)
        return res.json({message})
    }catch(e){
        next(e)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try{
        const {to_username, body} = req.body;
        const from_username = req.user.username;
        console.log("username", from_username)
        const message = await Message.create(from_username, to_username, body)
        return res.json(message)
    }catch(e){
        next(e)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try{
        const message = await db.query(`
        SELECT to_username FROM messages 
        WHERE id = $1`,
        [req.params.id])
        if(message.rows[0].to_username === req.user.username){
           const results = await Message.markRead(req.params.id)
           return res.json({message: results}) 
        }else{
            throw new ExpressError("Unauthorized Access", 401)
        }
    }catch(e){
        next(e)
    }
})


module.exports = router;