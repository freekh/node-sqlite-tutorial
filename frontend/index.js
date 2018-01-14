const saveButton = document.getElementById('save');
const status = document.getElementById('status');
const content = document.getElementById('content');

const url = '/api' + location.pathname; // we just use the same url because we can (we created it like that), but could use regexps here to extract which document it was...

window.onload = () => {
  status.innerHTML = 'Loading...';
  fetch(url).then((response) => {
    return response.json();
  }).then((document) => {
    content.value = document.content;
    status.innerHTML = 'Done';
  }).catch((err) => {
    console.error(err);
    status.innerHTML = 'Failed!';
  });
};

saveButton.addEventListener('click', () => {
  status.innerHTML = 'Saving...';
  fetch(url, {
    method: 'POST',
    body: content.value,
  }).then(() => {
    status.innerHTML = 'Saved!';
  });
});

content.addEventListener('keyup', () => {
  status.innerHTML = 'Hit save';
});