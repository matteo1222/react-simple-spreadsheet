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
import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import "./Cell.css";
// TODO: Solve formula dependency bug
function Cell(props) {
    function displayValue(value) {
        if (typeof value === "string") {
            if (value.slice(0, 1) === "=") {
                var parseRes = props.calculateFormula({ rowIdx: props.rowIdx, colIdx: props.colIdx }, value.slice(1));
                if (parseRes.error !== null) {
                    return parseRes.error;
                }
                return parseRes.result;
            }
        }
        return value;
    }
    return (_jsx("td", __assign({ className: "Cell ".concat(props.selected ? "Cell--Selected" : ""), onClick: function (event) { return props.onClick(event, props.rowIdx, props.colIdx); } }, { children: props.isEditting ? (_jsx("input", { className: "Cell__Input", autoFocus: true, value: props.value, onChange: function (event) {
                return props.onChange(event, props.rowIdx, props.colIdx);
            }, onBlur: props.onBlur })) : (_jsx("span", __assign({ className: "Cell__Span" }, { children: displayValue(props.value) }))) })));
}
Cell.whyDidYouRender = true;
function areEqual(prevProps, nextProps) {
    // Update Cell when it contains formula because it might depend on another cell's value
    if (prevProps.value.toString().slice(0, 1) === "=" ||
        nextProps.value.toString().slice(0, 1) === "=") {
        return false;
    }
    return (prevProps.rowIdx === nextProps.rowIdx &&
        prevProps.colIdx === nextProps.colIdx &&
        prevProps.value === nextProps.value &&
        prevProps.selected === nextProps.selected &&
        prevProps.isEditting === nextProps.isEditting &&
        prevProps.onClick === nextProps.onClick &&
        prevProps.onChange === nextProps.onChange &&
        prevProps.onBlur === nextProps.onBlur &&
        prevProps.calculateFormula === nextProps.calculateFormula);
}
export default React.memo(Cell, areEqual);
