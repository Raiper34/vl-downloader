import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Rom, RomService} from './services/rom.service';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {CommonModule, NgFor} from '@angular/common';
import {RomComponent} from './rom/rom.component';

const REGEXP_URL = /^https:\/\/vimm\.net\/vault\/\d+$/;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule, RomComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {

  form = new FormControl('', {validators: [Validators.required, Validators.pattern(REGEXP_URL)]});
  all$: Observable<Rom[]>;

  constructor(private romService: RomService) {
    this.romService.fetch();
    this.all$ = this.romService.all$;
  }

  processUrl(): void {
    this.romService.processUrl(this.form.value!);
    this.form.reset();
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
