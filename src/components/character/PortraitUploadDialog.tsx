import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (blob: Blob) => void;
  saving?: boolean;
}

const OUTPUT_SIZE = 400; // px, square

export function PortraitUploadDialog({ open, onClose, onSave, saving }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setImageSrc(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImgSize({ w: 0, h: 0 });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Load image dimensions
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      // Fit image so shortest side fills the preview
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      const initialZoom = OUTPUT_SIZE / minDim;
      setZoom(initialZoom);
      // Center
      setPan({
        x: (OUTPUT_SIZE - img.naturalWidth * initialZoom) / 2,
        y: (OUTPUT_SIZE - img.naturalHeight * initialZoom) / 2,
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw preview
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    ctx.drawImage(img, pan.x, pan.y, img.naturalWidth * zoom, img.naturalHeight * zoom);
  }, [pan, zoom]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse/touch drag
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onPointerUp = () => setDragging(false);

  // Zoom with slider
  const minZoom = imgSize.w > 0 ? OUTPUT_SIZE / Math.max(imgSize.w, imgSize.h) : 0.1;
  const maxZoom = imgSize.w > 0 ? (OUTPUT_SIZE / Math.min(imgSize.w, imgSize.h)) * 3 : 5;

  const handleZoomChange = (vals: number[]) => {
    const newZoom = vals[0];
    // Zoom toward center
    const cx = OUTPUT_SIZE / 2;
    const cy = OUTPUT_SIZE / 2;
    const ratio = newZoom / zoom;
    setPan({
      x: cx - (cx - pan.x) * ratio,
      y: cy - (cy - pan.y) * ratio,
    });
    setZoom(newZoom);
  };

  const handleSave = () => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx || !imgRef.current) return;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(
      imgRef.current,
      pan.x,
      pan.y,
      imgRef.current.naturalWidth * zoom,
      imgRef.current.naturalHeight * zoom
    );

    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    }, "image/webp", 0.85);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider">CHARACTER PORTRAIT</DialogTitle>
        </DialogHeader>

        {!imageSrc ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" /> Choose Image
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG, or WebP</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative border border-border rounded-md overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ width: 280, height: 280 }}
            >
              <canvas
                ref={canvasRef}
                width={OUTPUT_SIZE}
                height={OUTPUT_SIZE}
                className="w-full h-full"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{ touchAction: "none" }}
              />
            </div>

            <div className="flex items-center gap-2 w-full max-w-[280px]">
              <ZoomOut className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Slider
                min={minZoom}
                max={maxZoom}
                step={0.01}
                value={[zoom]}
                onValueChange={handleZoomChange}
                className="flex-1"
              />
              <ZoomIn className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>

            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => { reset(); fileRef.current?.click(); }}>
                Change Image
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Portrait"}
              </Button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
