const svg = document.getElementById("pattern-area");

function createShape(x, y, type) {
  const ns = "http://www.w3.org/2000/svg";
  const shape = document.createElementNS(ns, type);
  shape.setAttribute("cx", x);
  shape.setAttribute("cy", y);
  shape.setAttribute("r", 10);
  shape.setAttribute("fill", "skyblue");
  svg.appendChild(shape);
}

for (let i = 0; i < 5; i++) {
  const x = Math.random() * 480;
  const y = Math.random() * 480;
  createShape(x, y, "circle");
}

document.getElementById("export-btn").onclick = () => {
  console.log(svg.outerHTML);
};
