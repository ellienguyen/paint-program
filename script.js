function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
function hexToRgb(h, opacity) {
    return new Color([hexToR(h), hexToG(h), hexToB(h), opacity]);
}

function Color(colorData) {
    this.r = colorData[0];
    this.g = colorData[1];
    this.b = colorData[2];
    this.a = colorData[3] / 255;
}

Color.prototype.toString = function () {
    return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
};

Color.prototype.equal = function (otherColor) {
    return approxEqual(this.r, otherColor.r) && approxEqual(this.g, otherColor.g) && approxEqual(this.b, otherColor.b)
        && Math.abs(this.a - otherColor.a) < 0.6;
};

function approxEqual(first, second) {
    return Math.abs(first - second) < 40;
};

var canvas = document.querySelector("canvas");
var cx = canvas.getContext("2d");
var cvWidth;
var cvHeight;

//resize the canvas properly
window.addEventListener("load", function () {
    var canvasWrapper = document.getElementsByClassName("canvas-wrapper");
    var canvas = document.getElementsByTagName("canvas");
    canvas[0].setAttribute("width", String(canvasWrapper[0].clientWidth));
    canvas[0].setAttribute("height", String(canvasWrapper[0].clientHeight));
    cvWidth = canvasWrapper[0].clientWidth;
    cvHeight = canvasWrapper[0].clientHeight;
});

var tools = Object.create(null);
var brushPicker = document.getElementById("brush-size");
var opacityPicker = document.querySelector("#opacity");
var colorPicker = document.getElementById("color-picker");

//Initial canvas setting
cx.lineWidth = brushPicker.value;
var defaultOpacity = opacityPicker.value;
var defaultColor = hexToRgb(colorPicker.value, defaultOpacity * 255).toString();
cx.fillStyle = defaultColor;
cx.strokeStyle = defaultColor;

var select = document.getElementById("tool-select");
cx.canvas.addEventListener("mousedown", function (event) {
    if (event.which == 1) {
        select = document.getElementById("tool-select");
        tools[select.value](event,cx);
        event.preventDefault();
    }
});

function position(event, element) {
    var rect = element.getBoundingClientRect();
    return {
        x: Math.floor(event.clientX - rect.left),
        y: Math.floor(event.clientY - rect.top)
    }
}

tools.line = function (event, cx, onEnd) {
    cx.lineWidth = brushPicker.value;
    cx.lineCap = "round";
    var pos = position(event, cx.canvas);
    trackDrag(function (event) {
        cx.beginPath();
        cx.moveTo(pos.x, pos.y);
        pos = position(event, cx.canvas);
        cx.lineTo(pos.x, pos.y);
        cx.stroke();
    },onEnd);
};

tools.erase = function (event, cx) {
    cx.globalCompositeOperation = "destination-out";
    tools.line(event, cx, function () {
        cx.globalCompositeOperation = "source-over";
    });
};

colorPicker.addEventListener("change", function () {
    cx.strokeStyle = hexToRgb(colorPicker.value, defaultOpacity * 255).toString();
    cx.fillStyle = hexToRgb(colorPicker.value, defaultOpacity * 255).toString();
});

brushPicker.addEventListener("change", function () {
    cx.lineWidth = brushPicker.value;
});

opacityPicker.addEventListener("change", function () {
    defaultOpacity = opacityPicker.value;
    cx.strokeStyle = hexToRgb(colorPicker.value, defaultOpacity * 255).toString();
    cx.fillStyle = hexToRgb(colorPicker.value, defaultOpacity * 255).toString();
});

var saveBtn = document.getElementById("save");
function update() {
    try {
        saveBtn.href = cx.canvas.toDataURL();
    } catch (e) {
        throw e;
    }
}
saveBtn.addEventListener("mouseover", update);
saveBtn.addEventListener("focus", update);

var fileInput = document.querySelector("#file-input");
fileInput.addEventListener("change", function () {
    if (fileInput.files.length == 0) return;
    var reader = new FileReader();
    reader.addEventListener("load", function () {
        loadImageURL(cx, reader.result);
    });
    reader.readAsDataURL(fileInput.files[0]);
});

