import React from "react";
import "./Cell.css";
import { ICalculateFormulaRes, CellIndex } from "./SpreadSheet";
export interface CellProps {
    rowIdx: number;
    colIdx: number;
    value: number | string;
    selected: boolean;
    isEditting: boolean;
    onClick: (event: React.MouseEvent, rowIdx: number, colIdx: number) => void;
    onChange: (event: React.ChangeEvent<HTMLInputElement>, rowIdx: number, colIdx: number) => void;
    onBlur: (event: React.FocusEvent) => void;
    calculateFormula: (cell: CellIndex, value: string) => ICalculateFormulaRes;
}
declare function Cell(props: CellProps): JSX.Element;
declare namespace Cell {
    var whyDidYouRender: boolean;
}
declare const _default: React.MemoExoticComponent<typeof Cell>;
export default _default;
