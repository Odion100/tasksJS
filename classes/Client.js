//The purpose of the client class is to have just one abstraction for sending request
//that will be used by all other classes. Even if I decide to change what module i use
//to actually send the request, the abstraction remains the same
const httpClient = require("request");

class Client {
  request({ method, url, body, json }, cb) {
    return new Promise((resolve, reject) => {
      httpClient({ method, url, body, json }, (err, res, body) => {
        if (err) {
          if (typeof cb === "function") cb(err);
          reject(err);
        } else if (res.statusCode >= 400) {
          if (typeof cb === "function") cb(body);
          reject(body);
        } else {
          if (typeof cb === "function") cb(null, body, res);
          resolve(body);
        }
      });
    });
  }

  uploadFile({ url, formData, json }, cb) {
    return new Promise((resolve, reject) => {
      httpClient.post({ url, formData, json }, (err, res, body) => {
        if (err) {
          if (typeof cb === "function") cb(err);
          reject(err);
        } else if (res.statusCode >= 400) {
          if (typeof cb === "function") cb(body);
          reject(body);
        } else {
          if (typeof cb === "function") cb(null, body, res);
          resolve(body);
        }
      });
    });
  }
}

let c = new Client();
c.request(
  { method: "GET", url: "https://jsonplaceholder.typicode.com/todos/3" },
  (err, res) => console.log(err, res)
);

(async () => {
  let results = await c.request({
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/todos/3"
  });

  console.log("<><><><><><><", results);
})();
exports = Client;
