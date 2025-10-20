import { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  image: string;
  onSave: (editedImage: string) => void;
  onClose: () => void;
};

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ffa500",
  "#800080",
];

export const ImageEditor = ({ image, onSave, onClose }: Props) => {
  const backgroundRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const [activeTool, setActiveTool] = useState<"pen" | "eraser" | "text">("pen");
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [strokeColor, setStrokeColor] = useState<string>("#ff0000");
  const [fontSize, setFontSize] = useState<number>(24);
  const [showThickness, setShowThickness] = useState<boolean>(false);
  const [showColor, setShowColor] = useState<boolean>(false);
  const [showFont, setShowFont] = useState<boolean>(false);

  useEffect(() => {
    const bgCanvas = backgroundRef.current;
    const drawCanvas = drawingRef.current;
    if (!bgCanvas || !drawCanvas) return;

    const bgCtx = bgCanvas.getContext("2d");
    const drawCtx = drawCanvas.getContext("2d");
    if (!bgCtx || !drawCtx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      bgCanvas.width = img.width;
      bgCanvas.height = img.height;
      drawCanvas.width = img.width;
      drawCanvas.height = img.height;

      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgCtx.drawImage(img, 0, 0);
      setImgSize({ width: img.width, height: img.height });

      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.9;
      const scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      setScale(scaleFactor);
    };

    drawCtx.lineCap = "round";
    drawCtx.lineJoin = "round";
    drawCtx.globalCompositeOperation = "source-over";
    drawingCtxRef.current = drawCtx;
  }, [image]);

  useEffect(() => {
    const ctx = drawingCtxRef.current;
    if (!ctx) return;
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
  }, [strokeWidth, strokeColor]);

  const getMousePos = (e: React.MouseEvent) => {
    if (!drawingRef.current) return { x: 0, y: 0 };
    const rect = drawingRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    const ctx = drawingCtxRef.current;
    if (!ctx || !drawingRef.current) return;

    if (activeTool === "text") {
      const { x, y } = getMousePos(e);
      const text = window.prompt("Digite o texto:");
      if (text && text.trim() !== "") {
        const snap = ctx.getImageData(0, 0, drawingRef.current.width, drawingRef.current.height);
        setHistory((prev) => [...prev, snap]);
        setRedoStack([]);

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = strokeColor;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(text, x, y);
      }
      return;
    }

    setIsDrawing(true);
    const isErasing = activeTool === "eraser";
    ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = isErasing ? "rgba(0,0,0,1)" : strokeColor;

    ctx.beginPath();
    const { x, y } = getMousePos(e);
    ctx.moveTo(x, y);

    const snapshot = ctx.getImageData(0, 0, drawingRef.current.width, drawingRef.current.height);
    setHistory((prev) => [...prev, snapshot]);
    setRedoStack([]);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !drawingCtxRef.current) return;
    const ctx = drawingCtxRef.current;

    const isErasing = activeTool === "eraser";
    ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = isErasing ? "rgba(0,0,0,1)" : strokeColor;

    const { x, y } = getMousePos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!drawingCtxRef.current) return;
    setIsDrawing(false);
    drawingCtxRef.current.closePath();
    drawingCtxRef.current.globalCompositeOperation = "source-over";
  };

  const handleUndo = () => {
    if (!drawingRef.current || !drawingCtxRef.current || history.length === 0) return;
    const ctx = drawingCtxRef.current;
    const last = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    const snapshot = ctx.getImageData(0, 0, drawingRef.current.width, drawingRef.current.height);
    setRedoStack((prev) => [...prev, snapshot]);

    ctx.putImageData(last, 0, 0);
    setHistory(newHistory);
  };

  const handleRedo = () => {
    if (!drawingRef.current || !drawingCtxRef.current || redoStack.length === 0) return;
    const ctx = drawingCtxRef.current;
    const last = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    const snapshot = ctx.getImageData(0, 0, drawingRef.current.width, drawingRef.current.height);
    setHistory((prev) => [...prev, snapshot]);

    ctx.putImageData(last, 0, 0);
    setRedoStack(newRedo);
  };

  const handleSave = () => {
    if (!backgroundRef.current || !drawingRef.current) return;
    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = backgroundRef.current.width;
    mergedCanvas.height = backgroundRef.current.height;
    const mergedCtx = mergedCanvas.getContext("2d");
    if (!mergedCtx) return;

    mergedCtx.drawImage(backgroundRef.current, 0, 0);
    mergedCtx.drawImage(drawingRef.current, 0, 0);

    onSave(mergedCanvas.toDataURL("image/png"));
  };

  // 🧩 Portal com animação de fade-in / scale
  return createPortal(
    <AnimatePresence>
      <Overlay
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <EditorBox
          as={motion.div}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
        >
          <TopControls>
            <button className={activeTool === "pen" ? "active" : ""} onClick={() => setActiveTool("pen")} title="Lápis">✏️</button>
            <button className={activeTool === "eraser" ? "active" : ""} onClick={() => setActiveTool("eraser")} title="Borracha">⌫</button>
            <button className={activeTool === "text" ? "active" : ""} onClick={() => setActiveTool("text")} title="Texto">T</button>

            <ThicknessWrapper>
              <button onClick={() => setShowThickness((s) => !s)} title="Espessura">{strokeWidth}px</button>
              {showThickness && (
                <ThicknessPanel>
                  <label>Espessura: {strokeWidth}px</label>
                  <input type="range" min={1} max={200} step={1} value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} />
                </ThicknessPanel>
              )}
            </ThicknessWrapper>

            <ColorWrapper>
              <button onClick={() => setShowColor((s) => !s)} title="Cor">🎨<ColorPreview style={{ background: strokeColor }} /></button>
              {showColor && (
                <ColorPanel>
                  <label>Cores</label>
                  <div className="swatches">
                    {PRESET_COLORS.map((c) => (
                      <button key={c} onClick={() => { setStrokeColor(c); setShowColor(false); }} className={c === strokeColor ? "active" : ""} style={{ background: c }} />
                    ))}
                  </div>
                </ColorPanel>
              )}
            </ColorWrapper>

            <ThicknessWrapper>
              <button onClick={() => setShowFont((s) => !s)} title="Tamanho da fonte">{fontSize}px</button>
              {showFont && (
                <ThicknessPanel>
                  <label>Fonte: {fontSize}px</label>
                  <input type="range" min={10} max={100} step={1} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
                </ThicknessPanel>
              )}
            </ThicknessWrapper>

            <button onClick={handleRedo} title="Refazer">↩</button>
            <button onClick={handleUndo} title="Desfazer">↪</button>
          </TopControls>

          <CanvasWrapper style={{ width: `${imgSize.width * scale}px`, height: `${imgSize.height * scale}px` }}>
            <StyledCanvas ref={backgroundRef} style={{ transform: `scale(${scale})` }} />
            <StyledCanvas
              ref={drawingRef}
              style={{ transform: `scale(${scale})` }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </CanvasWrapper>

          <BotControls>
            <button onClick={handleSave}>Salvar</button>
            <button onClick={onClose}>Cancelar</button>
          </BotControls>
        </EditorBox>
      </Overlay>
    </AnimatePresence>,
    document.body
  );
};

/* ===================== ESTILOS ===================== */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999 !important;
  isolation: isolate;
`;

const EditorBox = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90vw;
  max-height: 90vh;
`;

const CanvasWrapper = styled.div`
  position: relative;
  overflow: hidden;
`;

const StyledCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
  transform-origin: top left;
`;

const TopControls = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 12px;
  button {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 6px 8px;
    position: relative;
  }
  button.active::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    height: 3px;
    width: 60%;
    background: #000;
    border-radius: 2px;
  }
`;

const ThicknessWrapper = styled.div`
  position: relative;
`;

const ThicknessPanel = styled.div`
  position: absolute;
  top: 36px;
  right: 0;
  width: 200px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 20;
`;

const ColorWrapper = styled.div`
  position: relative;
`;

const ColorPreview = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  margin-left: 6px;
  border: 1px solid #ccc;
`;

const ColorPanel = styled.div`
  position: absolute;
  top: 36px;
  right: 0;
  width: 220px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 20;
  .swatches {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .swatches button {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 2px solid transparent;
    cursor: pointer;
  }
  .swatches button.active {
    border-color: #222;
  }
`;

const BotControls = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  button {
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background: #007bff;
    color: white;
  }
  button:hover {
    background: #005fcc;
  }
`;
