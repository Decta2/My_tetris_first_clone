    var res_y = window.screen.availHeight;
    var res_x = window.screen.availWidth;

    var coefficient;
    if (res_x * 460 > res_y * 360) coefficient = res_y / 460;
    else coefficient = res_x / 360;

    document.getElementById("div").style.transform =
    "scale(" + coefficient + ")";

    const maincanvas = document.getElementById("maincanvas");
    const con = maincanvas.getContext("2d");

    const subcanvas = document.getElementById("subcanvas");
    const ctx = subcanvas.getContext("2d");

    var left = document.getElementById("left");
    var right = document.getElementById("right");
    var down = document.getElementById("down");
    var rotate = document.getElementById("rotate");
    var rotatealt = document.getElementById("rotatealt");
    var dropinterval = 0;
    var nextpiece = "T";
    var threshold = 1000;

    const colors = [
    null,
    " #ff0000",
    " #ffa600",
    " #eeff00",
    " #5eff00",
    " #00ffea",
    " #0051ff",
    " #ff00d4",
    ];

    con.scale(20, 20);
    ctx.scale(20, 20);

    const player = {
    pos: { x: 0, y: 0 },
    matrix: createpiece(null),
    score: 0,
    };

    function creatematrix(dim) {
    const matrix = [];
    for (var i = 0; i < dim[0]; ++i) {
        matrix.push(dim.length == 1 ? 0 : creatematrix(dim.slice(1)));
    }
    return matrix;
    }

    var field = creatematrix([20, 12]);
    function join(main, sub) {
    for (var y = 0; y < sub.matrix.length; ++y) {
        for (var x = 0; x < sub.matrix[y].length; ++x) {
        if (sub.matrix[x][y] !== 0) {
            main[x + sub.pos.y][y + sub.pos.x] = sub.matrix[x][y];
        }
        }
    }
    }

    function createpiece(piece) {
    switch (piece) {
        case "L":
        return [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1],
        ];
        break;
        case "O":
        return [
            [2, 2],
            [2, 2],
        ];
        break;
        case "I":
        return [
            [0, 3, 0, 0],
            [0, 3, 0, 0],
            [0, 3, 0, 0],
            [0, 3, 0, 0],
        ];
        break;
        case "T":
        return [
            [0, 0, 0],
            [4, 4, 4],
            [0, 4, 0],
        ];
        break;
        case "S":
        return [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0],
        ];
        case "Z":
        return [
            [6, 6, 0],
            [0, 6, 6],
            [0, 0, 0],
        ];
        case "J":
        return [
            [0, 7, 0],
            [0, 7, 0],
            [7, 7, 0],
        ];
        break;
    }
    }

    function changeplayer() {
    var pieces = ["L", "O", "I", "T", "S", "Z", "J"];
    player.matrix = createpiece(nextpiece);
    nextpiece = pieces[(Math.random() * pieces.length) | 0];
    player.pos.y = 0;
    player.pos.x =
        ((field[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
    if (checkcollision(field, player)) {
        alert("GAME OVER!\nScore: " + player.score);
        field = creatematrix([20, 12]);
        player.score = 0;
        scorerefresh();
    }
    }

    function drawpieces(matrix, startpos) {
    for (var y = 0; y < matrix.length; ++y) {
        for (var x = 0; x < matrix[y].length; ++x) {
        if (matrix[y][x] !== 0) {
            con.fillStyle = colors[matrix[y][x]];
            con.fillRect(x + startpos.x, y + startpos.y, 1, 1);
            con.lineWidth = 0.1;
            con.strokeStyle = "black";
            con.strokeRect(x + startpos.x, y + startpos.y, 1, 1);
        }
        }
    }
    }

    function drawnext() {
    matrix = createpiece(nextpiece);
    for (var y = 0; y < matrix.length; ++y) {
        for (var x = 0; x < matrix[y].length; ++x) {
        if (matrix[y][x] !== 0) {
            ctx.fillStyle = colors[matrix[y][x]];
            ctx.fillRect(x + 1, y + 1, 1, 1);
            ctx.lineWidth = 0.1;
            ctx.strokeStyle = "black";
            ctx.strokeRect(x + 1, y + 1, 1, 1);
        }
        }
    }
    }

    function draw() {
    con.fillStyle = " #BBB3BA";
    con.fillRect(0, 0, maincanvas.width, maincanvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, subcanvas.width, subcanvas.height);
    drawpieces(field, { x: 0, y: 0 });
    drawpieces(player.matrix, player.pos);
    drawnext();
    }

    function checkcollision(main, sub) {
    const matrix = sub.matrix,
        offset = sub.pos;
    for (var y = 0; y < matrix.length; ++y) {
        for (var x = 0; x < matrix[y].length; ++x) {
        if (
            matrix[y][x] !== 0 &&
            (main[y + offset.y] && main[y + offset.y][x + offset.x]) !== 0
        )
            return true;
        }
    }
    return false;
    }

    function clear() {
    var rowscleared = 0;
    first: for (var y = field.length - 1; y > 0; --y) {
        for (var x = 0; x < field[y].length; ++x) {
        if (field[y][x] === 0) continue first;
        }
        const removed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        field.splice(y, 1)[0];
        field.unshift(removed);
        ++rowscleared;
        ++y;
        player.score += 10 * rowscleared;
    }
    }

    function movepiece(dir) {
    player.pos.x += dir;
    if (checkcollision(field, player)) player.pos.x -= dir;
    }

    function droppiece() {
    player.pos.y++;
    if (checkcollision(field, player)) {
        player.pos.y--;
        join(field, player);
        changeplayer();
        clear();
        scorerefresh();
    }
    dropinterval = 0;
    }

    function rotatematrix(matrix, clockwise) {
    for (var y = 0; y < matrix.length; ++y) {
        for (var x = 0; x < y; ++x) {
        var temp = matrix[y][x];
        matrix[y][x] = matrix[x][y];
        matrix[x][y] = temp;
        }
    }
    if (clockwise) {
        for (var y = 0; y < matrix.length; ++y) {
        for (var x = 0; x < Math.round(matrix[y].length / 2); ++x) {
            var temp = matrix[y][x];
            matrix[y][x] = matrix[y][matrix[y].length - 1 - x];
            matrix[y][matrix[y].length - 1 - x] = temp;
        }
        }
    } else {
        for (var y = 0; y < Math.round(matrix.length / 2); ++y) {
        for (var x = 0; x < matrix[y].length; ++x) {
            var temp = matrix[y][x];
            matrix[y][x] = matrix[matrix.length - 1 - y][x];
            matrix[matrix.length - 1 - y][x] = temp;
        }
        }
    }
    }

    function rotatepiece(clockwise) {
    var pos = player.pos.x,
        offset = 1;
    rotatematrix(player.matrix, clockwise);
    while (checkcollision(field, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
        rotatematrix(player.matrix, !clockwise);
        player.pos.x = pos;
        return;
        }
    }
    }

    var time_0 = 0,
    timechange;
    function update(timestamp) {
    timechange = timestamp - time_0;
    dropinterval += timechange;
    if (dropinterval >= threshold) {
        droppiece();
    }
    draw();
    time_0 = timestamp;
    window.requestAnimationFrame(update);
    }

    function scorerefresh() {
    document.getElementById("score").innerText = player.score;
    document.getElementById("level").innerText =
        Math.floor(player.score / 100) + 1;
    }

    left.addEventListener("click", onPressleft, false);
    right.addEventListener("click", onPressright, false);
    // down.addEventListener("touchstart", onPressdown, false);
    // down.addEventListener("touchend", onUnpress, false);
    // down.addEventListener("touchcancel", onUnpress, false);
    rotate.addEventListener("click", onClockwise, false);
    rotatealt.addEventListener("click", onAnticlockwise, false);

    // document.addEventListener('keydown', function(){
    //     if(left == '37'){
    //         onPressleft, true
    //     }
    //     else if(right == '39'){
    //         onPressright, true
    //     }
    //     else if(rotate == '38'){
    //         onClockwise, true
    //     }
    // })

    function onPressleft() {
    movepiece(-1);
    }
    function onPressright() {
    movepiece(1);
    }
    // function onPressdown() {
    //   threshold /= -10000;
    // }
    // function onUnpress() {
    //   threshold = 1000;
    // }
    function onClockwise() {
    rotatepiece(1);
    }
    function onAnticlockwise() {
    rotatepiece(0);
    }
    changeplayer();
    update(time_0);