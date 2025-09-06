import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Hex, type HexData } from "./Hex";

interface State {
  hexes: HexData[];
}

const blankHex: HexData = {
  edgeLabels: ["", "", "", "", "", ""],
  centerLabel: "",
};

function App() {
  const [state, setState, removeState] = useLocalStorage<State>(
    "icfp2025--state",
    {
      hexes: [],
    },
  );

  return (
    <>
      <button
        onClick={() => {
          setState({ ...state, hexes: [...state.hexes, blankHex] });
        }}
      >
        Add Hex
      </button>
      {state.hexes.map((hex, index) => (
        <Hex
          key={index}
          data={hex}
          onChange={(newHex) => {
            const newHexes = [...state.hexes];
            newHexes[index] = newHex;
            setState({ ...state, hexes: newHexes });
          }}
          onRemove={() => {
            const newHexes = state.hexes.filter((_, i) => i !== index);
            setState({ ...state, hexes: newHexes });
          }}
        ></Hex>
      ))}
      {/* <button */}
      {/* // <Hex data={blankHex} onChange={() => {}}></Hex> */}
    </>
  );
}

export default App;
