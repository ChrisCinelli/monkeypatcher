import monkeypatcher from '..';

import fs from 'fs';
monkeypatcher(fs, /readFile/,  {
    fn: function (name) {
         console.log.apply(console, arguments);
        },
    debug: true,
    getCallers: 'all'
});


// Asynchronous read
fs.readFile(__dirname  + '/data.txt', function (err, data) {
   if (err) {
      return console.error(err);
   }
   console.log("Asynchronous read: " + data.toString());
});

// Synchronous read
var data = fs.readFileSync(__dirname  + '/data.txt');
console.log("Synchronous read: " + data.toString());

console.log("Program Ended");