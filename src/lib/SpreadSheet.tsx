import React, { useState } from "react"
import "./SpreadSheet.css"
import Cell from "./Cell"

export interface CellIndex {
  rowIdx: number
  colIdx: number
}

function SpreadSheet() {
  const [selectedCell, setSelectedCell] = useState<null | CellIndex>(null)
  let numCol = 26
  let numRow = 50

  function handleCellClick(rowIdx: number, colIdx: number) {
    setSelectedCell({
      rowIdx: rowIdx,
      colIdx: colIdx
    })
  }
  return (
    <table className="SpreadSheet">
      <thead>
        <tr>
          {Array(numCol + 1)
            .fill(null)
            .map((_, idx) => {
              if (idx === 0) return <th></th>
              return <th key={idx}>{String.fromCharCode(64 + idx)}</th>
            })}
        </tr>
      </thead>
      <tbody>
        {Array(numRow)
          .fill(null)
          .map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array(numCol + 1)
                .fill(null)
                .map((_, colIdx) => {
                  if (colIdx === 0) return <th>{rowIdx + 1}</th>
                  return (
                    <Cell
                      key={`${rowIdx}_${colIdx}`}
                      rowIdx={rowIdx}
                      colIdx={colIdx}
                      value=""
                      selected={
                        selectedCell?.rowIdx === rowIdx &&
                        selectedCell?.colIdx === colIdx
                      }
                      onClick={handleCellClick}
                    />
                  )
                })}
            </tr>
          ))}
      </tbody>
    </table>
  )
}

export default SpreadSheet
