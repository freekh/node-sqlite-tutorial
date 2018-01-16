const saveButton = document.getElementById('save');
const status = document.getElementById('status');
const content = document.getElementById('content');
const listOfLinks = document.getElementById('links');

const pathnameParts = location.pathname.split('/'); // this splits the pathname (/documents/username/1) into an array of 4: first is empty, seconds: documents, then: username, then: id
const name = pathnameParts[2];
const id = pathnameParts[3];

// we create this helper to add links to other documents
const createDocumentLink = (parent, src) => {
  const listElem = document.createElement('li');
  const link = document.createElement('a');
  link.setAttribute('href', src);
  link.innerHTML = src;
  listElem.appendChild(link);
  parent.appendChild(listElem);
};

window.onload = () => {
  status.innerHTML = 'Loading...';

  /*
   * This is sort of advanced stuff: fetch returns a Promise,
   * and since we (or I) wanted to only do something if everything
   * works, by updating the status in this case, we use Promise.all
   * that converts an Array with values of Promises to a Promise of Array with values.
   * That's a real brain cruncher - I know. It's really useful to know about though
   */
  Promise.all([
    fetch('/api/documents/' + name + '/' + id),
    fetch('/api/documents/' + name)
  ]).then((responses) => {
    /*
     * These lines also might be a bit hard to understand:
     * first we map all responses and get their json since that returns an Array of Promises,
     * we use Promise.all again to convert that to a new promise with an Array of the json
     */
    return Promise.all(
      responses.map((response) => response.json())
    );
  }).then((jsons) => {
    const thisDoc = jsons[0]; // the first response one is this document
    const userDocs = jsons[1]; // the second response is all documents for this user

    content.value = thisDoc.content;

    for (d of userDocs) {
      createDocumentLink(listOfLinks, '/documents/' + name + '/' + d.id);
    }

    status.innerHTML = 'Done';
  }).catch((err) => {
    console.error(err);
    status.innerHTML = 'Failed to load content!';
  });;
};

saveButton.addEventListener('click', () => {
  status.innerHTML = 'Saving...';
  fetch('/api/documents/' + name + '/' + id, {
    method: 'POST',
    body: content.value,
  }).then(() => {
    status.innerHTML = 'Saved!';
  });
});

content.addEventListener('keyup', () => {
  status.innerHTML = 'Hit save';
});