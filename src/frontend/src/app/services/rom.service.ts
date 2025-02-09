import { Injectable } from '@angular/core';
import {createStore} from '@ngneat/elf';
import {
  deleteEntities,
  selectAllEntities,
  selectManyByPredicate,
  upsertEntities,
  withEntities
} from '@ngneat/elf-entities';
import {HttpClient} from '@angular/common/http';
import {Socket} from 'ngx-socket-io';
import {tap} from 'rxjs';

export enum TrackStatusEnum {
  Queued,
  Downloading,
  Completed,
  Error,
}

export interface Rom {
  id: number;
  url: string;
  status: TrackStatusEnum,
  totalBytes?: number;
  receivedBytes?: number;
  name?: string;
  fileName?: string;
  error?: string;
}

const STORE_NAME = 'rom';
const ENDPOINT = '/api/rom';
enum WsOperation {
  New = 'new',
  Update = 'update',
  Delete = 'delete',
}

@Injectable({
  providedIn: 'root'
})
export class RomService {

  private store = createStore(
    { name: STORE_NAME },
    withEntities<Rom>(),
  );

  all$ = this.store.pipe(selectAllEntities());
  finished$ = this.store.pipe(selectManyByPredicate(rom => rom.receivedBytes !== 0 && rom.receivedBytes === rom.totalBytes));

  constructor(
    private readonly http: HttpClient,
    private readonly socket: Socket,
    ) {
    this.initWsConnection();
  }

  fetch(): void {
    this.http.get<Rom[]>(ENDPOINT).pipe(
      tap((data: Rom[]) => this.store.update(upsertEntities(data))),
    ).subscribe();
  }

  processUrl(url: string): void {
    this.http.post(ENDPOINT, {url}).subscribe();
  }

  delete(id: number): void {
    this.http.delete(`${ENDPOINT}/${id}`).subscribe();
  }

  retry(id: number): void {
    this.http.get(`${ENDPOINT}/retry/${id}`).subscribe();
  }

  deleteCompleted(): void {
    this.finished$.pipe(tap(finished => finished.forEach(item => this.delete(item.id)))).subscribe();
  }

  private initWsConnection(): void {
    this.socket.on(WsOperation.Update, (rom: Rom) => this.store.update(upsertEntities(rom)));
    this.socket.on(WsOperation.Delete, ({id}: {id: number}) => this.store.update(deleteEntities(Number(id))));
    this.socket.on(WsOperation.New, (playlist: Rom) => this.store.update(upsertEntities(playlist),));
  }
}
