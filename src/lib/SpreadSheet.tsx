import React, { useState } from "react"
import "./SpreadSheet.css"
import Cell from "./Cell"

export interface CellIndex {
  rowIdx: number
  colIdx: number
}

function SpreadSheet() {
  const [selectedCell, setSelectedCell] = useState<null | CellIndex>(null)
  const [isEditting, setIsEditting] = useState<boolean>(false)
  let numCol = 26
  let numRow = 50

  function handleCellClick(
    event: React.MouseEvent,
    rowIdx: number,
    colIdx: number
  ) {
    if (selectedCell?.rowIdx !== rowIdx || selectedCell?.colIdx !== colIdx) {
      setIsEditting(false)
    }
    setSelectedCell({
      rowIdx: rowIdx,
      colIdx: colIdx
    })

    // handle double click
    if (event.detail === 2) {
      setIsEditting(true)
    }
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
                      isEditting={isEditting}
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
