const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.db.file'); // we could return this on init - but for our simple app it is easier just to create it here.

// notice the promise here. there's a lib, promisify, where you can avoid this boiler plate
const init = () => {
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users(name TEXT PRIMARY KEY)');
    // In this tutorial: we'll be using the document id in our app even if it is user facing,
    // but it would be better to use UUIDs for it instead.
    // The id is an implementation detail that makes it possible for any user to know how many
    // documents there are in total.
    db.run('CREATE TABLE IF NOT EXISTS documents(id INTEGER PRIMARY KEY, content TEXT DEFAULT "", user TEXT, FOREIGN KEY(user) REFERENCES users(name))');
  });
};

const clear = () => {
  db.serialize(() => {
    db.run('DELETE FROM documents');
    db.run('DELETE FROM users');
  });
};

const drop = () => {
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS documents');
    db.run('DROP TABLE IF EXISTS users');
  });
};

const all = (stmt, param) => new Promise((resolve, reject) => {
  db.all(stmt, param, (err, rows) => {
    if (err) {
      reject(err);
    } else {
      resolve(rows);
    }
  });
});


const get = (stmt, param) => new Promise((resolve, reject) => {
  db.get(stmt, param, (err, row) => {
    if (err) {
      reject(err);
    } else {
      resolve(row);
    }
  });
});

const update = (stmt, param) => new Promise((resolve, reject) => 
  db.prepare(stmt)
    .run(param, function() { // notice the signature of the callback of run here! we have to use the 'this', thus we have to use a function
    if (this.changes) {
      resolve(this);
    } else {
      reject(this);
    }
  })
);

// CRUD: create, read (get), update, delete

// User
const createUser = async (name) => {
  await update('INSERT INTO users VALUES (?)', name);
  return {
    name,
  };
};

const getUser = (name) => get('SELECT * FROM users WHERE name = ?', name);

const getUsers = () =>
  all('SELECT * FROM users');

const deleteUser = (name) =>
  update('DELETE FROM users WHERE name = (?)', name);

// Documents
const createDocument = async (user) => {
  const { lastID } = await update('INSERT INTO documents(user) VALUES (?)', user);
  return {
    id: lastID,
    content: '',
    user,
  };
};

const getDocument = (id, user) =>
  get('SELECT * FROM documents WHERE id = ? AND user = ?', [ id, user ]);

const updateDocument = (id, user, content) =>
  update('UPDATE documents SET content = ? WHERE id = ? AND user = ?', [ content, id, user ]);

// We only get the document ids here - getting all documents and all the content could make the
// application really slow.
// Things like this is why it is important to know what you are doing :)
const getDocumentIdsForUser = (user) =>
  all('SELECT id FROM documents WHERE user = ?', user); // you can use LIMIT to paginate

const deleteDocument = (id) =>
  update('DELETE FROM documents WHERE id = ?', id);

// Note: it is possible to have functions here that we do NOT export
module.exports = {
  init, // this is the same as init: init
  clear,
  drop,
  // user:
  createUser,
  getUser,
  getUsers,
  deleteUser,
  // document:
  createDocument,
  getDocument,
  getDocumentIdsForUser,
  updateDocument,
  deleteDocument,
};