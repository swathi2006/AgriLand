const session = require("express-session");
const Store = session.Store;

class FirestoreStore extends Store {
  constructor({ database, collection = "sessions" }) {
    super();
    this.db = database;
    this.collection = collection;
  }

  async get(sid, cb) {
    try {
      const doc = await this.db.collection(this.collection).doc(sid).get();
      cb(null, doc.exists ? doc.data() : null);
    } catch (err) {
      cb(err);
    }
  }

  async set(sid, session, cb) {
    try {
      await this.db.collection(this.collection).doc(sid).set(JSON.parse(JSON.stringify(session)));
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  async destroy(sid, cb) {
    try {
      await this.db.collection(this.collection).doc(sid).delete();
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  async touch(sid, session, cb) {
    try {
      await this.db.collection(this.collection).doc(sid).update(JSON.parse(JSON.stringify(session)));
      cb(null);
    } catch (err) {
      cb(err);
    }
  }
}

module.exports = FirestoreStore;
