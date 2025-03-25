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

// Function to send motor direction and speed command
function sendMotorCommand(directionValue) {
    set(ref(database, "FrontMotorDirection"), directionValue)
    .then(() => {
        document.getElementById("statusText").innerText = `Motor Direction: ${directionValue}, Speed: 200`;
        console.log(`Set Motor Direction: ${directionValue}, Speed: 200`);
    })
    .catch(error => {
        console.error("Firebase error:", error);
    });

    // Set speed to fixed value 200
    set(ref(database, "FrontMotorSpeed"), 200).catch(error => console.error("Speed set error:", error));
}

// Keyboard Controls
const keyMap = {
    "ArrowUp": 1, "w": 1,       // Forward
    "ArrowDown": -1, "s": -1,   // Reverse
    "ArrowLeft": 2, "a": 2,     // Left
    "ArrowRight": 3, "d": 3,    // Right
    " ": 0                      // Stop
};

// Detect key press
document.addEventListener("keydown", (event) => {
    if (keyMap.hasOwnProperty(event.key)) sendMotorCommand(keyMap[event.key]);
});

// Detect key release (Stop on release)
document.addEventListener("keyup", (event) => {
    if (keyMap.hasOwnProperty(event.key)) sendMotorCommand(0);
});

// ✅ Xbox Controller Support
let controllerConnected = false;

// Xbox Button Mapping (D-Pad + A/X/Y/B)
const xboxButtons = {
    12: 1,  // D-Pad Up → Forward
    13: -1, // D-Pad Down → Reverse
    14: 2,  // D-Pad Left → Left
    15: 3,  // D-Pad Right → Right
    2: 1,   // X Button → Forward
    3: 2,   // Y Button → Left
    1: 3,   // B Button → Right
    0: -1,  // A Button → Reverse
    7: 0    // RT Button → Stop
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
    const gamepad = gamepads[0]; // First connected gamepad

    if (gamepad) {
        gamepad.buttons.forEach((button, index) => {
            if (xboxButtons.hasOwnProperty(index)) {
                let direction = xboxButtons[index];
                let value = button.pressed ? direction : 0;
                sendMotorCommand(value);
            }
        });
    }

    requestAnimationFrame(updateGamepad); // Continuously check input
}

// ✅ Mobile Touch Controls
const touchControls = {
    "forwardBtn": 1,
    "leftBtn": 2,
    "rightBtn": 3,
    "reverseBtn": -1,
    "stopBtn": 0
};

Object.keys(touchControls).forEach(btnId => {
    let button = document.getElementById(btnId);
    let command = touchControls[btnId];

    if (button) {
        button.addEventListener("touchstart", (event) => {
            event.preventDefault(); // Prevent scrolling
            sendMotorCommand(command);
        });

        button.addEventListener("touchend", (event) => {
            event.preventDefault();
            sendMotorCommand(0);
        });
    }
});
