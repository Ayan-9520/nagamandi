import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/forms/TextField'

type Detector = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> }

export function QrCapture({ onCode }: { onCode: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [manual, setManual] = useState('')
  const [note, setNote] = useState('Type a demonstration code. The camera is used only when this browser can scan a QR code.')
  const [live, setLive] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    return () => {
      const stream = video?.srcObject
      if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  async function start() {
    const BarcodeDetector = (window as Window & { BarcodeDetector?: new (options: { formats: string[] }) => Detector }).BarcodeDetector
    if (!BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
      setNote('QR scanning is not supported in this browser. The camera was not opened. Type the demonstration code.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setLive(true)
      const detector = new BarcodeDetector({ formats: ['qr_code'] })
      const tick = async () => {
        if (!videoRef.current?.srcObject) return
        const marks = await detector.detect(video).catch(() => [])
        const value = marks[0]?.rawValue
        if (value) {
          onCode(value)
          stream.getTracks().forEach((track) => track.stop())
          setLive(false)
          setNote('A demonstration code was read.')
          return
        }
        window.setTimeout(tick, 400)
      }
      window.setTimeout(tick, 400)
    } catch {
      setNote('The camera could not be opened. Type the demonstration code instead.')
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{note}</p>
      <video ref={videoRef} className={live ? 'aspect-video w-full rounded-lg bg-black' : 'hidden'} muted playsInline />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={start}>Scan QR</Button>
        <Button type="button" className="w-full sm:w-auto" onClick={() => manual.trim() && onCode(manual.trim())}>Use typed code</Button>
      </div>
      <TextField label="Demonstration code" value={manual} onChange={(event) => setManual(event.target.value)} hint="Example: DEMO|NAGA-MANDI|DEMO-LOT-…|not-a-gate-pass" />
    </div>
  )
}
