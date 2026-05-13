import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import jsQR from 'jsqr';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';

interface DetectedBarcodeLike {
  rawValue?: string;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): {
    detect(source: ImageBitmapSource): Promise<DetectedBarcodeLike[]>;
  };
}

/** Cap frame size for jsQR so older phones stay responsive. */
const JSQR_MAX_DIMENSION = 960;

@Component({
  selector: 'app-qr-scanner-dialog',
  templateUrl: './qr-scanner-dialog.component.html',
  styleUrls: ['./qr-scanner-dialog.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule, IconButtonComponent, ...TOOLTIP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrScannerDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject<MatDialogRef<QrScannerDialogComponent, string | null>>(MatDialogRef);

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

  readonly cameraReady = signal(false);
  readonly errorMessage = signal('');

  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private detector: { detect(source: ImageBitmapSource): Promise<DetectedBarcodeLike[]> } | null = null;
  private scanning = false;
  private useNativeBarcode = false;
  private jsQrCanvas: HTMLCanvasElement | null = null;
  private jsQrCtx: CanvasRenderingContext2D | null = null;

  async ngOnInit(): Promise<void> {
    const detectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    this.useNativeBarcode = typeof detectorCtor === 'function';
    if (this.useNativeBarcode && detectorCtor) {
      this.detector = new detectorCtor({ formats: ['qr_code'] });
    }

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

      if (this.useNativeBarcode) {
        this.startScanningNative();
      } else {
        this.ensureJsQrCanvas();
        this.startScanningJsQr();
      }
    } catch {
      this.errorMessage.set('Unable to access the camera. Please allow camera permission and try again.');
    }
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  close(): void {
    this.dialogRef.close(null);
  }

  private ensureJsQrCanvas(): void {
    if (this.jsQrCanvas) {
      return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.jsQrCanvas = canvas;
    this.jsQrCtx = ctx;
  }

  private startScanningNative(): void {
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

  private startScanningJsQr(): void {
    if (this.scanning) {
      return;
    }

    this.scanning = true;
    const scan = () => {
      if (!this.scanning || !this.jsQrCanvas || !this.jsQrCtx) {
        return;
      }

      const video = this.videoElement.nativeElement;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        let w = video.videoWidth;
        let h = video.videoHeight;
        if (w > 0 && h > 0) {
          if (w > JSQR_MAX_DIMENSION || h > JSQR_MAX_DIMENSION) {
            const scale = JSQR_MAX_DIMENSION / Math.max(w, h);
            w = Math.floor(w * scale);
            h = Math.floor(h * scale);
          }
          this.jsQrCanvas.width = w;
          this.jsQrCanvas.height = h;
          this.jsQrCtx.drawImage(video, 0, 0, w, h);
          try {
            const imageData = this.jsQrCtx.getImageData(0, 0, w, h);
            const result = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            const value = result?.data?.trim();
            if (value) {
              this.dialogRef.close(value);
              return;
            }
          } catch {
            this.errorMessage.set('Scanning failed. Please try again.');
          }
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
