import React from "react"
import "./Cell.css"
import { ICalculateFormulaRes } from "./SpreadSheet"

export interface CellProps {
  rowIdx: number
  colIdx: number
  value: number | string
  selected: boolean
  isEditting: boolean
  onClick: (event: React.MouseEvent, rowIdx: number, colIdx: number) => void
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    rowIdx: number,
    colIdx: number
  ) => void
  onBlur: (event: React.FocusEvent) => void
  calculateFormula: (value: string) => ICalculateFormulaRes
}

// TODO: Solve formula dependency bug
function Cell(props: CellProps) {
  // console.log("key", props.rowIdx, props.colIdx)
  function displayValue(value: number | string) {
    if (typeof value === "string") {
      if (value.slice(0, 1) === "=") {
        const parseRes = props.calculateFormula(value.slice(1))

        if (parseRes.error !== null) {
          return parseRes.error
        }
        return parseRes.result
      }
    }
    return value
  }
  return (
    <td
      className={`Cell ${props.selected ? "Cell--Selected" : ""}`}
      onClick={(event) => props.onClick(event, props.rowIdx, props.colIdx)}
    >
      {props.isEditting ? (
        <input
          className="Cell__Input"
          autoFocus
          value={props.value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            props.onChange(event, props.rowIdx, props.colIdx)
          }
          onBlur={props.onBlur}
        />
      ) : (
        <span className="Cell__Span">{displayValue(props.value)}</span>
      )}
    </td>
  )
}

Cell.whyDidYouRender = true

export default React.memo(Cell)
