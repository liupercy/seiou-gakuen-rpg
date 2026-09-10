const player = document.getElementById("player");
const misaki = document.getElementById("misaki");

const joystick = document.getElementById("joystick");
const knob = document.getElementById("joystick-knob");

const action = document.getElementById("action");
const talkHint = document.getElementById("talkHint");

const dialog = document.getElementById("dialog");
const dialogName = document.getElementById("dialogName");
const dialogText = document.getElementById("dialogText");
const nextDialog = document.getElementById("nextDialog");

const questText = document.getElementById("questText");


/* =========================
   玩家資料
========================= */

let playerX = 50;
let playerY = 78;

let moveX = 0;
let moveY = 0;

const speed = 0.13;

let nearMisaki = false;
let talking = false;
let talkedToMisaki = false;

const keys = {};


/* =========================
   美咲對話
========================= */

const misakiDialog = [
  "你好呀！你就是今天轉學來的同學吧？",
  "我是美咲，1-A 的學生。",
  "你的教室也在 1-A 喔。",
  "如果不知道怎麼走，我可以帶你過去。",
  "歡迎來到星櫻學園！"
];

let dialogIndex = 0;


/* =========================
   鍵盤
========================= */

document.addEventListener("keydown", event => {

  const key = event.key.toLowerCase();

  keys[key] = true;

  if (key === "e") {
    interact();
  }

});


document.addEventListener("keyup", event => {

  keys[event.key.toLowerCase()] = false;

});


/* =========================
   Joystick
========================= */

let dragging = false;

function updateJoystick(clientX, clientY) {

  const rect = joystick.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = clientX - centerX;
  let dy = clientY - centerY;

  const maxDistance = 38;

  const distance = Math.sqrt(
    dx * dx +
    dy * dy
  );

  if (distance > maxDistance) {

    dx = dx / distance * maxDistance;
    dy = dy / distance * maxDistance;

  }

  knob.style.transform =
    `translate(${dx}px, ${dy}px)`;

  moveX = dx / maxDistance;
  moveY = dy / maxDistance;

}


/* =========================
   Touch
========================= */

joystick.addEventListener(
  "touchstart",
  event => {

    event.preventDefault();

    dragging = true;

    const touch = event.touches[0];

    updateJoystick(
      touch.clientX,
      touch.clientY
    );

  },
  { passive: false }
);


joystick.addEventListener(
  "touchmove",
  event => {

    event.preventDefault();

    if (!dragging) return;

    const touch = event.touches[0];

    updateJoystick(
      touch.clientX,
      touch.clientY
    );

  },
  { passive: false }
);


document.addEventListener(
  "touchend",
  resetJoystick
);


/* =========================
   Mouse
========================= */

joystick.addEventListener(
  "mousedown",
  event => {

    dragging = true;

    updateJoystick(
      event.clientX,
      event.clientY
    );

  }
);


document.addEventListener(
  "mousemove",
  event => {

    if (!dragging) return;

    updateJoystick(
      event.clientX,
      event.clientY
    );

  }
);


document.addEventListener(
  "mouseup",
  resetJoystick
);


function resetJoystick() {

  dragging = false;

  moveX = 0;
  moveY = 0;

  knob.style.transform =
    "translate(0px, 0px)";

}


/* =========================
   互動
========================= */

action.addEventListener(
  "click",
  interact
);


function interact() {

  if (talking) {

    nextConversation();
    return;

  }

  if (nearMisaki) {

    startConversation();

  }

}


/* =========================
   開始對話
========================= */

function startConversation() {

  talking = true;

  dialogIndex = 0;

  dialog.style.display = "block";

  dialogName.textContent = "美咲";

  dialogText.textContent =
    misakiDialog[0];

  talkHint.style.display =
    "none";

}


/* =========================
   下一句
========================= */

function nextConversation() {

  dialogIndex++;

  if (
    dialogIndex <
    misakiDialog.length
  ) {

    dialogText.textContent =
      misakiDialog[
        dialogIndex
      ];

  }

  else {

    endConversation();

  }

}


nextDialog.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    nextConversation();

  }
);


/* =========================
   結束對話
========================= */

function endConversation() {

  talking = false;

  talkedToMisaki = true;

  dialog.style.display =
    "none";

  questText.textContent =
    "○ 進入校舍";

}


/* =========================
   距離判斷
========================= */

function checkNPCDistance() {

  const misakiX = 38;
  const misakiY = 57;

  const dx =
    playerX - misakiX;

  const dy =
    playerY - misakiY;

  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );

  nearMisaki =
    distance < 9;

  if (
    nearMisaki &&
    !talking
  ) {

    talkHint.style.display =
      "block";

  }

  else {

    talkHint.style.display =
      "none";

  }

}


/* =========================
   玩家移動
========================= */

function updateMovement() {

  if (talking) {
    return;
  }

  let dx = moveX;
  let dy = moveY;


  if (
    keys["w"] ||
    keys["arrowup"]
  ) {
    dy = -1;
  }


  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {
    dy = 1;
  }


  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {
    dx = -1;
  }


  if (
    keys["d"] ||
    keys["arrowright"]
  ) {
    dx = 1;
  }


  /* 防止斜向速度變快 */

  const magnitude =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  if (magnitude > 1) {

    dx /= magnitude;
    dy /= magnitude;

  }


  playerX +=
    dx * speed;

  playerY +=
    dy * speed;


  /* =====================
     校門可走範圍
  ===================== */

  playerX =
    Math.max(
      23,
      Math.min(
        77,
        playerX
      )
    );


  playerY =
    Math.max(
      39,
      Math.min(
        87,
        playerY
      )
    );


  player.style.left =
    playerX + "%";

  player.style.top =
    playerY + "%";

}


/* =========================
   遊戲循環
========================= */

function gameLoop() {

  updateMovement();

  checkNPCDistance();

  requestAnimationFrame(
    gameLoop
  );

}


gameLoop();
