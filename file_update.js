const fs = require("fs");
const http = require("http");

const port = process.argv[2];

const server = http.createServer(function (req, res) {
  const fullUrl = new URL(req.url, "http://localhost");
  const pathParts = fullUrl.pathname.split("/");

  if (req.method === "PUT" && pathParts[1] === "data" && pathParts[2]) {
    const id = parseInt(pathParts[2]);
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const updateData = JSON.parse(body);
        fs.readFile("data.json", "utf8", (readErr, data) => {
          if (readErr) {
            res.statusCode = 500;
            return res.end("Error reading data.json");
          }

          let list = JSON.parse(data);
          if (!Array.isArray(list)) {
            res.statusCode = 500;
            return res.end("Data is not an array");
          }

          const itemIndex = list.findIndex((item) => item.id === id);

          if (itemIndex === -1) {
            res.statusCode = 404;
            return res.end("Item not found");
          }

          list[itemIndex] = { ...list[itemIndex], ...updateData };

          fs.writeFile("data.json", JSON.stringify(list, null, 2), (writeErr) => {
            if (writeErr) {
              res.statusCode = 500;
              return res.end("Error saving file");
            }
            res.statusCode = 200;
            res.end("Updated successfully");
          });
        });
      } catch (e) {
        res.statusCode = 400;
        res.end("Invalid JSON");
      }
    });
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(port);
