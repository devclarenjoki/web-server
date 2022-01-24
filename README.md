# web-server
## what the program does
Design a basic HTTP web-server application which can listen on a configurable TCP port and serve both static HTML and dynamically generated HTML by means of a chosen programming language, such as in the way Apache uses PHP. It is acceptable for this server application to support only a restricted subset of HTTP, such as GET or POST requests, and the only headers it must support are Content-Type and Content-Length.

This application downloads the text on a webpage and outputs a sorted list of the unique words on the page, with counts of the occurrences.

## My approach 
 
1. Create the server.
2. Check if the first element of the pathname is static or dynamic before starting the server.
3. Add request controllers to handle different HTTP requests.
4. Add dynamic and static site controllers(routes) where a user can navigate to a static or dynamic server.
5. Implement HTTPS using a self-signed certificate.

## Requirements

- node(12.13.0 or later)
- npm
- editor: Visual Studio Code(recommended)

## How to get started
Clone this repo [here](https://github.com/claremburu/web-server) unzip it and run the following command:
```
npm install
```

## Running the project
On your prject directory, run 
```
node final.js
```