var loadBtn = document.querySelector("#load");
var urlInput = document.querySelector("#url-input");
loadBtn.addEventListener("submit", function (event) {
    event.preventDefault();
    loadImageURL(cx, urlInput.value);
});


function loadImageURL(cx, url) {
    var image = document.createElement("img");
    image.addEventListener("load", function () {
        var color = cx.fillStyle, size = cx.lineWidth;
        var ratio = Math.round(image.width / image.height);
        cvHeight = cx.canvas.height = Math.round(cvWidth / ratio);
        cx.drawImage(image, 0, 0, cvWidth, cvHeight);
        cx.fillStyle = color;
        cx.strokeStyle = color;
        cx.lineWidth = size;
    });
    image.src = url;
}

tools.text = function(event, cx) {
    var text = prompt("Text:", "");
    if (text) {
        var pos = position(event, cx.canvas);
        cx.font = Math.max(7, cx.lineWidth) + "px sans-serif";
        cx.fillText(text, pos.x, pos.y);
    }
};

tools.spray = function (event, cx) {
    var radius = cx.lineWidth / 2;
    var area = radius * radius * Math.PI;
    var dotsPerTick = Math.ceil(area / 30);
    var currentPos = position(event, cx.canvas);
    var spray = setInterval(function () {
        for (var i = 0; i < dotsPerTick; i++) {
            var offset = randomPointInRadius(radius);
            cx.fillRect(currentPos.x + offset.x, currentPos.y + offset.y, 1, 1);
        }
    },25);
    trackDrag(function (event) {
        currentPos = position(event, cx.canvas);
    }, function () {
        clearInterval(spray);
    });
};

tools.rectangle = function (event, cx) {
    var currentPos = position(event, cx.canvas);
    var rectangle = document.querySelector("#temp-rectangle");
    rectangle.style.backgroundColor = cx.fillStyle;
    trackDrag(function (event) {
        // var finalPos = {x: event.clientX, y: event.clientY};
        var finalPos = position(event, cx.canvas);
        rectangle.style.display = "block";
        var coorRec = findCoorRec(currentPos, finalPos);
        rectangle.style.left = coorRec.x + 2 + "px";
        rectangle.style.top = coorRec.y + 2 + "px";
        rectangle.style.width = coorRec.width + "px";
        rectangle.style.height = coorRec.height+ "px";
    }, function (event) {
        var finalPos = position(event, cx.canvas);
        var coorRec = findCoorRec(currentPos, finalPos);
        cx.fillRect(coorRec.x, coorRec.y, coorRec.width, coorRec.height);
        rectangle.style.display = "none";
    });
};

tools.colorPicker = function (event, cx) {
    var currentPos = position(event, cx.canvas);
    var colorData = pixelAt(cx, currentPos.x, currentPos.y);
    var color = "rgb(" + colorData[0] + "," + colorData[1] + "," + colorData[2] + ")";
    cx.fillStyle = color;
    cx.strokeStyle = color;
};

var blankColor = new Color([0,0,0,0]);

