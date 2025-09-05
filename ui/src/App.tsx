import { useState } from "react";

function Hex() {
  return (
    <div className="hex">
      <div className="top-row">
        <input value={0} />
        <input value={1} />
      </div>
      <div className="middle-row">
        <input value={5} />
        <div className="hex-image"></div>
        <input value={2} />
      </div>
      <div className="bottom-row">
        <input value={4} />
        <input value={3} />
      </div>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Hex></Hex>
      {/* <Hex></Hex> */}
    </>
  );
}

export default App;
