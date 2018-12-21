import monkeypatcher from '../dist';

import fs from 'fs';
monkeypatcher(fs, /readFile/, {
  fn(name) {
    console.log.apply(console, arguments);
  },
  debug: true,
  getCallers: 'all',
});


// Asynchronous read
fs.readFile(`${__dirname }/data.txt`, (err, data) => {
  if (err) {
    return console.error(err);
  }
  console.log(`Asynchronous read: ${ data.toString()}`);
});

// Synchronous read
const data = fs.readFileSync(`${__dirname }/data.txt`);
console.log(`Synchronous read: ${ data.toString()}`);

console.log('Program Ended');
