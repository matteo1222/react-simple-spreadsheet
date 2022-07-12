import React from "react"
import "./Cell.css"

export interface CellProps {
  rowIdx: number
  colIdx: number
  value: number | string
  selected: boolean
  onClick: (rowIdx: number, colIdx: number) => void
}

function Cell(props: CellProps) {
  return (
    <td
      className={`Cell ${props.selected ? "Cell--Selected" : ""}`}
      onClick={() => props.onClick(props.rowIdx, props.colIdx)}
    >
      {props.value}
    </td>
  )
}

export default Cell
