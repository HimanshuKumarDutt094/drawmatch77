import { io } from "socket.io-client";
import DrawableCanvas from "./DrawableCanvas.js";
const production = process.env.NODE_ENV === "production";
const serverURL = production
  ? "https://chat-app-socket-io.netlify.app"
  : "http://localhost:3000";
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room-id");
const name = urlParams.get("name");
console.log(roomId, name);

if (!roomId || !name) {
  window.location.href = "/index.html";
}

const io = require("socket.io-client");
const socket = io(serverURL);
console.log(socket);
const guessForm = document.querySelector("[data-guess-form]");
const guessInput = document.querySelector("[data-guess-input]");
const wordElement = document.querySelector("[data-word]");
const messagesElement = document.querySelector("[data-message]");
const readyButon = document.querySelector("[data-ready-btn]");
const canvas = document.querySelector("[data-canvas]");
const drawableCanvas = new DrawableCanvas(canvas, socket);
const guessTemplate = document.querySelector("[data-guess-template]");

socket.emit("join-room", { name: name, roomId: roomId });
socket.on("start-drawer", startRoundDrawer);
socket.on("start-guesser", startRoundGuesser);
socket.on("guess", displayGuess);
socket.on("winner", endRound);
endRound();
resizeCanvas();
setupHTMLEvents();
function setupHTMLEvents() {
  readyButon.addEventListener("click", () => {
    hide(readyButon);
    socket.emit("ready");
    show(guessForm);
  });
  guessForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (guessInput.value === "") return;

    socket.emit("make-guess", { guess: guessInput.value });
    displayGuess(name, guessInput.value);
    guessInput.value = "";
  });
  window.addEventListener("resize", resizeCanvas);
}
function startRoundDrawer(word) {
  drawableCanvas.canDraw = true;
  drawableCanvas.clearCanvas();
  messagesElement.innerHTML = "";

  wordElement.innerText = word;
}
function startRoundGuesser() {
  show(guessForm);
  hide(wordElement);
  wordElement.innerText = "";
  drawableCanvas.clearCanvas();
  messagesElement.innerHTML = "";
}
function resizeCanvas() {
  canvas.width = null;
  canvas.height = null;
  const clientDimension = canvas.getBoundingClientRect();
  canvas.width = clientDimension.width;
  canvas.height = clientDimension.height;
}
function endRound(name, word) {
  if (name && word) {
    wordElement.innerText = word;
    show(wordElement);
    displayGuess(null, `${name} won! The word was ${word}`);
  }
  drawableCanvas.canDraw = false;
  show(readyButon);
  hide(guessForm);
}
function hide(element) {
  element.classList.add("hide");
}
function show(element) {
  element.classList.remove("hide");
}
function displayGuess(guessUsername, guess) {
  const guessElement = guessTemplate.content.cloneNode(true);
  const messageElement = guessElement.querySelector("[data-text]");
  const nameElement = guessElement.querySelector("[data-name]");
  nameElement.innerText = guessUsername;
  messageElement.innerText = guess;
  messagesElement.append(guessElement);
}
