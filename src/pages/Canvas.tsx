import './Canvas.less';
import { useEffect, useRef } from "react";
import { Game } from "../core/Game";

export function Canvas({ ...prop }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const game = new Game(canvasRef.current!);
    return () => game.destroy();
  }, [])

  return (
    <aside className="webgl-wrapper">
      <canvas ref={canvasRef} className="webgl-canvas" width={"10px"} style={{ width: "10px" }} {...prop}>No Canvas!</canvas>
    </aside>
  )
}
