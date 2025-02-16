import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Rom, RomService} from './services/rom.service';
import {FormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {CommonModule, NgFor} from '@angular/common';
import {RomComponent} from './rom/rom.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, RomComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  url = '';
  all$: Observable<Rom[]>;

  constructor(private romService: RomService) {
    this.romService.fetch();
    this.all$ = this.romService.all$;
  }

  processUrl(): void {
    this.romService.processUrl(this.url);
    this.url = '';
  }

  remove(id: number): void {
    this.romService.delete(id);
  }

  retry(id: number): void {
    this.romService.retry(id);
  }

  trackByFn(_: number, item: Rom): number {
    return item.id;
  }

  deleteCompleted(): void {
    this.romService.deleteCompleted();
  }

  deleteFailed(): void {
    this.romService.deleteFailed();
  }
}
