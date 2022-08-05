# React Sheet

## Installation

Run the following command:

```bash
npm install react-simple-spreadsheet
```

## Usage

```js
import React, { useState } from "react"
import SpreadSheet from "react-simple-spreadsheet"
import "./App.css"

function App() {
  const [data, setData] = useState([
    [{ value: 1 }, { value: 2 }],
    [{ value: 2 }, { value: 4 }]
  ])
  return (
    <div className="Container">
      <SpreadSheet data={data} onChange={setData} />
    </div>
  )
}

export default App
```
