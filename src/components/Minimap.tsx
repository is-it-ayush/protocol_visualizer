export function Minimap({ onSeek }: { onSeek: (t: number) => void }) {
  return <svg width={200} height={20} onClick={() => onSeek(0)} />;
}