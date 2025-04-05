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

// Function to send motor direction commands
function sendMotorCommand(motor, direction) {
    let motorPath = motor === "Front" ? "FrontMotorDirection" : "RearMotorsDirection";
    
    set(ref(database, motorPath), direction)
    .then(() => {
        document.getElementById("statusText").innerText = `${motor} Direction: ${direction}, Speed: 200`;
        console.log(`Set ${motor} Direction: ${direction}, Speed: 255`);
    })
    .catch(error => {
        console.error("Firebase error:", error);
    });

    // Ensure speed is always 200
    let speedPath = motor === "Front" ? "FrontMotorSpeed" : "RearMotorsSpeed";
    set(ref(database, speedPath), 200).catch(error => console.error("Speed set error:", error));
}

// Keyboard Controls Mapping
const keyMap = {
    "ArrowUp": ["Rear", 1],   // Move rear motor forward
    "w": ["Rear", 1],
    "ArrowDown": ["Rear", -1], // Move rear motor backward
    "s": ["Rear", -1],
    "ArrowLeft": ["Front", -1], // Move front motor left
    "a": ["Front", -1],
    "ArrowRight": ["Front", 1], // Move front motor right
    "d": ["Front", 1],
    " ": ["Front", 0]  // Stop both motors
};

// Detect key press
document.addEventListener("keydown", (event) => {
    if (keyMap.hasOwnProperty(event.key)) {
        let [motor, direction] = keyMap[event.key];
        sendMotorCommand(motor, direction);
    }
});

// Detect key release (Stop motor movement)
document.addEventListener("keyup", (event) => {
    if (keyMap.hasOwnProperty(event.key)) {
        let [motor] = keyMap[event.key];
        sendMotorCommand(motor, 0);
    }
});

// ✅ Xbox Controller Support
let controllerConnected = false;

// Xbox Button Mapping (D-Pad + A/X/Y/B)
const xboxButtons = {
    12: ["Rear", 1],  // D-Pad Up → Rear Forward
    13: ["Rear", -1], // D-Pad Down → Rear Reverse
    14: ["Front", -1], // D-Pad Left → Front Left
    15: ["Front", 1],  // D-Pad Right → Front Right
    2: ["Rear", 1],   // X Button → Rear Forward
    3: ["Front", -1], // Y Button → Front Left
    1: ["Front", 1],  // B Button → Front Right
    0: ["Rear", -1],  // A Button → Rear Reverse
    7: ["Front", 0]   // RT Button → Stop
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
                let [motor, direction] = xboxButtons[index];
                let value = button.pressed ? direction : 0;
                sendMotorCommand(motor, value);
            }
        });
    }

    requestAnimationFrame(updateGamepad); // Continuously check input
}

// ✅ Mobile Touch Controls
const touchControls = {
    "forwardBtn": ["Rear", 1],
    "leftBtn": ["Front", -1],
    "rightBtn": ["Front", 1],
    "reverseBtn": ["Rear", -1],
    "stopBtn": ["Front", 0]
};

Object.keys(touchControls).forEach(btnId => {
    let button = document.getElementById(btnId);
    let command = touchControls[btnId];

    if (button) {
        button.addEventListener("touchstart", (event) => {
            event.preventDefault(); // Prevent scrolling
            sendMotorCommand(command[0], command[1]);
        });

        button.addEventListener("touchend", (event) => {
            event.preventDefault();
            sendMotorCommand(command[0], 0);
        });
    }
});
