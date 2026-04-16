import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

interface DetectedBarcodeLike {
  rawValue?: string;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): {
    detect(source: ImageBitmapSource): Promise<DetectedBarcodeLike[]>;
  };
}

@Component({
  standalone: false,
  selector: 'app-qr-scanner-dialog',
  templateUrl: './qr-scanner-dialog.component.html',
  styleUrls: ['./qr-scanner-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrScannerDialogComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

  readonly scannerSupported = signal(true);
  readonly cameraReady = signal(false);
  readonly errorMessage = signal('');

  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private detector: { detect(source: ImageBitmapSource): Promise<DetectedBarcodeLike[]> } | null = null;
  private scanning = false;

  constructor(
    private readonly dialogRef: MatDialogRef<QrScannerDialogComponent, string | null>
  ) {}

  async ngOnInit(): Promise<void> {
    const detectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!detectorCtor) {
      this.scannerSupported.set(false);
      this.errorMessage.set('QR scanning is not supported in this browser.');
      return;
    }

    this.detector = new detectorCtor({ formats: ['qr_code'] });

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }
        },
        audio: false
      });

      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.cameraReady.set(true);
      this.startScanning();
    } catch (error) {
      this.errorMessage.set('Unable to access the camera. Please allow camera permission and try again.');
    }
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  close(): void {
    this.dialogRef.close(null);
  }

  private startScanning(): void {
    if (!this.detector || this.scanning) {
      return;
    }

    this.scanning = true;
    const scan = async () => {
      if (!this.scanning || !this.detector) {
        return;
      }

      const video = this.videoElement.nativeElement;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        try {
          const results = await this.detector.detect(video);
          const value = results?.[0]?.rawValue?.trim();
          if (value) {
            this.dialogRef.close(value);
            return;
          }
        } catch {
          this.errorMessage.set('Scanning failed. Please try again.');
        }
      }

      this.rafId = window.requestAnimationFrame(scan);
    };

    this.rafId = window.requestAnimationFrame(scan);
  }

  private stopScanner(): void {
    this.scanning = false;
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}
