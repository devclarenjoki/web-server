const { createServer } = require("http");
const { parse } = require("url");
const { join } = require("path");
const { readFile } = require("fs/promises");
const { renderFile } = require("ejs");

// Define the port on which it will run on. First checks environment variables for PORT and falls back to 8080,
const PORT = process.env.PORT ?? 8080;

// Define the allowed HTTP request methods.
const ALLOWED_METHODS = ["get", "post"];

// Create the server.
const server = createServer(async (req, res) => {
  /*
    // Uncomment to Check for content-type and content-length headers.
    const headers = req.headers;

    if (!headers["content-type"] && !headers["content-length"]) {
        // Do something
        return await BadRequestController(req, res);
    }
  */

  // Get the request method.
  const method = req.method;

  // Check if the request method is allowed.
  if (!ALLOWED_METHODS.includes(method.toLowerCase())) {
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

  // Split the pathname into an array and get the second element using es6 array destructuring
  const [_, staticOrDynamicPath] = pathname.split("/");

  // We only want to match /static and /dynamic. e.g. http:localhost:8080/static/index.html, http:localhost:8080/dynamic/index.ejs
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

// Start the server and listen on the port.
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

// This is a bad request controller. Will return a response with status code 400.
const BadRequestController = async (req, res) => {
  res.writeHead(400, { "Content-Type": "text/html" });
  res.write("Bad Request");
  return res.end("Bad Request");
};

// This is a method not allowed controller. Will return a response with status code 405.
const MethodNotAllowedController = async (req, res) => {
  res.writeHead(405, { "Content-Type": "text/html" });
  res.write("Method Not Allowed");
  return res.end("Method Not Allowed");
};

// This is a not found controller. Will return a response with status code 404.
const NotFoundController = async (req, res) => {
  const data = await readFile(join("public", "404.html"));
  res.writeHead(404, { "Content-Type": "text/html" });
  res.write(data);
  return res.end();
};

// This is the static html controller. Will read .html files inside the public/static folder and return them.
const StaticController = async (req, res) => {
  // Get the request url.
  const url = parse(req.url, true);

  // Get the request pathname.
  const { pathname } = url;

  // Split the pathname into an array and get the third element using es6 array destructuring. i.e. If we have request url of http:localhost:8080/static/index.html, then the third element will be index.html.(/ is the first element, static is the second element and index.html is the third element)
  const [_, __, filename] = pathname.split("/");

  try {
    // Read the file from the public/static folder.
    const data = await readFile(join("public/static", filename));

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return res.end();
  } catch (error) {
    return await BadRequestController(req, res);
  }
};

// This is the dynamic html controller. Will read .ejs files inside the public/dynamic folder, parse them using ejs templating engine and return them.
const DynamicController = async (req, res) => {
  // Get the request url.
  const url = parse(req.url, true);

  // Get the request pathname.
  const { pathname } = url;

  // Split the pathname into an array and get the third element using es6 array destructuring. i.e. If we have request url of http:localhost:8080/dynamic/index.ejs, then the third element will be index.ejs.(/ is the first element, dynamic is the second element and index.ejs is the third element)
  const [_, __, filename] = pathname.split("/");

  try {
    // Parse the ejs file from the public/dynamic folder.
    const data = await renderFile(
      join("public/dynamic", filename),
      {
        // Add some data to the template.
        dynamicContent: "This is a dynamic html page"
      },
      {
        beautify: false
      }
    );

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return res.end();
  } catch (error) {
    return await BadRequestController(req, res);
  }
};
