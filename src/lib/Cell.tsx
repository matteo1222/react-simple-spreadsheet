import React from "react"
import "./Cell.css"

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
}

function Cell(props: CellProps) {
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
        <span className="Cell__Span">{props.value}</span>
      )}
    </td>
  )
}

export default Cell
