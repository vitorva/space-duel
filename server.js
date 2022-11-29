import express from 'express';
import expressWs from 'express-ws';
import { Game } from './src/game.js';
import { Codec } from './src/message.js';
import { BossController } from './src/boss.js';
import { bossRespawnRate } from './src/constants.js';

const app = express();
expressWs(app);

// The sockets of the connected players seperated into teams
let sockets = [];
let bossController;
const codec = new Codec();

// Initialize the game
const game = new Game((message) => {
  // TODO: Broadcast the message to the connected browsers
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) {
      socket.send(codec.encode(message));
    }
  }
});

setInterval(() => {
  if (bossController !== undefined) {
    bossController.update();
  }
  if (game.move()) {
    setTimeout(() => {
      bossController = new BossController(game);
    }, bossRespawnRate);
  }
}, 10);

// Serve the public directory
app.use(express.static('public'));

// Serve the src directory
app.use('/src', express.static('src'));

// Serve the src directory
app.use('/test', express.static('test'));

// Serve the jsdoc directory
app.use('/doc', express.static('out'));

// Serve the dist directory
app.use('/dist', express.static('dist'));

// Websocket game events
app.ws('/', (socket) => {
  sockets.push(socket);

  // Let a new player join the game
  const player = game.join(false);

  socket.on('message', (string) => {
    const message = codec.decode(string);
    game.onMessage(player, message);
  });

  socket.on('close', () => {
    game.quit(player);
    sockets = sockets.filter((s) => s !== socket);
  });
});

app.listen(3000);

console.log('Starting game server at port 3000');
