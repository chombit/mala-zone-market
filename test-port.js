"use strict";

console.log("Testing PORT configuration...");
console.log("process.env.PORT =", process.env.PORT);
const PORT = process.env.PORT || 4001;
console.log("Final PORT =", PORT);
