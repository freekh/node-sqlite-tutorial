const assert = require('assert');
const {
  init,
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
} = require('../backend/db');

describe('DB', () => {
  before(() => {
    init();
  });

  beforeEach(() => {
    clear();
  });

  after(() => {
    drop();
  })

  it('should CRUD users', async () => {
    const name = 'user1';
    const user = await createUser(name);
    assert.deepStrictEqual(user, await getUser(name));
    assert.deepStrictEqual([ user ], await getUsers());

    await deleteUser(user.name);
    assert.deepStrictEqual([], await getUsers());
  });

  it('should CRUD documents', async () => {
    const user = await createUser('user1');
    const document = await createDocument(user.name);
    assert.deepStrictEqual(document, await getDocument(document.id, user.name));
    assert.deepStrictEqual([{ id: document.id }], await getDocumentIdsForUser(document.user));

    const content1 = 'test';
    await updateDocument(document.id, document.user, content1);
    assert.deepStrictEqual({ ...document, content: content1 }, await getDocument(document.id, user.name));

    const content2 = 'blabla';
    await updateDocument(document.id, document.user, content2);
    assert.deepStrictEqual({ ...document, content: content2 }, await getDocument(document.id, user.name));

    await deleteDocument(document.id);
    assert.deepStrictEqual(undefined, await getDocument(document.id));
  });
});