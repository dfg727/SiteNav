class Point {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.index = x * 9 + y;
        this.block = parseInt(x/3) * 3 * 9 + parseInt(y/3) * 3;
        this.value = value;
        this.isPuzzle = this.value != 0;

        this.init();
    }

    toString() {
        return '(coord:R' + (this.x + 1) + 'C' + (this.y + 1) + ', x:' + this.x + ', y:' + this.y + ', index:' + this.index + ', block:' + this.block + ')';
    }
}
Point.prototype.init = function() {
    this.available = [];
    this.text = this.value == 0 ? "" : this.value;
    this.isMark = false;
    this.markList = ["","","","","","","","",""];
    this.selected = false;
    this.selectedSame = false;
    this.isError = false;
    this.isSelectedRelate = false;

    this.markRelateList = [false,false,false,false,false,false,false,false,false];
    this.markLockList = [false,false,false,false,false,false,false,false,false];
    this.markRemoveList = [false,false,false,false,false,false,false,false,false];
    return true;
}

function initPoint(sudoku) {
    var pointList = [];
    for (var i = 0; i < sudoku.length; i++) {
        p = new Point(parseInt(i/9), i%9, sudoku[i]);
        if (sudoku[i] == 0) {
            var rows = rowNum(p, sudoku);
            var cols = colNum(p, sudoku);
            var blocks = blockNum(p, sudoku);
            for (var j = 1; j < 10; j++) {
                if (!_.contains(rows, j) && !_.contains(cols, j) && !_.contains(blocks, j)) {
                    p.available.push(j);
                }
            }
        }
        pointList.push(p);
    }
    return pointList;
}

function resetAvailable(pointList, sudoku) {
    var isComplete = true;
    for (var i = 0; i < sudoku.length; i++) {
        var p = pointList[i];
        p.available = [];
        if (sudoku[i] == 0) {
            var rows = rowNum(p, sudoku);
            var cols = colNum(p, sudoku);
            var blocks = blockNum(p, sudoku);
            for (var j = 1; j < 10; j++) {
                if (!_.contains(rows, j) && !_.contains(cols, j) && !_.contains(blocks, j)) {
                    p.available.push(j);
                    isComplete = false;
                }
            }
        }
    }
    if (isComplete) {
        return null;
    }
	
    return pointList;
}

function resetAvailableMark(point, pointList) {	
	var num = point.value;
	_.each(pointList, function(p) {
		if (p.index != point.index && p.value == 0) {
			if (point.x == p.x || point.block == p.block || point.y == p.y) {
				if (_.contains(p.markList, num)) {
					p.markList[num-1] = "";
					p.markRelateList[num-1] = false;
					p.markLockList[num-1] = false;
					p.markRemoveList[num-1] = false;
				}
			}
		}
	});
	return pointList;
}

function rowNum(p, sudoku) {
    row = sudoku.slice(p.x * 9, (p.x + 1) * 9);
    return _.filter(row, function(n){return n != 0;});
}

function colNum(p, sudoku) {
    var col = [];
    for (var i = p.y; i < sudoku.length; i = i + 9) {
        col.push(sudoku[i]);
    }
    return _.filter(col, function(n){return n != 0;});
}

function blockNum(p, sudoku) {
    var block_x = parseInt(p.x / 3);
    var block_y = parseInt(p.y / 3);
    var block = [];
    var start = block_x * 3 * 9 + block_y * 3;
    for (var i = start; i < start + 3; i++) {
        block.push(sudoku[i]);
    }
    for (var i = start + 9; i < start + 9 + 3; i++) {
        block.push(sudoku[i]);
    }
    for (var i = start + 9 * 2; i < start + 9 * 2 + 3; i++) {
        block.push(sudoku[i]);
    }
    return _.filter(block, function(n){return n != 0;});
}

function check(p, sudoku) {
    if (p.value == 0) {
        console.log("not assign value to point!");
    }
    if (!_.contains(rowNum(p, sudoku), p.value) && !_.contains(colNum(p, sudoku), p.value) && !_.contains(blockNum(p, sudoku), p.value)) {
        return true;
    }
    return false;
}

function tryInsert(p, pointList, sudoku) {
    //console.log(p.toString())
    var availNum = p.available;
    for (var i = 0; i < availNum.length; i++) {
        p.value = availNum[i];
        if (check(p, sudoku)) {
            sudoku[p.x * 9 + p.y] = p.value;
            if (pointList.length <= 0) {
                console.log("completed");
                return [true, sudoku];
            } else {
                var p2 = pointList.pop();
                var tryResult = tryInsert(p2, pointList, sudoku);
                if (tryResult[0]) {
                    return tryResult;
                }
                sudoku[p2.x * 9 + p2.y] = 0;
                sudoku[p.x * 9 + p.y] = 0;
                p2.value = 0;
                pointList.push(p2);
            }
        }
    };
    return (false, []);
}

