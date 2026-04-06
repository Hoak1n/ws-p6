const fs = require("fs");
const http = require("http");

const port = process.argv[2];

const server = http.createServer(function (req, res) {
  const fullUrl = new URL(req.url, "http://localhost");
  const pathParts = fullUrl.pathname.split("/");

  if (req.method === "DELETE" && pathParts[1] === "data" && pathParts[2]) {
    const id = parseInt(pathParts[2]);

    fs.readFile("data.json", "utf8", (readErr, data) => {
      if (readErr) {
        res.statusCode = 500;
        return res.end("Internal Server Error");
      }

      let list;
      try {
        list = JSON.parse(data);
      } catch (e) {
        res.statusCode = 400;
        return res.end("Malformed JSON in file");
      }

      const exists = list.some((item) => item.id === id);
      if (!exists) {
        res.statusCode = 404;
        return res.end("Item not found");
      }

      const newList = list.filter((item) => item.id !== id);

      fs.writeFile("data.json", JSON.stringify(newList, null, 2), (writeErr) => {
        if (writeErr) {
          res.statusCode = 500;
          return res.end("Error saving file");
        }
        res.statusCode = 200;
        res.end("Item deleted");
      });
    });
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(port);
