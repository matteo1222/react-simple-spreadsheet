var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import "./SpreadSheet.css";
import Cell from "./Cell";
import { parseCellInputValue } from "./utils/parse";
var HotFormulaParser = require("hot-formula-parser").Parser;
function SpreadSheet(props) {
    var _a = React.useState({}), updateState = _a[1];
    var forceUpdate = React.useCallback(function () { return updateState({}); }, []);
    var formulaParser = useMemo(function () {
        return new HotFormulaParser();
    }, []);
    var tableRef = useRef(null);
    var setData = props.onChange;
    var _b = useState(null), selectedCell = _b[0], setSelectedCell = _b[1];
    var _c = useState(false), isEditting = _c[0], setIsEditting = _c[1];
    var numCol = 26;
    var numRow = 50;
    useEffect(function () {
        // TODO: are there better ways?
        // We need to synchronize when the user is editting a cell being refered by another cell,
        // they should update at the same time.
        // the reason formula cell's data state "lags behind one state" of original cell without forceUpdate is because,
        // when data state change, formulaParser hasn't register the new callCellValue listener yet.
        // therefore we add a forceUpdate whenever the data state changes
        forceUpdate();
        formulaParser.on("callCellValue", function (cellCoord, done) {
            var currentCell = formulaParser.currentCell;
            var rowIdx = cellCoord.row.index;
            var colIdx = cellCoord.column.index;
            // TODO: error handling
            if (rowIdx > numRow || colIdx > numCol) {
                throw new Error("Error - Out of Range");
            }
            if (rowIdx === (currentCell === null || currentCell === void 0 ? void 0 : currentCell.rowIdx) && colIdx === (currentCell === null || currentCell === void 0 ? void 0 : currentCell.colIdx)) {
                throw new Error("Error - Self-referencing");
            }
            if (!props.data[rowIdx] || !props.data[rowIdx][colIdx]) {
                return done("");
            }
            done(props.data[rowIdx][colIdx].value);
        });
        formulaParser.on("callRangeValue", function (startCellCoord, endCellCoord, done) {
            var currentCell = formulaParser.currentCell;
            var fragment = [];
            var startRowIdx = startCellCoord.row.index;
            var startColIdx = startCellCoord.column.index;
            var endRowIdx = endCellCoord.row.index;
            var endColIdx = endCellCoord.column.index;
            // TODO: Add error handler
            for (var row = startRowIdx; row <= endRowIdx; row++) {
                var rowData = props.data[row];
                if (!rowData)
                    continue;
                var rowFragment = [];
                for (var col = startColIdx; col <= endColIdx; col++) {
                    if (!rowData[col]) {
                        rowFragment.push("");
                        continue;
                    }
                    // self referencing
                    if (row === (currentCell === null || currentCell === void 0 ? void 0 : currentCell.rowIdx) && col === (currentCell === null || currentCell === void 0 ? void 0 : currentCell.colIdx)) {
                        throw new Error("Error - Self-referencing");
                    }
                    // When cell value is a formula
                    if (rowData[col].value.toString().slice(0, 1) === "=") {
                        var parseResult = calculateFormula({ rowIdx: row, colIdx: col }, rowData[col].value.toString().slice(1));
                        if (parseResult.error !== null) {
                            throw new Error(parseResult.error);
                        }
                        rowFragment.push(parseResult.result);
                        continue;
                    }
                    rowFragment.push(rowData[col].value);
                }
                fragment.push(rowFragment);
            }
            if (fragment) {
                done(fragment);
            }
        });
        // tear down event listener
        return function () {
            formulaParser.off("callCellValue");
            formulaParser.off("callRangeValue");
        };
    }, [formulaParser, props.data]);
    function handleCellBlur(event) {
        setIsEditting(false);
    }
    function handleCellClick(event, rowIdx, colIdx) {
        // if (selectedCell?.rowIdx !== rowIdx || selectedCell?.colIdx !== colIdx) {
        //   setIsEditting(false)
        // }
        // TODO: if rowIdx and colIdx are same as previous, consider not setting new object state?
        setSelectedCell(function (prevSelected) {
            if ((prevSelected === null || prevSelected === void 0 ? void 0 : prevSelected.rowIdx) === rowIdx && (prevSelected === null || prevSelected === void 0 ? void 0 : prevSelected.colIdx) === colIdx) {
                return prevSelected;
            }
            return { rowIdx: rowIdx, colIdx: colIdx };
        });
        // handle double click
        if (event.detail === 2) {
            setIsEditting(true);
        }
    }
    function handleCellChange(event, rowIdx, colIdx) {
        // if the editted cell is out of range of the provided data, expand the data and fill in the correct values
        setData(function (prevData) {
            var rowLength = Math.max(rowIdx + 1, prevData.length);
            var colLength = Math.max(colIdx + 1, prevData[0].length);
            var newData = new Array(rowLength).fill(null).map(function (_, newRowIdx) {
                return new Array(colLength).fill(null).map(function (_, newColIdx) {
                    var _a;
                    if (rowIdx === newRowIdx && colIdx === newColIdx) {
                        return {
                            value: parseCellInputValue(event.target.value)
                        };
                    }
                    if ((_a = prevData[newRowIdx]) === null || _a === void 0 ? void 0 : _a[newColIdx]) {
                        return prevData[newRowIdx][newColIdx];
                    }
                    return {
                        value: ""
                    };
                });
            });
            return newData;
        });
    }
    function handleKeyDown(event) {
        // TODO: number key does not trigger keydown event for some reason
        // TODO: when selected cell is out of view, we should focus on the selected cell and scroll into view
        // TODO: perhaps handleKEyDown should be attached on each cell? Cell can be focus and scroll into view
        if (!selectedCell)
            return;
        if (isEditting && event.code === "Enter") {
            event.preventDefault();
            setIsEditting(false);
            setSelectedCell({
                rowIdx: Math.min((selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.rowIdx) + 1, numRow - 1),
                colIdx: selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.colIdx
            });
            // Pressing enter cause table to be out of focus, so we need to set it focus
            if (tableRef && tableRef.current) {
                tableRef.current.focus();
            }
            return;
        }
        if (!isEditting &&
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
            event.preventDefault();
            switch (event.code) {
                case "ArrowUp":
                    setSelectedCell({
                        rowIdx: Math.max((selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.rowIdx) - 1, 0),
                        colIdx: selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.colIdx
                    });
                    return;
                case "ArrowDown":
                    setSelectedCell({
                        rowIdx: Math.min((selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.rowIdx) + 1, numRow - 1),
                        colIdx: selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.colIdx
                    });
                    return;
                case "ArrowLeft":
                    setSelectedCell({
                        rowIdx: selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.rowIdx,
                        colIdx: Math.max((selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.colIdx) - 1, 0)
                    });
                    return;
                case "ArrowRight":
                    setSelectedCell({
                        rowIdx: selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.rowIdx,
                        colIdx: Math.min((selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.colIdx) + 1, numCol - 1)
                    });
                    return;
            }
        }
        if (!isEditting) {
            setIsEditting(true);
            return;
        }
    }
    function calculateFormula(cell, value) {
        formulaParser.currentCell = cell;
        var parseResult = formulaParser.parse(value);
        if (parseResult.error !== null) {
            return parseResult;
        }
        if (parseResult.result.toString().slice(0, 1) === "=") {
            return calculateFormula(cell, parseResult.result.toString().slice(1));
        }
        return parseResult;
    }
    // memoized callback
    var handleClickCallback = useCallback(handleCellClick, []);
    var handleChangeCallback = useCallback(handleCellChange, [setData]);
    var calculateFormulaCallback = useCallback(calculateFormula, []);
    var handleBlurCallback = useCallback(handleCellBlur, []);
    return (_jsxs("table", __assign({ ref: tableRef, className: "SpreadSheet", tabIndex: -1, onKeyDown: handleKeyDown }, { children: [_jsx("colgroup", { children: Array(numCol + 1)
                    .fill(null)
                    .map(function (_, idx) {
                    return _jsx("col", { className: "SpreadSheet__Col" }, idx);
                }) }), _jsx("thead", { children: _jsx("tr", { children: Array(numCol + 1)
                        .fill(null)
                        .map(function (_, idx) {
                        if (idx === 0)
                            return _jsx("th", {}, idx);
                        return _jsx("th", { children: String.fromCharCode(64 + idx) }, idx);
                    }) }) }), _jsx("tbody", { children: Array(numRow)
                    .fill(null)
                    .map(function (_, rowIdx) { return (
                // Rows
                _jsx("tr", { children: Array(numCol + 1)
                        .fill(null)
                        .map(function (_, colIdx) {
                        var _a, _b, _c;
                        if (colIdx === 0)
                            return _jsx("th", { children: rowIdx + 1 }, rowIdx + 1);
                        // TODO: refactor cell col idx access
                        var cellValue = (_c = (_b = (_a = props.data) === null || _a === void 0 ? void 0 : _a[rowIdx]) === null || _b === void 0 ? void 0 : _b[colIdx - 1]) === null || _c === void 0 ? void 0 : _c.value;
                        var isSelected = (selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.rowIdx) === rowIdx &&
                            (selectedCell === null || selectedCell === void 0 ? void 0 : selectedCell.colIdx) === colIdx - 1;
                        return (_jsx(Cell, { rowIdx: rowIdx, colIdx: colIdx - 1, value: cellValue !== null && cellValue !== undefined
                                ? cellValue
                                : "", selected: isSelected, isEditting: isSelected && isEditting, onClick: handleClickCallback, onChange: handleChangeCallback, onBlur: handleBlurCallback, calculateFormula: calculateFormulaCallback }, "".concat(rowIdx, "_").concat(colIdx - 1)));
                    }) }, rowIdx)); }) })] })));
}
SpreadSheet.whyDidYouRender = true;
export default SpreadSheet;