function hidden_single(pointList) {
    var hasPrompt = false;
    _.each(pointList, function(point) {
        if (point.available.length > 0 && !hasPrompt) {
            var availableCol = [];
            var availableRow = [];
            var availableBlock = [];
            _.each(pointList, function(p) {
                if (point.available.length > 0) {
                    if (p.index != point.index) {
                        if (p.x == point.x) {
                            availableRow = _.union(availableRow, p.available);
                        }
                        if (p.y == point.y) {
                            availableCol = _.union(availableCol, p.available);
                        }
                        if (p.block == point.block) {
                            availableBlock = _.union(availableBlock, p.available);
                        }
                    }
                }
            });
            var singleNum = 0;
            _.each(point.available, function(num) {
                if (!_.contains(availableRow, num) || !_.contains(availableCol, num) || !_.contains(availableBlock, num)) {
                    singleNum = num;
                }
            });
            if (singleNum != 0) {
                hasPrompt = true;
                _.each(point.available, function(num) {
                    if (num == singleNum) {
                        point.markLockList[num-1] = true;
                    } else {
                        point.markRemoveList[num-1] = true;
                    }
                });
            }
        }
    });
    return hasPrompt;
}


function locked_candidate(pointList) {
    var hasPrompt = false;
    var cols = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var rows = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length > 0) {
            rows[point.x].push(point);
            cols[point.y].push(point);
            blocks[point.block].push(point);
        }
    });

    var cols_available = [];
    var rows_available = [];
    for (var i = 0; i < 9; i++) {
        var listX = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(rows[i], function(point) {
            _.each(point.available, function(num) {
                listX[num].push(point);
            });
        });
        rows_available.push(listX);

        var listY = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(cols[i], function(point) {
            _.each(point.available, function(num) {
                listY[num].push(point);
            });
        });
        cols_available.push(listY);
    }

    var blocks_available = [];
    _.each(_.keys(blocks), function(key) {
        var listB = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(blocks[key], function(point) {
            _.each(point.available, function(num) {
                listB[num].push(point);
            })
        });
        blocks_available.push(listB);
    });

    for (var i = 0; i < 9; i++) {
        if (hasPrompt) {
            break;
        }
        for (var j = 1; j < 10; j++) {
            if (hasPrompt) {
                break;
            }
            var listNum = rows_available[i][j];
            for (var k = 0; k < listNum.length; k++) {
                var p = listNum[k];
                var sameBlock = true;
                for (var z = 0; z < listNum.length; z++) {
                    if (k != z && p.block != listNum[z].block){
                        sameBlock = false;
                    }
                }
                if (sameBlock) {
                    _.each(pointList, function(point) {
                        if (point.available.length > 0) {
                            if (point.x != p.x && point.block == p.block) {
                                if (_.contains(point.available, j)) {
                                    pointList[p.index].markLockList[j-1] = true;
                                    point.markRemoveList[j-1] = true;
                                    hasPrompt = true;
                                }
                            }
                        }
                    });
                }
            }

            var listNum = cols_available[i][j];
            for (var k = 0; k < listNum.length; k++) {
                var p = listNum[k];
                var sameBlock = true;
                for (var z = 0; z < listNum.length; z++) {
                    if (k != z && p.block != listNum[z].block){
                        sameBlock = false;
                    }
                }
                if (sameBlock) {
                    _.each(pointList, function(point) {
                        if (point.available.length > 0) {
                            if (point.y != p.y && point.block == p.block) {
                                if (_.contains(point.available, j)) {
                                    pointList[p.index].markLockList[j-1] = true;
                                    point.markRemoveList[j-1] = true;
                                    hasPrompt = true;
                                }
                            }
                        }
                    });
                }
            }

            var listNum = blocks_available[i][j];
            for (var k = 0; k < listNum.length; k++) {
                var p = listNum[k];
                var sameX = true;
                var sameY = true;
                for (var z = 0; z < listNum.length; z++) {
                    if (k != z && p.x != listNum[z].x){
                        sameX = false;
                    }
                    if (k != z && p.y != listNum[z].y){
                        sameY = false;
                    }
                }
                if (sameX || sameY) {
                    _.each(pointList, function(point) {
                        if (point.available.length > 0) {
                            if (sameX && point.x == p.x && point.block != p.block) {
                                if (_.contains(point.available, j)) {
                                    pointList[p.index].markLockList[j-1] = true;
                                    point.markRemoveList[j-1] = true;
                                    hasPrompt = true;
                                }
                            }
                            if (sameY && point.y == p.y && point.block != p.block) {
                                if (_.contains(point.available, j)) {
                                    pointList[p.index].markLockList[j-1] = true;
                                    point.markRemoveList[j-1] = true;
                                    hasPrompt = true;
                                }
                            }
                        }
                    });
                }
            }
        }
    }
    return hasPrompt;
}

