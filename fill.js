/**
 * Created by admin on 4/3/17.
 */

function Node(data) {
    this.data = data;
    this.next = undefined;
}

function CellStack(node) {
    this.topNode = node;
    if (node !== undefined) {
        this.number = 1;
    } else {
        this.number = 0;
    }
}

CellStack.prototype.isEmpty = function () {
    return this.number === 0;
};

CellStack.prototype.push = function (cell) {
    var newNode = new Node(cell);
    newNode.next = this.topNode;
    this.topNode = newNode;
    this.number++;
};

CellStack.prototype.top = function () {
    if (this.isEmpty()) {
        throw Error("Stack is empty");
    } else {
        return this.topNode.data;
    }
};

CellStack.prototype.pop = function () {
    if (this.isEmpty()) {
        throw Error("Stack is empty");
    } else {
        this.topNode = this.topNode.next;
        this.number--;
    }
};

CellStack.prototype.size = function () {
    return this.number;
};


// //
// // var neighbors = [[1,0], [0,1], [-1,0], [0, -1]];
// //
// // function findNeighbors(vector, width, height) {
// //     var result = [];
// //     neighbors.forEach(function (element) {
// //         var neighbor = vector.plus(element);
// //         if (neighbor.x >= 0 && neighbor.y >= 0 && neighbor.x < width && neighbor.y < height) {
// //             result.push(neighbor);
// //         }
// //     });
// //     return result;
// // };
//
// // function Cell(vector) {
// //     this.position = vector;
// //     this.colored = false;
// //     this.color = blankColor;
// // }
// //
// // function Grid(width, height, cx) {
// //     this.data = [];
// //     for (var i = 0; i < width; i++) {
// //         var column = [];
// //         for (var j = 0; j < height; j++) {
// //             var newCell = new Cell(new Vector(i, j));
// //             newCell.neighbor = findNeighbors(new Vector(i, j), width, height);
// //             var newCellColor = new Color(cx.getImageData(i,j,1,1).data);
// //             if (!newCellColor.equal(blankColor)) {
// //                 newCell.colored = true;
// //                 newCell.color = newCellColor;
// //                 console.log(newCellColor);
// //             }
// //             column.push(newCell);
// //         }
// //         this.data.push(column);
// //     }
// // }
// //
// // Grid.prototype.getState = function (x, y) {
// //     if (this.data[x][y]) {
// //         return this.data[x][y].colored;
// //     } else {
// //         return undefined;
// //     }
// // };
// //
// // Grid.prototype.changeState = function (x, y, color) {
// //     if (arguments[3]) {
// //         this.data[x][y].colored = true;
// //         this.data[x][y].color = color;
// //     } else {
// //         this.data[x][y].colored = false;
// //         this.data[x][y].color = undefined;
// //     }
// //     return this.data[x][y].colored;
// // };
// //
// // function World(cvWidth, cvHeight, cx) {
// //     this.dataWidth = cvWidth;
// //     this.dataHeight = cvHeight;
// //     this.grid = new Grid(this.dataWidth, this.dataHeight, cx);
// //     this.cellToChange = new CellStack(null);
// // }
// //
// // World.prototype.update = function (cx) {
// //     this.grid.data.forEach(function (column, xIndex) {
// //         column.forEach(function (cell, yIndex) {
// //             var newColor = new Color(cx.getImageData(xIndex, yIndex, 1, 1).data, defaultOpacity);
// //             if (!newColor.equal(cell.color)) {
// //                 cell.color = newColor;
// //             }
// //         }, this);
// //     }, this.grid);
// // };
//
//
// //
// // World.prototype.colorArea = function (color) {
// //     if (color === undefined) {
// //
// //     } else {
// //
// //     }
// //     // this.cellToChange.forEach(function (demand) {
// //     //     if (demand[2]) {
// //     //         cx.fillRect(demand[0], demand[1], 1, 1);
// //     //     } else {
// //     //         cx.clearRect(demand[0], demand[1], 1, 1);
// //     //     }
// //     // });
// // };
// //


// canvas.addEventListener("click", function (event) {
//     var position = position();
//     world.findFillArea();
//     world.redraw();
// });
//
// function clearAll() {
//     world = new World(cvWidth, cvHeight);
//     cx.clearRect(0, 0, cvWidth, cvHeight);
// }
//
// function clearArea() {
//     world.fillArea(false);
// };