import { ExampleProgram } from "./types";

export const example09NodeServerApi: ExampleProgram = {
    id: 'node_server_api',
    name: '9. Node.js Express & Backend API',
    category: 'Node.js Target',
    description: 'Server-side microservice with route matching, Node HTTP module bindings, JSON payload transformation, and HTTP status codes.',
    code: `module ServerApp {
  export type HttpResponse =
    | Ok(body: string, status: number): HttpResponse
    | NotFound(message: string): HttpResponse
    | Error(err: string): HttpResponse

  export function handleRoute(path: string, method: string): HttpResponse {
    match ([path, method]) {
      ["/api/health", "GET"] => Ok("{\\"status\\": \\"healthy\\", \\"version\\": \\"0.2\\"}", 200)
      ["/api/users", "GET"]  => Ok("[{\\"id\\": 1, \\"name\\": \\"Alice\\"}, {\\"id\\": 2, \\"name\\": \\"Bob\\"}]", 200)
      ...                    => NotFound(concat("Route not found: ", path))
    }
  }
}

import ServerApp.{ HttpResponse, handleRoute, Ok, NotFound }
import Node.{ createApp, get, listen, status, json, now }

// 1. Process ADT pattern-matched routes
let res1 = handleRoute("/api/health", "GET")
match (res1) {
  Ok(body, st)     => println(concat("200 OK Response: ", body))
  NotFound(msg)    => println(concat("404 Error: ", msg))
  ...              => println("Unknown response")
}

let res2 = handleRoute("/api/unknown", "POST")
match (res2) {
  Ok(body, st)     => println(concat("200 OK Response: ", body))
  NotFound(msg)    => println(concat("404 Error: ", msg))
  ...              => println("Unknown response")
}

// 2. Initialize and bind Node Express HTTP Server
let app = createApp()

get(app, "/health", fn(req, res) => {
  status(res, 200)
  json(res, { status: "ok", uptime: now() })
})

get(app, "/users", fn(req, res) => {
  status(res, 200)
  json(res, [{ id: 1, name: "Ada Lovelace" }, { id: 2, name: "Alan Turing" }])
})

listen(app, 8080, fn() => {
  println("Server ready on port 8080")
})
`
  };
