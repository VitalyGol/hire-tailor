import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChatMessage } from '../models/consultatnt-ai/chat-message.model';
import { Observable, of, tap } from 'rxjs';
import { TailoringStorageService } from './tailoring-storage.service';

const CHAT_HISTORY_STORAGE_KEY = 'ai-consultant-chat-history';

interface ConsultantAiResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultantAiService {
  private readonly httpClient = inject(HttpClient);
  private readonly tailoringService = inject(TailoringStorageService);
  private readonly consultantUrl = `${environment.apiUrl}/consultant/ask`;
  private historyChat: ChatMessage[] = [];

  startChatSession(): void {
    this.historyChat = [];
  }

  getChatHistory(): Observable<ChatMessage[]> {
    return of(this.historyChat);
  }

  askConsultant(
    question: string,
    tailoringRequestId: string,
  ): Observable<ConsultantAiResponse | undefined> {
    const offer = this.tailoringService.findEmployerById(tailoringRequestId);
    if (!offer) {
      return of(undefined);
    }
    if (!offer.userProfile) {
      offer.userProfile = this.tailoringService.getUserProfile() || undefined;

      if (!offer.userProfile) {
        return of(undefined);
      }
    }

    this.historyChat.push({
      role: 'user',
      text: question,
      createdAt: new Date().toISOString(),
    });
    return this.httpClient
      .post<ConsultantAiResponse>(this.consultantUrl, {
        resume: offer.userProfile,
        job_requirement: offer.jobRequirements,
        chat_history: this.historyChat,
      })
      .pipe(
        tap(response => {
          this.historyChat.push({
            role: 'assistant',
            text: response.answer,
            createdAt: new Date().toISOString(),
          });
        }),
      );
  }

  private loadMessagesFromStorage(): ChatMessage[] {
    const storedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);

    if (!storedHistory) {
      return [];
    }

    try {
      return JSON.parse(storedHistory);
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
}
