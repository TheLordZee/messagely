/** User class for message.ly */
const expressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const Message = require("./message")

const {
  BCRYPT_WORK_FACTOR
} = require("../config");

/** User of the site. */

class User {
  constructor({username, password, first_name, last_name, phone}){
    this.username = username;
    this.password = password;
    this.firstName = first_name;
    this.lastName = last_name;
    this.phone = phone;
  }

  /** register new user -- returns
  *    {username, password, first_name, last_name, phone}
  */

  static async register(username, password, first_name, last_name, phone){
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone])

    return {username, password, first_name, last_name, phone};
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(
      `SELECT username, password
       FROM users
       WHERE username = $1`,
      [username]);
    const user = results.rows[0];
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        return true
      }
    }
    return false
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const result = await db.query(
      `UPDATE users
         SET last_login_at = current_timestamp
         WHERE username = $1
         RETURNING username, last_login_at`,
      [username]);

  if (!result.rows[0]) {
    throw new ExpressError(`No such message: ${id}`, 404);
  }

  return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(
      `SELECT username,
              first_name AS firstName,
              last_name AS lastName,
              phone,
              join_at,
              last_login_at 
      FROM users`
    );
    return results.rows.map(c => new User(c));
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const results = await db.query(`
      SELECT 
          username,
          first_name,
          last_name,
          phone,
          join_at,
          last_login_at
      FROM users
      WHERE username = $1`,
      [username]);

    const user = results.rows[0];

    if (user === undefined) {
      const err = new expressError(`No such user: ${username}`, 404);
      throw err;
    }

    return new User(user);
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const res = await db.query(`
      SELECT id, to_username, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1`,
      [username])
    return res.rows.map(c => new Message(c));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const res = await db.query(`
      SELECT id, from_username, body, sent_at, read_at
      FROM messages
      WHERE to_username = $1`,
      [username])
    return res.rows.map(c => new Message(c));
  }
}


module.exports = User;