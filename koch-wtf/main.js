const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

function length(vec) {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function diff(v1, v2) {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

function add(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

function mult(vec, s) {
  return { x: vec.x * s, y: vec.y * s }
}

function angle(vec) {
  return Math.atan2(vec.y, vec.x);
}

function rotate(vec, alpha) {
  if (vec.x == 0 && vec.y == 0) return vec;
  const beta = angle(vec);
  const fAngle = alpha + beta;
  const l = length(vec);
  return { x: Math.cos(fAngle) * l, y: Math.sin(fAngle) * l }
}

function equiTrianglePoints(size, angle = 0) {
  const points = [
    { x: 0, y: 0 },
    rotate({x: size, y: 0}, Math.PI / 3),
    {x: size, y: 0},
  ];
  return points.map(p => add(rotate(p, angle), { x: size / 2, y: 0 }))
}

function makeKochSide3(s0, s1) {
  const s_diff = diff(s1, s0);
  const s_angle = angle(s_diff)
  const d = rotate(s_diff, -s_angle);

  const l = length(d);
  const c1 = { x: l / 3, y: 0 };
  const c2 = { x: l / 2, y: l / 3 * Math.sin(Math.PI / 3)};
  const c3 = { x: 2 * l / 3, y: 0};

  const points = [
    s0,
    add(s0, rotate(c1, s_angle)),
    add(s0, rotate(c2, s_angle)),
    add(s0, rotate(c3, s_angle)),
    s1,
  ];
  return points;
}

function makeKochSide4(s0, s1) {
  const s_diff = diff(s1, s0);
  const s_angle = angle(s_diff)
  const d = rotate(s_diff, -s_angle);

  const l = length(d);
  const c1 = { x: l / 3, y: 0 };
  const c2 = { x: l / 3, y: l / 3};
  const c3 = { x: 2 * l / 3, y: l / 3};
  const c4 = { x: 2 * l / 3, y: 0};

  const points = [
    s0,
    add(s0, rotate(c1, s_angle)),
    add(s0, rotate(c2, s_angle)),
    add(s0, rotate(c3, s_angle)),
    add(s0, rotate(c4, s_angle)),
    s1,
  ];
  return points;
}

function drawPoint(x, y) {
  if (typeof y === 'undefined') {
    y = x.y;
    x = x.x;
  }
  ctx.beginPath();

  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fill();
}

function drawVector(vec) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(vec.x, vec.y);
  ctx.stroke();
}

function drawLine(p1, p2) {
  ctx.strokeStyle = `rgb(40, 
    ${render_iteration * 10 % 255}, 
    ${render_iteration * 10 % 255}
  )`;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}
function drawChain(points, close = false) {
  for (let i = 0; i < points.length - 1; i++) {
    drawLine(points[i], points[i + 1]);
  }
  if (close)
    drawLine(points[points.length - 1], points[0]);
}

let render_iteration = 0;
const max_size = 300;
let size = max_size;
let diff_size = 3;
let going_reverse = false;
const noise = 0.03;

function render() {
  let segmentPoints = equiTrianglePoints(size, Math.PI / 3);
  // let segmentPoints = [{x: 0, y: 0}, {x:size, y: 0}, {x: size, y: size}, {x:0, y: size}];
  if (size < 0) {
    going_reverse = true;
    diff_size = - diff_size;
  }
  if (size > max_size && going_reverse) {
    // return;
  }
  size -= diff_size;
  render_iteration++;
  const cur_diff = Math.abs(diff_size) * render_iteration;
  // segmentPoints = segmentPoints.map(s => add(s, {x:cur_diff / 2 , y:cur_diff/ 2}))
  segmentPoints = segmentPoints.map(s => rotate(s, Math.PI / 9 * render_iteration));
  for (let step = 0; step < 4; step++) {
    let nextSegmentPoints = [];
    for (let i = 0; i < segmentPoints.length; i++) {
      const left = segmentPoints[i];
      const right = i == segmentPoints.length - 1 ? segmentPoints[0] : segmentPoints[i + 1];

      const leftM = mult(left, (1 - noise) + Math.random() * 2 * noise);
      const rightM = mult(right, (1 - noise) + Math.random() * 2 * noise);
      const makeKochSide = Math.random() > 0.5 ? makeKochSide3 : makeKochSide4;
      const sidePoints = makeKochSide(leftM, rightM);
      nextSegmentPoints = nextSegmentPoints.concat(sidePoints);
    }
    segmentPoints = nextSegmentPoints;
  }
  drawChain(segmentPoints);
}

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.translate(400, 400);

setInterval(render, 10);
