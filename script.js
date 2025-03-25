// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
   apiKey: "AIzaSyAjh1vhKPHAZIKEEUI2UuD1im2pEAlREO8",
  authDomain: "carmovingtest1.firebaseapp.com",
  databaseURL: "https://carmovingtest1-default-rtdb.firebaseio.com",
  projectId: "carmovingtest1",
  storageBucket: "carmovingtest1.firebasestorage.app",
  messagingSenderId: "754117511734",
  appId: "1:754117511734:web:03bf7d3714436ea8ada697",
  measurementId: "G-Y0KQR0KWSH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to send movement command
function sendCommand(direction, value) {
    set(ref(database, `robot/${direction}`), value)
    .then(() => {
        document.getElementById("statusText").innerText = `Command Sent: ${direction} (${value})`;
        console.log(`Sent command: ${direction} -> ${value}`);
    })
    .catch(error => {
        console.error("Firebase error:", error);
    });
}

// ✅ Keyboard Controls (Arrow Keys + W/A/S/D + Space for Stop)
const keyMap = {
    "ArrowUp": "Forward", "w": "Forward",
    "ArrowLeft": "Left", "a": "Left",
    "ArrowRight": "Right", "d": "Right",
    "ArrowDown": "Reverse", "s": "Reverse",
    " ": "Stop" // Spacebar for stop
};

// Detect key press
document.addEventListener("keydown", (event) => {
    let command = keyMap[event.key];
    if (command) sendCommand(command, 1);
});

// Detect key release
document.addEventListener("keyup", (event) => {
    let command = keyMap[event.key];
    if (command) sendCommand(command, 0);
});

// ✅ Xbox Controller Support (D-Pad + A/X/Y/B for Movement, RT for Stop)
let controllerConnected = false;

// Xbox Button Mapping (No Joystick)
const xboxButtons = {
    12: "Forward",  // D-Pad Up
    14: "Left",     // D-Pad Left
    15: "Right",    // D-Pad Right
    13: "Reverse",  // D-Pad Down
    2: "Forward",   // X Button
    3: "Left",      // Y Button
    1: "Right",     // B Button
    0: "Reverse",   // A Button
    7: "Stop"       // RT (Right Trigger) for Stop
};

// Listen for gamepad connection
window.addEventListener("gamepadconnected", (event) => {
    console.log("Gamepad connected:", event.gamepad.id);
    controllerConnected = true;
    updateGamepad();
});

window.addEventListener("gamepaddisconnected", () => {
    console.log("Gamepad disconnected");
    controllerConnected = false;
});

// Function to continuously read controller inputs
function updateGamepad() {
    if (!controllerConnected) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0]; // Use first connected gamepad

    if (gamepad) {
        // Read D-Pad, A/X/Y/B, and RT Buttons (Ignore Joysticks)
        gamepad.buttons.forEach((button, index) => {
            if (xboxButtons[index]) {
                let command = xboxButtons[index];
                let value = button.pressed ? 1 : 0;
                sendCommand(command, value);
            }
        });
    }

    requestAnimationFrame(updateGamepad); // Continuously check for input
}

// ✅ Mobile Touch Controls
const touchControls = {
    "forwardBtn": "Forward",
    "leftBtn": "Left",
    "rightBtn": "Right",
    "reverseBtn": "Reverse",
    "stopBtn": "Stop"
};

Object.keys(touchControls).forEach(btnId => {
    let button = document.getElementById(btnId);
    let command = touchControls[btnId];

    if (button) {
        // Touch Start (Press → Send 1)
        button.addEventListener("touchstart", (event) => {
            event.preventDefault(); // Prevent scrolling
            sendCommand(command, 1);
        });

        // Touch End (Release → Send 0)
        button.addEventListener("touchend", (event) => {
            event.preventDefault();
            sendCommand(command, 0);
        });
    }
});
