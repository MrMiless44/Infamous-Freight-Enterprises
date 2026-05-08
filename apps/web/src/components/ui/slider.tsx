interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className = '' }: SliderProps) {
  return (
    <input
      type="range"
      value={value[0] ?? min}
      min={min}
      max={max}
      step={step}
      className={className}
      onChange={(e) => onValueChange([Number(e.target.value)])}
    />
  );
}
