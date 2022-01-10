const { createServer } = require("https");
const { parse } = require("url");
const { join } = require("path");
const { readFile } = require("fs/promises");
const { renderFile } = require("ejs");
const { readFileSync } = require("fs");

//port number
const PORT = process.env.PORT || 8080;

// allowed methods
const allowedMethods = ["GET", "POST"];

const options = {
  key: readFileSync("key.pem"),
  cert: readFileSync("cert.pem"),
};

// Create the server.
const server = createServer(options, async (req, res) => {
  //check request headers
  const headers = req.headers;

  if (!headers["content-type"] && !headers["content-length"]) {
    return await BadRequestController(req, res);
  }

  // Get the request method.
  const method = req.method;

  // Check if the request method is allowed.
  if (!allowedMethods.includes(method.toLowerCase())) {
    return await MethodNotAllowedController(req, res);
  }

  // Get the request url.
  const url = parse(req.url, true);

  // Get the request pathname.
  const { pathname } = url;

  // If the request url is /, then return the index.html file.
  if (pathname === "/") {
    const data = await readFile("public/index.html");

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return res.end();
  }

  // get the first element of the pathname.

  const [_, staticOrDynamicPath] = pathname.split("/");

  //check if the first element of the pathname is static or dynamic
  switch (staticOrDynamicPath) {
    case "static": {
      return await StaticController(req, res);
    }

    case "dynamic": {
      return await DynamicController(req, res);
    }

    default: {
      return await NotFoundController(req, res);
    }
  }
});

// Start the server.
server.listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}/`);
});

//bad request controller
const BadRequestController = async (req, res) => {
  res.writeHead(400, { "Content-Type": "text/html" });
  res.write("Bad Request");
  return res.end("Bad Request");
};

// method not allowed controller
const MethodNotAllowedController = async (req, res) => {
  res.writeHead(405, { "Content-Type": "text/html" });
  res.write("Method Not Allowed");
  return res.end("Method Not Allowed");
};

// not found controller
const NotFoundController = async (req, res) => {
  const data = await readFile(join("public", "404.html"));
  res.writeHead(404, { "Content-Type": "text/html" });
  res.write(data);
  return res.end();
};

// static html controller
const StaticController = async (req, res) => {
  // Get the request url.
  const url = parse(req.url, true);

  // Get the request pathname.
  const { pathname } = url;

  // get the third element of the pathname.
  const [_, __, filename] = pathname.split("/");

  try {
    // Read the html file from the public folder.
    const data = await readFile(join("public/static", filename));

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return res.end();
  } catch (error) {
    return await BadRequestController(req, res);
  }
};

// dynamic html controller
const DynamicController = async (req, res) => {
  // Get the request url.
  const url = parse(req.url, true);

  // Get the request pathname.
  const { pathname } = url;

  // Get the third element of the pathname.
  const [_, __, filename] = pathname.split("/");

  try {
    // Parse the ejs file from the public/dynamic folder.
    const data = await renderFile(
      join("public/dynamic", filename),
      {
        // Add some data to the template.
        dynamicContent: "This is a dynamic html page",
      },
      {
        beautify: false,
      }
    );

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return res.end();
  } catch (error) {
    return await BadRequestController(req, res);
  }
};