function naked_pair(pointList) {
    var cols = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var rows = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length > 0) {
            rows[point.x].push(point);
            cols[point.y].push(point);
            blocks[point.block].push(point);
        }
    });

    return cal_naked_pair(rows) || cal_naked_pair(cols) || cal_naked_pair(blocks);
}
function cal_naked_pair(list) {
    var hasPrompt = false;
    _.each(_.keys(list), function(key) {
        var len_block = list[key].length;
        for (var i = 0; i < len_block; i++) {
            var point_block = list[key][i];
            if (point_block.available.length == 2) {
                for (var j = 0; j < len_block; j++) {
                    if (j != i && _.isEqual(point_block.available, list[key][j].available)) {
                        for (var k = 0; k < len_block; k++) {
                            if (k != i && k != j) {
                                _.each(point_block.available, function(num) {
                                    if (_.contains(list[key][k].available, num)) {
                                        list[key][k].markRemoveList[num-1] = true;
                                        point_block.markLockList[num-1] = true;
                                        list[key][j].markLockList[num-1] = true;
                                        hasPrompt = true;
                                    }
                                })
                            }
                        }
                    }
                }
            }
        }
    })
    return hasPrompt;
}

function naked_triple(pointList) {
    var cols = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var rows = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length > 0) {
            rows[point.x].push(point);
            cols[point.y].push(point);
            blocks[point.block].push(point);
        }
    });

    return cal_naked_triple(rows) || cal_naked_triple(cols) || cal_naked_triple(blocks);
}
function cal_naked_triple(list) {
    var hasPrompt = false;
    _.each(_.keys(list), function(key) {
        var len_block = list[key].length;
        if (len_block > 3) {
            for (var a = 0; a < len_block - 2; a++) {
                var point_a = list[key][a];
                for (var b = 0; b < len_block - 1; b++) {
                    if (b != a) {
                        var point_b = list[key][b];
                        for (var c = 0; c < len_block; c++) {
                            if (c != a && c != b) {
                                var point_c = list[key][c];
                                var nums = _.union(point_a.available, point_b.available, point_c.available);
                                if (nums.length == 3) {
                                    var canRemove = false;
                                    for (var i = 0; i < len_block; i++) {
                                        if (i != a && i != b && i != c) {
                                            _.each(list[key][i].available, function(num) {
                                                if (_.contains(nums, num)) {
                                                    list[key][i].markRemoveList[num-1] = true;
                                                    canRemove = true;
                                                    hasPrompt = true;
                                                }
                                            });
                                        }
                                    }
                                    if (canRemove) {
                                        _.each(nums, function(num) {
                                            if (_.contains(point_a.available, num)) {
                                                point_a.markLockList[num-1] = true;
                                            }
                                            if (_.contains(point_b.available, num)) {
                                                point_b.markLockList[num-1] = true;
                                            }
                                            if (_.contains(point_c.available, num)) {
                                                point_c.markLockList[num-1] = true;
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    return hasPrompt;
}

function unique_rectangle(pointList) {
    var hasPrompt = false;
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length > 0) {
            blocks[point.block].push(point);
        }
    });

    var blocks_available = [];
    _.each(_.keys(blocks), function(key) {
        if (!hasPrompt) {
            _.each(blocks[key], function(p1, i) {
                if (p1.available.length == 2) {
                    _.each(blocks[key], function(p2, j) {
                        if (i != j && p1.available.length == 2 && (p1.x == p2.x || p1.y == p2.y) && _.isEqual(p1.available, p2.available)) {
                            _.each(_.keys(blocks), function(key2) {
                                if (key != key2) {
                                    var urNum1 = p1.available[0];
                                    var urNum2 = p1.available[1];
                                    _.each(blocks[key2], function(p11, ii) {
                                        if (_.isEqual(p1.available, p11.available)) {
                                            var p22 = null;
                                            if (p11.x == p1.x) {
                                                //console.log('same row');
                                                p22 = pointList[p2.x * 9 + p11.y];
                                            } else if (p11.y == p1.y) {
                                                //console.log('same col');
                                                p22 = pointList[p11.x * 9 + p2.y];
                                            }
                                            if (p22 != null && _.contains(p22.available, urNum1) && _.contains(p22.available, urNum2)) {
                                                p1.markLockList[urNum1-1] = true;
                                                p2.markLockList[urNum1-1] = true;
                                                p1.markLockList[urNum2-1] = true;
                                                p2.markLockList[urNum2-1] = true;
                                                p11.markLockList[urNum1-1] = true;
                                                p11.markLockList[urNum2-1] = true;
                                                p22.markRemoveList[urNum1-1] = true;
                                                p22.markRemoveList[urNum2-1] = true;
                                                hasPrompt = true;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    })
                }
            });
        }
    });

    return hasPrompt;
}

//未验证
function unique_rectangle2(pointList) {
    var hasPrompt = false;
    var cols = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var rows = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length > 0) {
            rows[point.x].push(point);
            cols[point.y].push(point);
            blocks[point.block].push(point);
        }
    });

    var blocks_available = [];
    _.each(_.keys(blocks), function(key) {
        if (!hasPrompt) {
            _.each(blocks[key], function(p1, i) {
                if (p1.available.length == 2) {
                    _.each(blocks[key], function(p2, j) {
                        if (i != j && p1.available.length == 2 && (p1.x == p2.x || p1.y == p2.y) && _.isEqual(p1.available, p2.available)) {
                            _.each(_.keys(blocks), function(key2) {
                                if (key != key2) {
                                    var urNum1 = p1.available[0];
                                    var urNum2 = p1.available[1];
                                    _.each(blocks[key2], function(p11, ii) {
                                        if (p11.available.length == 3 && _.union(p11.available, p1.available).length == 3) {
                                            var p22 = null;
                                            if (p11.x == p1.x) {
                                                //console.log('same row');
                                                p22 = pointList[p2.x * 9 + p11.y];
                                            } else if (p11.y == p1.y) {
                                                //console.log('same col');
                                                var p22 = pointList[p11.x * 9 + p2.y];
                                            }
                                            if (p22 != null && _.isEqual(p22.available, p11.available)) {
                                                var bRemove = false;
                                                var lockNum = _.find(p11.available, function(num) {return num != urNum1 && num != urNum2;});
                                                _.each(blocks[p11.block], function(p) {
                                                    if (p.index != p11.index && p.index != p22.index && _.contains(p.available,lockNum)) {
                                                        p.markRemoveList[lockNum-1] = true;
                                                        bRemove = true;
                                                    }
                                                });
                                                var list = null, n = 0;
                                                if (p11.x == p22.x) {
                                                    list = rows[p11.x];
                                                    n = p11.x;
                                                } else if (p11.y == p22.y) {
                                                    list = cols[p11.y];
                                                    n = p11.y;
                                                }
                                                if (list != null) {
                                                    _.each(list[n], function(p) {
                                                        if (p.index != p11.index && p.index != p22.index && _.contains(p.available,lockNum)) {
                                                            p.markRemoveList[lockNum-1] = true;
                                                            bRemove = true;
                                                        }
                                                    });
                                                }
                                                if (bRemove) {
                                                    p1.markLockList[urNum1-1] = true;
                                                    p2.markLockList[urNum1-1] = true;
                                                    p1.markLockList[urNum2-1] = true;
                                                    p2.markLockList[urNum2-1] = true;
                                                    p11.markLockList[urNum1-1] = true;
                                                    p11.markLockList[urNum2-1] = true;
                                                    p22.markRemoveList[urNum1-1] = true;
                                                    p22.markRemoveList[urNum2-1] = true;
                                                    hasPrompt = true;
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    })
                }
            });
        }
    });

    return hasPrompt;
}

function xwing(pointList) {
    var hasPrompt = false;
    var cols = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var rows = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length > 0) {
            rows[point.x].push(point);
            cols[point.y].push(point);
            blocks[point.block].push(point);
        }
    });

    var cols_available = [];
    var rows_available = [];
    for (var i = 0; i < 9; i++) {
        var listX = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(rows[i], function(point) {
            _.each(point.available, function(num) {
                listX[num].push(point.y);
            });
        });
        rows_available.push(listX);

        var listY = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(cols[i], function(point) {
            _.each(point.available, function(num) {
                listY[num].push(point.x);
            });
        });
        cols_available.push(listY);
    }

    for (var i = 0; i < 9; i++) {
        if (hasPrompt) {
            break;
        }
        for (var j = 1; j < 10; j++) {
            if (hasPrompt) {
                break;
            }
            if (rows_available[i][j].length == 2) {
                for (var ii = 0; ii < 9; ii++) {
                    for (var jj = 1; jj < 10; jj++) {
                        if (ii == i && jj == j) {
                            continue;
                        }
                        if (jj == j && _.isEqual(rows_available[ii][jj], rows_available[i][j])) {
                            var isRemove = false;
                            _.each(pointList, function(point) {
                                if (point.x != i && point.x != ii && _.contains(rows_available[i][j], point.y)) {
                                    if (_.contains(point.available, j)) {
                                        point.markRemoveList[j-1] = true;
                                        isRemove = true
                                        hasPrompt = true;
                                    }
                                }
                            });
                            if (isRemove) {
                                _.each(rows_available[i][j], function(colNum) {
                                    pointList[i*9+colNum].markLockList[j-1] = true;
                                    pointList[ii*9+colNum].markLockList[j-1] = true;
                                })
                            }
                        }
                    }
                }
            }

            if (cols_available[i][j].length == 2) {
                for (var ii = 0; ii < 9; ii++) {
                    for (var jj = 1; jj < 10; jj++) {
                        if (ii == i && jj == j) {
                            continue;
                        }
                        if (jj == j && _.isEqual(cols_available[ii][jj], cols_available[i][j])) {
                            var isRemove = false;
                            _.each(pointList, function(point) {
                                if (point.y != i && point.y != ii && _.contains(cols_available[i][j], point.x)) {
                                    if (_.contains(point.available, j)) {
                                        point.markRemoveList[j-1] = true;
                                        isRemove = true;
                                        hasPrompt = true;
                                    }
                                }
                            });
                            if (isRemove) {
                                _.each(cols_available[i][j], function(rowNum) {
                                    pointList[rowNum*9+i].markLockList[j-1] = true;
                                    pointList[rowNum*9+ii].markLockList[j-1] = true;
                                })
                            }
                        }
                    }
                }
            }
        }
    }

    return hasPrompt;
}

//只有第一种情况验证过， 其他情况还没验证
function ywing(pointList) {
    var hasPrompt = false;
    var cols = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var rows = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length > 0) {
            rows[point.x].push(point);
            cols[point.y].push(point);
            blocks[point.block].push(point);
        }
    });

    var cols_available = [];
    var rows_available = [];
    for (var i = 0; i < 9; i++) {
        var listX = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(rows[i], function(point) {
            _.each(point.available, function(num) {
                listX[num].push(point);
            });
        });
        rows_available.push(listX);

        var listY = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(cols[i], function(point) {
            _.each(point.available, function(num) {
                listY[num].push(point);
            });
        });
        cols_available.push(listY);
    }

    var blocks_available = [];
    _.each(_.keys(blocks), function(key) {
        var listB = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(blocks[key], function(point) {
            _.each(point.available, function(num) {
                listB[num].push(point);
            })
        });
        blocks_available.push(listB);
    });

    for (var i = 0; i < 9; i++) {
        if (hasPrompt) {
            break;
        }
        for (var j = 1; j < 10; j++) {
            if (hasPrompt) {
                break;
            }
            if (rows_available[i][j].length == 2) {
                //console.log("row:" + i + " num:" + j + " cols:", rows_available[i][j])
                var point_a = rows_available[i][j][0];
                var point_b = rows_available[i][j][1];

                _.each(cols[point_a.y], function(p1) {
                    if (p1.x != point_a.x && p1.available.length == 2 && _.contains(p1.available, j)) {
                        var lockNum = _.find(p1.available, function(num) {return num != j;});

                        _.each(cols[point_b.y], function(p2) {
                            if (p2.x != point_b.x && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                        _.each(blocks[point_b.block], function(p2) {
                            if (p2.block != point_b.block && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                    }
                });

                _.each(blocks[point_a.block], function(p1) {
                    if (p1.block != point_a.block && p1.available.length == 2 && _.contains(p1.available, j)) {
                        var lockNum = _.find(p1.available, function(num) {return num != j;});

                        _.each(cols[point_b.y], function(p2) {
                            if (p2.x != i && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                        _.each(blocks[point_b.block], function(p2) {
                            if (p2.block != point_b.block && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                    }
                });
            }

            if (cols_available[i][j].length == 2) {
                //console.log("col:" + i + " num:" + j + " rows:", cols_available[i][j])
                var point_a = cols_available[i][j][0];
                var point_b = cols_available[i][j][1];

                _.each(rows[point_a.x], function(p1) {
                    if (p1.y != point_a.y && p1.available.length == 2 && _.contains(p1.available, j)) {
                        var lockNum = _.find(p1.available, function(num) {return num != j;});

                        _.each(rows[point_b.x], function(p2) {
                            if (p2.y != point_b.y && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                        _.each(blocks[point_b.block], function(p2) {
                            if (p2.block != point_b.block && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                    }
                });

                _.each(blocks[point_a.block], function(p1) {
                    if (p1.block != point_a.block && p1.available.length == 2 && _.contains(p1.available, j)) {
                        var lockNum = _.find(p1.available, function(num) {return num != j;});

                        _.each(rows[point_b.x], function(p2) {
                            if (p2.y != point_b.y && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                        _.each(blocks[point_b.block], function(p2) {
                            if (p2.block != point_b.block && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                    }
                });
            }

            if (blocks_available[i][j].length == 2) {
                //console.log("block:" + i + " num:" + j + " points:", blocks_available[i][j])
                var point_a = blocks_available[i][j][0];
                var point_b = blocks_available[i][j][1];

                _.each(rows[point_a.x], function(p1) {
                    if (p1.block != point_a.block && p1.available.length == 2 && _.contains(p1.available, j)) {
                        var lockNum = _.find(p1.available, function(num) {return num != j;});

                        _.each(rows[point_b.x], function(p2) {
                            if (p2.block != point_b.block && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                        _.each(cols[point_b.y], function(p2) {
                            if (p2.block != point_b.block && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                    }
                });

                _.each(cols[point_a.y], function(p1) {
                    if (p1.block != point_a.block && p1.available.length == 2 && _.contains(p1.available, j)) {
                        var lockNum = _.find(p1.available, function(num) {return num != j;});

                        _.each(rows[point_b.x], function(p2) {
                            if (p2.block != point_b.block && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                        _.each(cols[point_b.y], function(p2) {
                            if (p2.block != point_b.block && _.isEqual(p1.available, p2.available)) {
                                var bRemove = false;
                                _.each(pointList, function(point) {
                                    if (point.available.length > 0 && point.index != p1.index && point.index != p2.index && _.contains(point.available, lockNum)) {
                                        if ((point.x == p1.x && point.y == p2.y) ||
                                            (point.x == p2.x && point.y == p1.y) ||
                                            (point.x == p1.x && point.block == p2.block) ||
                                            (point.x == p2.x && point.block == p1.block) ||
                                            (point.y == p1.y && point.block == p2.block) ||
                                            (point.y == p2.y && point.block == p1.block)) {
                                            point.markRemoveList[lockNum-1] = true;
                                            bRemove = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                                if (bRemove) {
                                    point_a.markRelateList[j-1] = true;
                                    point_b.markRelateList[j-1] = true;
                                    p1.markRelateList[j-1] = true;
                                    p2.markRelateList[j-1] = true;
                                    p1.markLockList[lockNum-1] = true;
                                    p2.markLockList[lockNum-1] = true;
                                }
                            }
                        });
                    }
                });
            }
        }
    }

    return hasPrompt;
}

function xywing(pointList) {
    var hasPrompt = false;
    var cols = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var rows = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length == 2) {
            rows[point.x].push(point);
            cols[point.y].push(point);
            blocks[point.block].push(point);
        }
    });

    var blocks_available = [];
    _.each(_.keys(blocks), function(key) {
        if (!hasPrompt) {
            _.each(blocks[key], function(p1, i) {
                _.each(_.keys(blocks), function(key2) {
                    _.each(blocks[key2], function(p2, j) {
                        if (p1.index != p2.index && (p1.x == p2.x || p1.y == p2.y || p1.block == p2.block) && _.union(p1.available, p2.available).length == 3) {
                            var y = _.difference(p1.available, p2.available)[0];
                            var z = _.difference(p2.available, p1.available)[0];
                            var x = _.find(p1.available, function(n) {return n != y;});
                            var yz = _.sortBy([y, z]);
                            var sameBlock = key == key2;
                            /*
                            _.each(blocks[p1.block], function(p3, j) {
                                if (_.isEqual(yz, p3.available)) {
                                    console.log(p1, p2, p3);
                                }
                            });*/
                            if (p1.x != p2.x) {
                                _.each(rows[p1.x], function(p3, j) {
                                    if ((!sameBlock || p1.block != p3.block) && _.isEqual(yz, p3.available)) {
                                        var bRemove = false;
                                        _.each(pointList, function(point) {
                                            if (point.index != p1.index && point.index != p2.index && point.index != p3.index && _.contains(point.available,z)) {
                                                var isRelateP2 = point.x == p2.x || point.y == p2.y || point.block == p2.block;
                                                var isRelateP3 = point.x == p3.x || point.y == p3.y || point.block == p3.block;
                                                if (isRelateP2 && isRelateP3) {
                                                    bRemove = true;
                                                    point.markRemoveList[z-1] = true;
                                                }
                                            }
                                        });
                                        if (bRemove) {
                                            p1.markRelateList[x-1] = true;
                                            p1.markRelateList[y-1] = true;
                                            p2.markRelateList[x-1] = true;
                                            p3.markRelateList[y-1] = true;
                                            p2.markLockList[z-1] = true;
                                            p3.markLockList[z-1] = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                            }
                            if (p1.y != p2.y) {
                                _.each(cols[p1.y], function(p3, j) {
                                    if ((!sameBlock || p1.block != p3.block) && _.isEqual(yz, p3.available)) {
                                        var bRemove = false;
                                        _.each(pointList, function(point) {
                                            if (point.index != p1.index && point.index != p2.index && point.index != p3.index && _.contains(point.available,z)) {
                                                var isRelateP2 = point.x == p2.x || point.y == p2.y || point.block == p2.block;
                                                var isRelateP3 = point.x == p3.x || point.y == p3.y || point.block == p3.block;
                                                if (isRelateP2 && isRelateP3) {
                                                    bRemove = true;
                                                    point.markRemoveList[z-1] = true;
                                                }
                                            }
                                        });
                                        if (bRemove) {
                                            p1.markRelateList[x-1] = true;
                                            p1.markRelateList[y-1] = true;
                                            p2.markRelateList[x-1] = true;
                                            p3.markRelateList[y-1] = true;
                                            p2.markLockList[z-1] = true;
                                            p3.markLockList[z-1] = true;
                                            hasPrompt = true;
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            });
        }
    });
    return hasPrompt;
}


function single_chain(pointList) {
    var hasPrompt = false;
    var cols = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var rows = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length > 0) {
            rows[point.x].push(point);
            cols[point.y].push(point);
            blocks[point.block].push(point);
        }
    });

    var cols_available = [];
    var rows_available = [];
    for (var i = 0; i < 9; i++) {
        var listX = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(rows[i], function(point) {
            _.each(point.available, function(num) {
                listX[num].push(point);
            });
        });
        rows_available.push(listX);

        var listY = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(cols[i], function(point) {
            _.each(point.available, function(num) {
                listY[num].push(point);
            });
        });
        cols_available.push(listY);
    }

    var blocks_available = [];
    _.each(_.keys(blocks), function(key) {
        var listB = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        _.each(blocks[key], function(point) {
            _.each(point.available, function(num) {
                listB[num].push(point);
            })
        });
        blocks_available.push(listB);
    });

    for (var i = 0; i < 9; i++) {
        if (hasPrompt) {
            break;
        }
        for (var j = 1; j < 10; j++) {
            if (hasPrompt) {
                break;
            }
            var p1=null, p2=null, p3, p4;
            if (rows_available[i][j].length == 2) {
                for (var ii = 0; ii < 9; ii++) {
                    if (i != ii && rows_available[ii][j].length == 2) {
                        //console.log("row1: " + i + " value: " + j + " row2:" + ii);
                        var point_row1_a = rows_available[i][j][0];
                        var point_row1_b = rows_available[i][j][1];
                        var point_row2_a = rows_available[ii][j][0];
                        var point_row2_b = rows_available[ii][j][1];
                        if (point_row1_a.y == point_row2_a.y) {
                            p1 = point_row1_b;
                            p2 = point_row2_b;
                            p3 = point_row1_a;
                            p4 = point_row2_a;
                        } else if (point_row1_a.y == point_row2_b.y) {
                            p1 = point_row1_b;
                            p2 = point_row2_a;
                            p3 = point_row1_a;
                            p4 = point_row2_b;
                        } else if (point_row1_b.y == point_row2_a.y) {
                            p1 = point_row1_a;
                            p2 = point_row2_b;
                            p3 = point_row1_b;
                            p4 = point_row2_a;
                        } else if (point_row1_b.y == point_row2_b.y) {
                            p1 = point_row1_a;
                            p2 = point_row2_a;
                            p3 = point_row1_b;
                            p4 = point_row2_b;
                        }
                    }

                    if (cols_available[ii][j].length == 2) {
                        //console.log("row1: " + i + " value: " + j + " col2:" + ii);
                        var point_row1_a = rows_available[i][j][0];
                        var point_row1_b = rows_available[i][j][1];
                        var point_col2_a = cols_available[ii][j][0];
                        var point_col2_b = cols_available[ii][j][1];
                        if (point_row1_a.block == point_col2_a.block && point_row1_a.index != point_col2_a.index) {
                            p1 = point_row1_b;
                            p2 = point_col2_b;
                            p3 = point_row1_a;
                            p4 = point_col2_a;
                        } else if (point_row1_a.block == point_col2_b.block && point_row1_a.index != point_col2_b.index) {
                            p1 = point_row1_b;
                            p2 = point_col2_a;
                            p3 = point_row1_a;
                            p4 = point_col2_b;
                        } else if (point_row1_b.block == point_col2_a.block && point_row1_b.index != point_col2_a.index) {
                            p1 = point_row1_a;
                            p2 = point_col2_b;
                            p3 = point_row1_b;
                            p4 = point_col2_a;
                        } else if (point_row1_b.block == point_col2_b.block && point_row1_b.index != point_col2_b.index) {
                            p1 = point_row1_a;
                            p2 = point_col2_a;
                            p3 = point_row1_b;
                            p4 = point_col2_b;
                        }
                    }
                }
            }

            if (cols_available[i][j].length == 2) {
                for (var ii = 0; ii < 9; ii++) {
                    if (i != ii && cols_available[ii][j].length == 2) {
                        //console.log("col1: " + i + " value: " + j + " col2:" + ii);
                        var point_col1_a = cols_available[i][j][0];
                        var point_col1_b = cols_available[i][j][1];
                        var point_col2_a = cols_available[ii][j][0];
                        var point_col2_b = cols_available[ii][j][1];
                        if (point_col1_a.y == point_col2_a.y) {
                            p1 = point_col1_b;
                            p2 = point_col2_b;
                            p3 = point_col1_a;
                            p4 = point_col2_a;
                        } else if (point_col1_a.y == point_col2_b.y) {
                            p1 = point_col1_b;
                            p2 = point_col2_a;
                            p3 = point_col1_a;
                            p4 = point_col2_b;
                        } else if (point_col1_b.y == point_col2_a.y) {
                            p1 = point_col1_a;
                            p2 = point_col2_b;
                            p3 = point_col1_b;
                            p4 = point_col2_a;
                        } else if (point_col1_b.y == point_col2_b.y) {
                            p1 = point_col1_a;
                            p2 = point_col2_a;
                            p3 = point_col1_b;
                            p4 = point_col2_b;
                        }
                    }

                }
            }

            if (p1 != null && p2 != null) {
                var isRemove = false;
                _.each(pointList, function(point) {
                    if (_.contains(point.available, j) && !_.contains([p1.index, p2.index, p3.index, p4.index], point.index)) {
                        if ((point.x == p1.x && (point.y == p2.y || point.block == p2.block)) ||
                            (point.y == p1.y && (point.x == p2.x || point.block == p2.block)) ||
                            (point.x == p2.x && (point.y == p1.y || point.block == p1.block)) ||
                            (point.x == p2.x && (point.y == p1.y || point.block == p1.block)) ||
                            (point.block == p1.block && p1.block == p2.block)
                            ) {
                                console.log(point)
                            point.markRemoveList[j-1] = true;
                            isRemove = true;
                        }
                    }
                });
                if (isRemove) {
                    p1.markLockList[j-1] = true;
                    p2.markLockList[j-1] = true;
                    p3.markLockList[j-1] = true;
                    p4.markLockList[j-1] = true;
                    hasPrompt = true;
                }
            }
        }
    }

    return hasPrompt;
}

function xy_chain(pointList) {
    var hasPrompt = false;
    var cols = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var rows = {0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
    var blocks = {0:[],3:[],6:[],27:[],30:[],33:[],54:[],57:[],60:[]};
    _.each(pointList, function(point) {
        if (point.available.length == 2) {
            rows[point.x].push(point);
            cols[point.y].push(point);
            blocks[point.block].push(point);
        }
    });

    var blocks_available = [];
    _.each(_.keys(blocks), function(key) {
        if (!hasPrompt) {
            _.each(blocks[key], function(p1) {
                var p1_num1 = p1.available[0];
                var p1_num2 = p1.available[1];
                var relate_index = [];
                relate_index.push(p1.index);
                _.each(p1.available, function(p1_num, i) {
                    if (!hasPrompt && xy_chain_check(pointList, blocks, relate_index, p1, p1_num, p1.available[i==0?1:0])) {
                        hasPrompt = true;
                    }
                });
            });
        }
    });

    return hasPrompt;
}

function xy_chain_check(pointList, blocks, relate_index_pre, point_pre, lock_num, next_num) {
    var relate_num = next_num;
    next_num = 0;
    var hasPrompt = false;
    var relate_index_1 = deepClone(relate_index_pre);
    _.each(_.keys(blocks), function(key2) {
        if (!hasPrompt) {
            _.each(blocks[key2], function(p2, j) {
                if (!hasPrompt) {
                    if (!_.contains(relate_index_1, p2.index) && (point_pre.x == p2.x || point_pre.y == p2.y || point_pre.block == p2.block)) {
                        var relate_index = deepClone(relate_index_1);
                        _.each(p2.available, function(p2_num) {
                            if (!hasPrompt && relate_num == p2_num) {
                                next_num= _.find(p2.available, function(num) {return num != p2_num;});
                                relate_index.push(p2.index);
                                if (next_num == lock_num) {
                                    var point_first = pointList[relate_index[0]];

                                    _.each(pointList, function(point) {
                                        if (!_.contains(relate_index, point.index) && _.contains(point.available, lock_num)
                                            && (point.x == point_first.x || point.y == point_first.y || point.block == point_first.block)
                                            && (point.x == p2.x || point.y == p2.y || point.block == p2.block)) {
                                            point.markRemoveList[lock_num-1] = true;
                                            hasPrompt = true;
                                        }
                                    });
                                    if (hasPrompt) {
                                        point_first.markLockList[lock_num-1] = true;
                                        p2.markLockList[lock_num-1] = true;
                                        _.each(relate_index, function(i) {
                                            pointList[i].markRelateList[pointList[i].available[0]-1] = true;
                                            pointList[i].markRelateList[pointList[i].available[1]-1] = true;
                                        });
                                    }
                                } else {
                                    hasPrompt = xy_chain_check(pointList, blocks, relate_index, p2, lock_num, next_num);
                                }
                            }
                        });
                    }
                }
            });
        }
    });
    return hasPrompt;
}

function verify(sudo) {
    var bPass = true;
    var nums = [1,2,3,4,5,6,7,8,9];
    for (var i = 0; i < 9; i++) {
        var row = [];
        var col = [];
        var block = [];

        row = sudo.slice(i*9, i*9+9);
        //console.log(row)
        if (!_.isEqual(_.sortBy(row), nums)) {
            bPass = false;
            break;
        }

        for (var j = i; j < sudo.length; j=j+9) {
            col.push(sudo[j]);
        }
        //console.log(col)
        if (!_.isEqual(_.sortBy(col), nums)) {
            bPass = false;
            break;
        }

        var block_x = i % 3;
        var block_y = parseInt(i / 3);
        var start = block_y * 3 * 9 + block_x * 3;
        for (var j = start; j < start + 3; j++) {
            block.push(sudo[j]);
        }
        for (var j = start + 9; j < start + 9 + 3; j++) {
            block.push(sudo[j]);
        }
        for (var j = start + 9 * 2; j < start + 9 * 2 + 3; j++) {
            block.push(sudo[j]);
        }
        //console.log(block)
        if (!_.isEqual(_.sortBy(block), nums)) {
            bPass = false;
            break;
        }
    }

    console.log(bPass ? "Success" : "Error");
    return bPass;
}

//深度克隆
function deepClone(obj){
    var result,oClass=isClass(obj);
        //确定result的类型
    if (oClass==="Object"){
        result={};
    }else if (oClass==="Array"){
        result=[];
    }else{
        return obj;
    }
    for(key in obj){
        var copy=obj[key];
        if (isClass(copy)=="Object"){
            result[key]=arguments.callee(copy);//递归调用
        }else if (isClass(copy)=="Array"){
            result[key]=arguments.callee(copy);
        }else{
            result[key]=obj[key];
        }
    }
    return result;
}
//返回传递给他的任意对象的类
function isClass(o){
    if (o===null) return "Null";
    if (o===undefined) return "Undefined";
    return Object.prototype.toString.call(o).slice(8,-1);
}
