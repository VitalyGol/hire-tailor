import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

const CHAT_HISTORY_STORAGE_KEY = 'ai-consultant-chat-history';

type ChatMessageRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  text: string;
  createdAt: string;
}

@Component({
  selector: 'app-ai-consultant',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './ai-consultant.component.html',
  styleUrl: './ai-consultant.component.scss',
})
export class AiConsultantComponent implements AfterViewInit {
  @ViewChild('messageHistory') private messageHistory?: ElementRef<HTMLElement>;

  protected readonly messageControl = new FormControl('', { nonNullable: true });
  protected readonly messages = signal<ChatMessage[]>(this.loadMessagesFromStorage());
  protected readonly isChatActive = signal(this.messages().length > 0);
  protected readonly hasMessages = computed(() => this.messages().length > 0);

  ngAfterViewInit(): void {
    if (this.isChatActive()) {
      this.scrollToLatestMessage();
    }
  }

  protected startConsultation(): void {
    this.isChatActive.set(true);
    this.scrollToLatestMessage();
  }

  protected sendMessage(): void {
    const text = this.messageControl.value.trim();

    if (!text) {
      return;
    }

    const message: ChatMessage = {
      id: this.createMessageId(),
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...this.messages(), message];
    this.messages.set(nextMessages);
    this.saveMessagesToStorage(nextMessages);
    this.messageControl.reset('');

    // TODO: Add backend assistant response integration here when the API is available.
    this.scrollToLatestMessage();
  }

  protected formatMessageTime(createdAt: string): string {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(createdAt));
  }

  private loadMessagesFromStorage(): ChatMessage[] {
    const storedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);

    if (!storedHistory) {
      return [];
    }

    try {
      const parsedHistory: unknown = JSON.parse(storedHistory);
      return this.isChatMessageArray(parsedHistory) ? parsedHistory : [];
    } catch (error) {
      console.error('Failed to parse AI consultant chat history:', error);
      return [];
    }
  }

  private saveMessagesToStorage(messages: readonly ChatMessage[]): void {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save AI consultant chat history:', error);
    }
  }

  private scrollToLatestMessage(): void {
    setTimeout(() => {
      const historyElement = this.messageHistory?.nativeElement;

      if (historyElement) {
        historyElement.scrollTop = historyElement.scrollHeight;
      }
    });
  }

  private createMessageId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `ai-consultant-message-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  }

  private isChatMessageArray(value: unknown): value is ChatMessage[] {
    return Array.isArray(value) && value.every(item => this.isChatMessage(item));
  }

  private isChatMessage(value: unknown): value is ChatMessage {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value['id'] === 'string' &&
      (value['role'] === 'user' || value['role'] === 'assistant') &&
      typeof value['text'] === 'string' &&
      typeof value['createdAt'] === 'string'
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
