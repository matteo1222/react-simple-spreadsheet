import React from "react";
import "./SpreadSheet.css";
export interface CellIndex {
    rowIdx: number;
    colIdx: number;
}
export interface ICellData {
    value: number | string;
}
export interface SpreadSheetProps {
    data: ICellData[][];
    onChange: React.Dispatch<React.SetStateAction<ICellData[][]>>;
}
export interface ICalculateFormulaRes {
    error: null | string;
    result: string | number;
}
declare function SpreadSheet(props: SpreadSheetProps): JSX.Element;
declare namespace SpreadSheet {
    var whyDidYouRender: boolean;
}
export default SpreadSheet;
