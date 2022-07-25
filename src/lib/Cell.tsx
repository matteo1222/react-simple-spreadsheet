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
  calculateFormula: (value: string) => ICalculateFormulaRes
}

function Cell(props: CellProps) {
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
      {props.selected && props.isEditting ? (
        <input
          className="Cell__Input"
          autoFocus
          value={props.value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            props.onChange(event, props.rowIdx, props.colIdx)
          }
        />
      ) : (
        <span className="Cell__Span">{displayValue(props.value)}</span>
      )}
    </td>
  )
}

export default Cell