function Vector (x , y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.plus = function (position) {
    return new Vector(this.x + position.x, this.y + position.y);
};

tools.fill = function (event, cx) {
    findFillArea(event, cx, false);
};

tools.clear = function (event, cx) {
    findFillArea(event, cx, true);
};

// var neighbor = [new Vector(0, -1), new Vector(0, 1), new Vector(-1, 0), new Vector(1, 0)];

function findFillArea (event, cx, clear) {
    var currentPos = new Vector(position(event, cx.canvas).x, position(event, cx.canvas).y);
    var targetColor = colorFromPixel(cx, currentPos);
    var replaceColor;
    if (clear) {
        replaceColor = blankColor;
    } else {
        var rgb = hexToRgb(document.getElementById("color-picker").value);
        var opacity = Number(defaultOpacity) * 255;
        replaceColor = new Color([rgb.r, rgb.g, rgb.b, opacity]);
    }
    floodFill(currentPos, targetColor, replaceColor, cx);
}

function floodFill(vector, targetColor, replaceColor, cx) {
    if (targetColor.equal(replaceColor)) {
        return;
    }
    if (colorFromPixel(cx, vector).equal(replaceColor)|| !colorFromPixel(cx, vector).equal(targetColor)) {
        return;
    }
    cx.fillStyle = replaceColor;
    var xIndex = vector.x;
    var yIndex = vector.y;
    var west = xIndex;
    var east = xIndex + 1;
    while (west >= 0 && colorFromPixel(cx, new Vector(west, yIndex)).equal(targetColor)) {
        cx.clearRect(west, yIndex, 1, 1);
        cx.fillRect(west, yIndex, 1, 1);
        west--;
    }
    while (east < cx.canvas.width && colorFromPixel(cx, new Vector(east, yIndex)).equal(targetColor)) {
        cx.clearRect(east, yIndex, 1, 1);
        cx.fillRect(east, yIndex, 1, 1);
        east++;
    }
    west = xIndex;
    east = xIndex + 1;
    console.log(targetColor);
    console.log(replaceColor);
    console.log(colorFromPixel(cx, new Vector(west, yIndex - 1)));
    console.log(colorFromPixel(cx, new Vector(west, yIndex)));
    console.log(colorFromPixel(cx, new Vector(west, yIndex + 1)));

    while (west >= 0 && colorFromPixel(cx, new Vector(west, yIndex)).equal(replaceColor)) {
        if (yIndex > 0 && colorFromPixel(cx, new Vector(west, yIndex - 1)).equal(targetColor)) {
            floodFill(new Vector(west, yIndex - 1), targetColor, replaceColor, cx);
        }
        west--;
    }
    while (east < cx.canvas.width && colorFromPixel(cx, new Vector(west, yIndex)).equal(replaceColor)) {
        if (yIndex > 0 && colorFromPixel(cx, new Vector(east, yIndex - 1)).equal(targetColor)) {
            floodFill(new Vector(east, yIndex - 1), targetColor, replaceColor, cx);
        }
        east++;
    }
    west = xIndex;
    east = xIndex + 1;
    while (west >= 0 && colorFromPixel(cx, new Vector(west, yIndex)).equal(replaceColor)) {
        if (!colorFromPixel(cx, new Vector(west, yIndex + 1)).equal(targetColor)) {
            if (!colorFromPixel(cx, new Vector(west, yIndex + 1)).equal(replaceColor)) {
                console.log(targetColor.toString());
                console.log(colorFromPixel(cx, new Vector(west, yIndex + 1)).toString());
            }
        }
        if (yIndex < cx.canvas.height - 1 && colorFromPixel(cx, new Vector(west, yIndex + 1)).equal(targetColor)) {
            floodFill(new Vector(west, yIndex + 1), targetColor, replaceColor, cx);
        }
        west--;
    }
    while (east < cx.canvas.width && colorFromPixel(cx, new Vector(west, yIndex)).equal(replaceColor)) {
        if (yIndex < cx.canvas.height - 1 && colorFromPixel(cx, new Vector(east, yIndex + 1)).equal(targetColor)) {
            floodFill(new Vector(east, yIndex + 1), targetColor, replaceColor, cx);
        }
        east++;
    }
}

function colorFromPixel(cx, currentPos) {
    if (currentPos.x < cx.canvas.width && currentPos.y < cx.canvas.height) {
        return new Color(cx.getImageData(currentPos.x, currentPos.y, 1, 1).data);
    }
    return undefined;

}

function pixelAt(cx, x, y) {
    var data = cx.getImageData(x, y, 1, 1);
    return data.data;
}

function findCoorRec(currentPos, finalPos) {
    return {
        x: Math.min(finalPos.x, currentPos.x),
        y: Math.min(finalPos.y, currentPos.y),
        width: Math.abs(finalPos.x - currentPos.x),
        height: Math.abs(finalPos.y - currentPos.y)
    }
}

function randomPointInRadius(radius) {
    for (;;) {
        var x = Math.random() * 2 - 1;
        var y = Math.random() * 2 - 1;
        if (x * x + y * y <= 1)
            return {x: x * radius, y: y * radius};
    }
}

function trackDrag(onMove, onEnd) {
    function end() {
        removeEventListener("mousemove", onMove);
        removeEventListener("mouseup", end);
        if (onEnd) onEnd(event);
    }
    addEventListener("mousemove", onMove);
    addEventListener("mouseup", end);
}

