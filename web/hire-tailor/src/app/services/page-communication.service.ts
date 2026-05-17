import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PageCommunicationMessage<T = unknown> {
  key: string;
  payload: T;
}

@Injectable({
  providedIn: 'root',
})
export class PageCommunicationService {
  private readonly messageSubject = new BehaviorSubject<PageCommunicationMessage | null>(null);

  readonly message$: Observable<PageCommunicationMessage | null> =
    this.messageSubject.asObservable();

  sendMessage<T>(key: string, payload: T): void {
    this.messageSubject.next({ key, payload });
  }

  getCurrentMessage(): PageCommunicationMessage | null {
    return this.messageSubject.value;
  }

  clearMessage(): void {
    this.messageSubject.next(null);
  }
}
