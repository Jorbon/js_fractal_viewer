var canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");

var mouse = {
	x: canvas.width / 2,
	y: canvas.height / 2
};

window.addEventListener("mousemove", 
	function(event) {
		mouse.x = event.x;
        mouse.y = event.y;
        scrn.relativeMouse = scrn.canvasToLocal(mouse);
	}
);

window.addEventListener("keydown", 
	function(event) {
        keys[event.which || event.keyCode] = true;
        switch (event.keyCode || event.which) {
            case 32:
                scrn.x = scrn.relativeMouse.x;
                scrn.y = scrn.relativeMouse.y;
                reload();
                break;
            case 38:
                scrn.z /= 2;
                reload();
                break;
            case 40:
                scrn.z *= 2;
                reload();
                break;
            case 49:
                colors = [ // color setup 1 (default)
                    {pos: 0, r: 0, g: 7, b: 100},
                    {pos: 0.16, r: 32, g: 107, b: 203},
                    {pos: 0.42, r: 237, g: 255, b: 255},
                    {pos: 0.6425, r: 255, g: 170, b: 0},
                    {pos: 0.8575, r: 0, g: 2, b: 0},
                    {pos: 1, r: 0, g: 7, b: 100}
                ];
                colorCycle = 100;
                reload();
                break;
            case 50: // color setup 2
                colors = [
                    {pos: 0, r: 141, g: 0, b: 160},
                    {pos: 0.2, r: 253, g: 253, b: 34},
                    {pos: 0.4, r: 124, g: 0, b: 255},
                    {pos: 0.6, r: 185, g: 124, b: 247},
                    {pos: 0.8, r: 217, g: 218, b: 224},
                    {pos: 1, r: 141, g: 0, b: 160}
                ];
                colorCycle = 40;
                reload();
                break;
            case 80: // p frame
                scrn.x = -0.746206385501355;
                scrn.y = -0.09868902439024389;
                scrn.z = 0.00390625;
                reload();
                break;
            case 79: // o frame
                // new frame goes here
                break;
            case 77:
                if (julia) {
                    julia = false;
                    scrn.x = juliaC.r;
                    scrn.y = juliaC.i;
                    scrn.z = mandelbrotZ;
                    reload();
                }
                break;
            case 74:
                if (julia === false) {
                    julia = true;
                    juliaC = {r: scrn.relativeMouse.x, i: scrn.relativeMouse.y};
                    mandelbrotZ = scrn.z;
                    scrn.x = 0;
                    scrn.y = 0;
                    scrn.z = 2;
                    reload();
                }

        }
	}
);
window.addEventListener("keyup",
	function(event) {
		keys[event.which || event.keyCode] = false;
	}
);

var keys = [];

/*
window.addEventListener("resize", 
	function() {
		canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
	}
);
*/

function cubicLerp (min, max, t) {
    t = -2 * t * t * t + 3 * t * t;
    return min + t * (max - min);
};

function antiLerp (min, max, t) {
    return (t - min) / (max - min);
};

function sum (c1, c2) {
    return {
        r: c1.r + c2.r,
        i: c1.i + c2.i
    };
};

function product (c1, c2) {
    return {
        r: c1.r * c2.r - c1.i * c2.i,
        i: c1.r * c2.i + c1.i * c2.r
    };
};

function abs2 (c) {
    return c.r * c.r + c.i * c.i;
};

var colors = [
    {pos: 0, r: 0, g: 7, b: 100},
    {pos: 0.16, r: 32, g: 107, b: 203},
    {pos: 0.42, r: 237, g: 255, b: 255},
    {pos: 0.6425, r: 255, g: 170, b: 0},
    {pos: 0.8575, r: 0, g: 2, b: 0},
    {pos: 1, r: 0, g: 7, b: 100}
];
var colorCycle = 100;

function colorMap (t) {
    t = t / colorCycle % 1;
    var c = {r: 0, g: 0, b: 0};
    for (var a = 0; a < colors.length - 1; a++) {
        if (t >= colors[a].pos && t < colors[a + 1].pos) {
            c = {
                r: cubicLerp(colors[a].r, colors[a + 1].r, antiLerp(colors[a].pos, colors[a + 1].pos, t)),
                g: cubicLerp(colors[a].g, colors[a + 1].g, antiLerp(colors[a].pos, colors[a + 1].pos, t)),
                b: cubicLerp(colors[a].b, colors[a + 1].b, antiLerp(colors[a].pos, colors[a + 1].pos, t))
            };
        }
    }
    return "rgb(" + c.r + ", " + c.g + ", " + c.b + ")";
};

var scrn = {
    x: 0,
    y: 0,
    z: 2, // min about 4e-14
    relativeMouse: {
        x: 0,
        y: 0
    },
    step: 0,
    localToCanvas: function (ob) {
        return {
            x: (ob.x - scrn.x) * canvas.height / 2 / scrn.z + canvas.width / 2,
            y: (ob.y - scrn.y) * canvas.height / 2 / scrn.z + canvas.height / 2
        };
    },
    canvasToLocal: function (ob) {
        return {
            x: (ob.x * 2 - canvas.width) * scrn.z / Math.min(canvas.width, canvas.height) + scrn.x,
            y: (ob.y * 2 - canvas.height) * scrn.z / Math.min(canvas.width, canvas.height) + scrn.y
        };
    }
};


var juliaC = {r: 0, i: 0};
var mandelbrotZ = 2;
var julia = false;
var detail = 1;
var map = [];
var fillPoint = function (a, b) {
    ctx.fillStyle = colorMap(map[a][b].step);
    ctx.fillRect(a, b, detail, detail);
};
var reload = function () {
    resetMap();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
var iterate = function (c, z) {
    return sum(product(z, z), c);
};
var step = function () {
    if (julia) {
        for (var a = 0; a < canvas.width; a += detail) {
            for (var b = 0; b < canvas.height; b += detail) {
                if (map[a][b].done === false) {
                    map[a][b].z = iterate(juliaC, map[a][b].z);
                    map[a][b].step++;
                    if (abs2(map[a][b].z) > 4) {
                        map[a][b].done = true;
                        fillPoint(a, b);
                    }
                }
            }
        }
    } else {
        for (var a = 0; a < canvas.width; a += detail) {
            for (var b = 0; b < canvas.height; b += detail) {
                if (map[a][b].done === false) {
                    var point = scrn.canvasToLocal({x: a, y: b});
                    map[a][b].z = iterate({r: point.x, i: point.y}, map[a][b].z);
                    map[a][b].step++;
                    if (abs2(map[a][b].z) > 4) {
                        map[a][b].done = true;
                        fillPoint(a, b);
                    }
                }
            }
        }
    }
};
var resetMap = function () {
    if (julia) {
        for (var a = 0; a < canvas.width; a++) {
            map[a] = [];
            for (var b = 0; b < canvas.height; b++) {
                var point = scrn.canvasToLocal({x: a, y: b});
                map[a][b] = {
                    z: {r: point.x, i: point.y},
                    step: 0,
                    done: false
                };
            }
        }
    } else {
        for (var a = 0; a < canvas.width; a ++) {
            map[a] = [];
            for (var b = 0; b < canvas.height; b++) {
                this.map[a][b] = {
                    z: {r: 0, i: 0},
                    step: 0,
                    done: false
                };
            }
        }
    }
};
resetMap();


ctx.fillStyle = "#000000";
ctx.fillRect(0, 0, canvas.width, canvas.height);

function draw () {
    requestAnimationFrame(draw);
    let start = performance.now();
    while (performance.now() - start < 1000/30) {
        step();
    }
};
draw();


