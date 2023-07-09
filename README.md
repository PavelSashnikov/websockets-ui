# RSSchool NodeJS websocket task template
> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage
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
