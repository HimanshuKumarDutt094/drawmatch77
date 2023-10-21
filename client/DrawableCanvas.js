export default function DrawableCanvas(canvas, socket) {
  this.canDraw = false;
  this.clearCanvas = () => {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };
  let prevPosition = null;
  canvas.addEventListener("mousemove", (e) => {
    if (e.buttons !== 1 || !this.canDraw) {
      prevPosition = null;
      return;
    }
    canvas.addEventListener("mouseleave", () => (prevPosition = null));
    const newPosition = { x: e.layerX, y: e.layerY };
    if (prevPosition != null) {
      drawLine(prevPosition, newPosition);
      socket.emit("draw", {
        start: normalizeCoordinates(prevPosition),
        end: normalizeCoordinates(newPosition),
      });
    }
    prevPosition = newPosition;
  });
  socket.on("draw-line", (start, end) => {
    drawLine(toCanvasSpace(start), toCanvasSpace(end));
  });
  function drawLine(start, end) {
    const context = canvas.getContext("2d");
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }
  function normalizeCoordinates(position) {
    return {
      x: position.x / canvas.width,
      y: position.y / canvas.height,
    };
  }
  function toCanvasSpace(position) {
    return { x: position.x * canvas.width, y: position.y * canvas.height };
  }
}
