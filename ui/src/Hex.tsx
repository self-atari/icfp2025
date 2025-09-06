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
    const newEdgeLabels = [...data.edgeLabels];
    newEdgeLabels[index] = value;
    onChange({ ...data, edgeLabels: newEdgeLabels as EdgeLabels });
  }

  function handleCenterLabelChange(value: string) {
    onChange({ ...data, centerLabel: value });
  }

  return (
    <div className="hex">
      <button className="remove" onClick={onRemove}>-</button>
      <div className="top-row">
        <input value={data.edgeLabels[0]} onChange={e => handleEdgeLabelChange(0, e.target.value)} />
        <input value={data.edgeLabels[1]} onChange={e => handleEdgeLabelChange(1, e.target.value)} />
      </div>
      <div className="middle-row">
        <input value={data.edgeLabels[5]} onChange={e => handleEdgeLabelChange(5, e.target.value)} />
        <div className="overlap-container">
          <div className="hex-image"></div>
          <div className="hex-label-container">
            <input className="hex-label" value={data.centerLabel} onChange={e => handleCenterLabelChange(e.target.value)} />
          </div>
        </div>
        <input value={data.edgeLabels[2]} onChange={e => handleEdgeLabelChange(2, e.target.value)} />
      </div>
      <div className="bottom-row">
        <input value={data.edgeLabels[4]} onChange={e => handleEdgeLabelChange(4, e.target.value)} />
        <input value={data.edgeLabels[3]} onChange={e => handleEdgeLabelChange(3, e.target.value)} />
      </div>
    </div>
  );
}
