type EdgeLabels = [string, string, string, string, string, string];

export interface HexData {
  edgeLabels: EdgeLabels;
  centerLabel: string;
}

interface HexProps {
  data: HexData;
  onChange: (data: HexData) => void;
  onRemove?: () => void;
}

export function Hex({ data, onChange, onRemove }: HexProps) {
  function handleEdgeLabelChange(index: number, value: string) {
    value = value.trim();
    const newEdgeLabels = [...data.edgeLabels];
    newEdgeLabels[index] = value;
    onChange({ ...data, edgeLabels: newEdgeLabels as EdgeLabels });
  }

  function handleCenterLabelChange(value: string) {
    value = value.trim();
    onChange({ ...data, centerLabel: value });
  }

  return (
    <div className="hex">
      <button className="remove" onClick={onRemove}>
        -
      </button>
      <div className="top-row">
        <EdgeInput
          index={0}
          value={data.edgeLabels[0]}
          onChange={(value) => handleEdgeLabelChange(0, value)}
        />
        <EdgeInput
          index={1}
          value={data.edgeLabels[1]}
          onChange={(value) => handleEdgeLabelChange(1, value)}
        />
      </div>
      <div className="middle-row">
        <EdgeInput
          index={5}
          value={data.edgeLabels[5]}
          onChange={(value) => handleEdgeLabelChange(5, value)}
        />
        <div className="overlap-container">
          <div className="hex-image"></div>
          <div className="hex-label-container">
            <input
              className="hex-label"
              value={data.centerLabel}
              onChange={(e) => handleCenterLabelChange(e.target.value)}
            />
          </div>
        </div>
        <EdgeInput
          index={2}
          value={data.edgeLabels[2]}
          onChange={(value) => handleEdgeLabelChange(2, value)}
        />
      </div>
      <div className="bottom-row">
        <EdgeInput
          index={4}
          value={data.edgeLabels[4]}
          onChange={(value) => handleEdgeLabelChange(4, value)}
        />
        <EdgeInput
          index={3}
          value={data.edgeLabels[3]}
          onChange={(value) => handleEdgeLabelChange(3, value)}
        />
      </div>
    </div>
  );
}

interface EdgeInputProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
}

function EdgeInput({ index, value, onChange }: EdgeInputProps) {
  const indexClass = `edge-input-container-${index}`;
  return (
    <div className={`edge-input-container ${indexClass}`}>
      <input
        placeholder={index + ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={() => onChange("")}>-</button>
    </div>
  );
}
