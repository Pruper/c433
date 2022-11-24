// WEBSOCKET

let connection = new WebSocket('wss://gameroomtest3player.leg3ndmagician.repl.co', "this-is-probably-a-protocol");

connection.onopen = function () {
    // alert("Connected to server.");
}
connection.onmessage = function (msg) {
    let message = JSON.parse(msg.data);

    if (message.content.type === "messageFromServer") {
        let topmessage = message.content.data;
        let submessage = (typeof message.content.data2 != "undefined") ? message.content.data2 : "";

        renderCanvasMessage(topmessage, submessage);
    }

    if (message.content.type === "setColor") {
        let colorId = message.content.data;
        let playerId = (typeof message.content.data2 != "undefined") ? message.content.data2 : null;

        playerColorId = colorId;
        playerUuid = playerId;
        document.body.style.backgroundColor = getLightColor(colorId);
    }

    if (message.content.type === "changeTurn") {
        let turn = message.content.data;

        if (turn === playerColorId) {
            showButtons();
        } else {
            hideButtons();
        }
    }

    if (message.content.type === "boardUpdate") {
        let newBoard = message.content.data;
        let newBoardOutline = message.content.data2;

        clientBoard = newBoard;
        clientBoardOutline = newBoardOutline;

        console.log("Board update: ");
        console.log(clientBoard);
        renderCanvasBoard();
    }

    if (message.content.type === "gameResult") {
        let winningColor = message.content.data;

        playerUuid = null;

        if (winningColor === playerColorId) {
            showMessageOnButtons("YOU WIN!!!");
        } else if (winningColor != 0) {
            showMessageOnButtons("You lost... better luck next time...");
        } else {
            showMessageOnButtons("The game is a draw...");
        }
    }
}
connection.onclose = function (e) {
    if (playerUuid != null) {
        renderCanvasMessage("Disconnected from server.", "You were disconnected!");
    }
    console.log("Connection has been closed!");
}
connection.onerror = function () {
    console.log("An error occured in your connection!");
}

function message(content) {
    let message = {
        uuid: playerUuid,
        content: content
    }

    return JSON.stringify(message);
}

// CANVAS

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function renderCanvasConnecting() {
    ctx.fillStyle = "#C7C7C7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderCanvasMessage('Connecting to server...', 'If this text does not go away, you are unable to connect.');
}

function renderCanvasMessage(message, submessage = "") {
    ctx.fillStyle = "#C7C7C7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = '48px serif';
    ctx.fillText(message, 10, 50);
    ctx.font = '24px serif';
    ctx.fillText(submessage, 10, 80);
}

function renderCanvasBoard() {
    ctx.fillStyle = "#0000C7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (i = 0; i < 42; i++) {
        let x = i % 7;
        let y = Math.floor(i / 7);

        ctx.beginPath();
        ctx.arc(81 + 135 * x, 54 + 108 * y, 45, 0, 2 * Math.PI, false);
        ctx.fillStyle = getPieceColor(clientBoard[i]);
        ctx.fill();
        ctx.lineWidth = (clientBoardOutline.indexOf(i) != -1) ? 10 : 5;
        ctx.strokeStyle = (clientBoardOutline.indexOf(i) != -1) ? "#A0A0FF" : "#000000";
        ctx.stroke();

        /*ctx.fillStyle = "#000000"
        ctx.font = '50px serif';
        ctx.fillText(i, 66 + 135 * x, 66.5 + 108 * y);*/
    }
}

function getPieceColor(id) {
    switch (id) {
        case 0:
            return "#FFFFFF";
        case 1:
            return "#FF0000";
        case 2:
            return "#FFFF00";
        case 3:
            return "#00FF00";
        default:
            return "#555555";
    }
}

function getLightColor(id) {

    switch (id) {
        case 0:
            return "#FFFFFF";
        case 1:
            return "#FFC7C7";
        case 2:
            return "#FFFFC7";
        case 3:
            return "#C7FFC7";
        default:
            return "#C7C7C7";
    }
}

function showButtons() {
    document.getElementById("buttons").innerHTML = `<button class="drop-button" onclick="drop(0)">DROP</button><button class="drop-button" onclick="drop(1)">DROP</button><button class="drop-button" onclick="drop(2)">DROP</button><button class="drop-button" onclick="drop(3)">DROP</button><button class="drop-button" onclick="drop(4)">DROP</button><button class="drop-button" onclick="drop(5)">DROP</button><button class="drop-button" onclick="drop(6)">DROP</button>`;
}

function hideButtons() {
    document.getElementById("buttons").innerHTML = `<p class="top-text">Opponent's turn...</p>`;
}

function showMessageOnButtons(text) {
    document.getElementById("buttons").innerHTML = `<p class="top-text">${text}</p>`;
}

// GAME

let clientBoard = [];
let clientBoardOutline = [];

let playerUuid = null;
let playerColorId = null;

function drop(column) {
    connection.send(message({ type: "drop", data: column, color: playerColorId }));
}

renderCanvasConnecting();