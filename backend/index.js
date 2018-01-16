// require the modules we need
const path= require('path');
const express = require('express');
const bodyParser = require('body-parser');

const {
  init,
  createUser,
  getUser,
  createDocument,
  getDocument,
  getDocumentIdsForUser,
  updateDocument,
} = require('./db');

const port = 3000;
const app = express();
const parseText = bodyParser.text();
const parseUrlencoded = bodyParser.urlencoded({ extended: true });

const rootDir = __dirname; // this is different in Node where we have access to files (which a browser does not - at least not directly)
const frontendDir = path.join(rootDir, '..', 'frontend');

// FRONTEND

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/index.js', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.js'));
});

app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(frontendDir, 'styles.css'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(frontendDir, 'login.html'));
});

app.post('/login', parseUrlencoded, async (req, res) => {
  const name = req.body.name;
  // Ingrid Espelid style (yes: norwegian reference)...
  // here we cheat a bit by creating unknown users and avoid the whole signup thing...
  const user = await getUser(name);
  if (!user) {
    await createUser(name);
  }
  res.redirect(`/documents/${ name }`);
});

app.get('/documents/:name', async (req, res) => {
  const { name } = req.params;
  const document = await createDocument(name);
  res.redirect(`/documents/${name}/${document.id}`);
});

app.get('/documents/:name/:id', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.post('/documents/:name/:id', async (req, res) => {
  const { name } = req.params;
  const document = await createDocument(name);
  res.redirect(`/documents/${name}/${document.id}`);
});

// API

app.get('/api/documents/:name/:id', async (req, res) => {
  const { name, id } = req.params;
  res.json(await getDocument(id, name));
});

app.post('/api/documents/:name/:id', parseText, async (req, res) => {
  const { name, id } = req.params;
  const content = req.body;
  try {
    // this will fail if user did not exist / document is not owned
    res.json(await updateDocument(id, name, content));
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get('/api/documents/:name', parseText, async (req, res) => {
  const { name } = req.params;
  // we could paginate here, but that's left as an excerise for the reader
  res.json(await getDocumentIdsForUser(name));
});

// You would have to implement app.delete('/api/documents/:name/:id')
// using deleteDocument (from db.js) to have document deletion.

// INIT

// DB
init();

// Web app
app.listen(port, async () => {
  console.log('Listening on port ' + port)
});
