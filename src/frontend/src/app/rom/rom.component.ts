import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxFilesizeModule} from 'ngx-filesize';
import {Rom} from '../services/rom.service';

@Component({
  selector: 'app-rom',
  imports: [CommonModule, NgxFilesizeModule],
  templateUrl: './rom.component.html',
  standalone: true,
  styleUrl: './rom.component.scss'
})
export class RomComponent {

  @Input() rom!: Rom;
  @Output() remove: EventEmitter<number> = new EventEmitter();
  @Output() retry: EventEmitter<number> = new EventEmitter();

  get isCompleted(): boolean {
    return (this.rom.totalBytes && this.rom.receivedBytes === this.rom.totalBytes) || false;
  }

  get percentage(): string {
    return (((this.rom.receivedBytes ?? 0) * 100) / (this.rom.totalBytes ?? 0)).toFixed(2)
  }

}
