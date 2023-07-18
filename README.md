# RSSchool NodeJS websocket task template
> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage
**App**
When server starts you can see static server port (UI) and Websocket information in a process console.
Each recieved command displays in process console.
After program stopped each WS connection will be closed

User adds to DB when register and removes when WS connection closed. There is no possible to create some users whith the same names.

**Development**

* rename `.env.example` to `.env` or create your own. *Remember about client tries  to connect to 3000*

`npm run start:dev`

* App served @ `http://localhost` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost` without nodemon

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | App served @ `http://localhost` with nodemon
`npm run start` | App served @ `http://localhost` without nodemon

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.
