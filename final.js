const { createServer } = require("https");
const { parse } = require("url");
const { join } = require("path");
const { readFile } = require("fs/promises");
const { renderFile } = require("ejs");
const { readFileSync } = require("fs");
const express = require("express");

const app = express();

const PORT = process.env.PORT || 8080;

const allowedMethods = ["get", "post"];

const options = {
  key: readFileSync("key.pem"),
  cert: readFileSync("cert.pem"),
};

// Create the server.
const server = createServer(options, async (req, res) => {
  const method = req.method;

  if (!allowedMethods.includes(method.toLowerCase())) {
    return await MethodNotAllowedController(req, res);
  }

  const url = parse(req.url, true);

  const { pathname } = url;

  if (pathname === "/") {
    const data = await readFile("public/index.html");

    res.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Length": data.length,
    });
    res.write(data);
    return res.end();
  }

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
  res.writeHead(400, {
    "Content-Type": "text/html",
    "Content-Length": "Bad Request",
  });
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
  res.writeHead(404, {
    "Content-Type": "text/html",
    "Content-Length": data.length,
  });
  res.write(data);
  return res.end();
};

// static html controller
const StaticController = async (req, res) => {
  const url = parse(req.url, true);

  const { pathname } = url;

  const [_, __, filename] = pathname.split("/");

  try {
    const data = await readFile(join("public/static", filename));

    res.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Length": data.length,
    });
    res.write(data);
    return res.end();
  } catch (error) {
    return await BadRequestController(req, res);
  }
};

// dynamic html controller
const DynamicController = async (req, res) => {
  const url = parse(req.url, true);

  const { pathname } = url;

  const [_, __, filename] = pathname.split("/");

  try {
    const data = await renderFile(
      join("public/dynamic", filename),
      {
        dynamicContent: "This is a dynamic html page",
      },
      {
        beautify: false,
      }
    );

    res.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Length": data.length,
    });
    res.write(data);
    return res.end();
  } catch (error) {
    return await BadRequestController(req, res);
  }
};
