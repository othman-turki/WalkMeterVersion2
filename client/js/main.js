const canvas = document.getElementById('canvas');
const runButton = document.getElementById('runButton');
const resetButton = document.getElementById('resetButton');
const delaySelect = document.getElementById('delaySelect');

const speed = document.getElementById('speed');
const cadence = document.getElementById('cadence');

// ====================================================================================================
// CANVAS START
// ====================================================================================================

// 1. DEACTIVATE RESET BUTTON
deactivateBtn(resetButton);
// 2. DRAW CANVAS GRID
drawGrid();
// 3. LISTEN TO USER ACTIONS
runButton.addEventListener('click', run);
resetButton.addEventListener('click', reset);

function activateBtn(element) {
  element.removeAttribute('disabled');
  return;
}

function deactivateBtn(element) {
  element.setAttribute('disabled', true);
  return;
}

function reset() {
  canvas.textContent = '';
  drawGrid();
  // ACTIVATE RUN BTN
  activateBtn(runButton);
  // DEACTIVATE RESET BTN
  deactivateBtn(resetButton);
}

function run() {
  // GET ALL POSITIONS
  axios({
    method: 'get',
    url: 'http://127.168.1.1:5000/api/positions',
  })
    .then((res) => {
      const { data } = res;

      //***** RUN *****//
      const timeDelay = timeDelayConstructor();
      timeDelay(0, data);
    })
    .catch((err) => console.error(err));
}

// CLOSURE FUNCTION - TO FIX DELAY VALUE
function timeDelayConstructor() {
  const delay = delaySelect.options[delaySelect.selectedIndex].value;

  // RUN FUNCTION
  return function timeDelay(count, data) {
    if (count === 0) {
      // DEACTIVATE RUN BTN
      deactivateBtn(runButton);
      // DEACTIVATE RESET BTN
      deactivateBtn(resetButton);

      drawPositionPoint(data[0].x_pos, data[0].y_pos);
      return timeDelay(1, data);
    }

    // let delay = delaySelect.options[delaySelect.selectedIndex].value;

    setTimeout(function () {
      if (count === data.length - 1) {
        drawPositionPoint(data[count].x_pos, data[count].y_pos);
        // ACTIVATE RESET BTN
        resetButton.removeAttribute('disabled');
        return;
      }

      drawPositionPoint(data[count].x_pos, data[count].y_pos);

      // console.log((data[count].timestamp - data[count - 1].timestamp) * delay);

      return timeDelay(count + 1, data);
    }, (data[count].timestamp - data[count - 1].timestamp) * delay);
  };
}

function drawPositionPoint(xPos, yPos) {
  let point = document.createElement('div');

  point.style.position = 'absolute';
  point.style.left = convertXCordsToPx(xPos) + 'px';
  point.style.top = convertYCordsToPx(yPos) + 'px';
  point.style.transform = 'translate(-50%, -50%)';
  point.style.width = '8px';
  point.style.height = '8px';
  point.style.backgroundColor = '#00365a';
  point.style.borderRadius = '100%';

  canvas.appendChild(point);
}

function convertXCordsToPx(xPos) {
  const CM_TO_MM = 10;
  const SCALE = 2;
  return (xPos * CM_TO_MM) / SCALE;
}

function convertYCordsToPx(yPos) {
  const CM_TO_MM = 10;
  const SCALE = 2;
  return (yPos * CM_TO_MM) / SCALE;
}

function drawXLines(top) {
  const line = document.createElement('span');
  line.classList.add('line-x');
  line.style.top = top + 'px';
  canvas.appendChild(line);
}

function drawYLines(left) {
  const line = document.createElement('span');
  line.classList.add('line-y');
  line.style.left = left + 'px';
  canvas.appendChild(line);
}

function drawGrid() {
  for (let i = 3; i < 232.5; i = i + 3) {
    drawXLines(i);
  }

  for (let i = 3; i < 2835; i = i + 3) {
    drawYLines(i);
  }
}

// ====================================================================================================
// TABLE START
// ====================================================================================================

axios({
  method: 'get',
  url: 'http://127.168.1.1:5000/api/parameters',
})
  .then((res) => {
    const { data } = res;

    //***** RUN *****//
    speed.innerText = `${data.speed} M/S`;
  })
  .catch((err) => console.error(err));
