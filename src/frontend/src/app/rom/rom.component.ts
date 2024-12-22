import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-rom',
  imports: [CommonModule],
  templateUrl: './rom.component.html',
  styleUrl: './rom.component.scss'
})
export class RomComponent {

  @Input() rom: any; // todo fix type
  @Output() remove: EventEmitter<number> = new EventEmitter();

  get isCompleted(): void {
    return this.rom.totalBytes && this.rom.receivedBytes === this.rom.totalBytes
  }

  get percentage(): string {
    return ((this.rom.receivedBytes * 100) / this.rom.totalBytes).toFixed(2)
  }

}
