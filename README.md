# xyquest
A proxy based HTTP requests utility

## Installation
`npm install --save xyquest`

## Example of Usage
```js
const xyquest = require('xyquest')('https://jsonplaceholder.typicode.com', { json: true });

async function updateFirstComment(postId, patch) {
  const [comment] = await xyquest.posts[postId].comments.get();
  Object.assign(comment, patch);
  await xyquest.comments[comment.id].put(comment);
  return true;
}
```
