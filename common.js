// convert.js
const fs = require("fs");

const json = JSON.parse(
  fs.readFileSync("D:\\Download\\website-cabs-travels-firebase-adminsdk-fbsvc-69ec2e9e64.json", "utf8")
);

console.log(JSON.stringify(json));
