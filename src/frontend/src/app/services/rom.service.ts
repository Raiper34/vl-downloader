import { Injectable } from '@angular/core';
import {createStore} from '@ngneat/elf';
import {deleteEntities, selectAllEntities, upsertEntities, withEntities} from '@ngneat/elf-entities';
import {HttpClient} from '@angular/common/http';
import {Socket} from 'ngx-socket-io';
import {tap} from 'rxjs';

type Rom = any;

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
    withEntities<Rom>(), // todo type
  );

  all$ = this.store.pipe(selectAllEntities());

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

  private initWsConnection(): void {
    this.socket.on(WsOperation.Update, (rom: Rom) => this.store.update(upsertEntities(rom)));
    this.socket.on(WsOperation.Delete, ({id}: {id: number}) => this.store.update(deleteEntities(Number(id))));
    this.socket.on(WsOperation.New, (playlist: Rom) => this.store.update(upsertEntities(playlist),));
  }
}
