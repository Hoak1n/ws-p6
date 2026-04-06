const fs = require("fs");
const http = require("http");

const port = process.argv[2];

const server = http.createServer(function (req, res) {
  const fullUrl = new URL(req.url, "http://localhost");

  if (req.method === "POST" && fullUrl.pathname === "/data") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        if (!body.trim()) {
          res.statusCode = 400;
          return res.end("Invalid JSON: Empty body");
        }

        const parsedData = JSON.parse(body);

        fs.writeFile("data.json", JSON.stringify(parsedData, null, 2), (err) => {
          if (err) {
            res.statusCode = 500;
            return res.end("Internal Server Error");
          }
          res.statusCode = 200;
          res.end("Data saved");
        });
      } catch (parseErr) {
        res.statusCode = 400;
        res.end("Invalid JSON");
      }
    });

    req.on("error", (err) => {
      res.statusCode = 500;
      res.end("Request error");
    });
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(port);
