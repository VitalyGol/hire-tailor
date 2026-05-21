import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ConsultantAiService } from '../../services/consultant-ai-service';
import { ChatMessage } from '../../models/consultatnt-ai/chat-message.model';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-ai-consultant',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MarkdownModule
  ],
  templateUrl: './ai-consultant.component.html',
  styleUrl: './ai-consultant.component.scss',
})
export class AiConsultantComponent implements AfterViewInit {
  @ViewChild('messageHistory') private messageHistory?: ElementRef<HTMLElement>;

  private readonly consultantService = inject(ConsultantAiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private tailoringRequestId!: string;

  protected readonly messageControl = new FormControl('', { nonNullable: true });
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly isChatActive = signal(this.messages().length > 0);
  protected readonly hasMessages = computed(() => this.messages().length > 0);

  constructor() {
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(id => {
        if (!id) {
          return;
        }
        this.tailoringRequestId = id;
      });
  }

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

    if (!text || !this.tailoringRequestId) {
      return;
    }
    this.consultantService.askConsultant(text, this.tailoringRequestId).pipe(
      tap(() => this.messageControl.reset()),
      switchMap(() => this.consultantService.getChatHistory())
    )
    .subscribe(history => {
        this.messages.set(history);
        this.isChatActive.set(history.length > 0);
        this.scrollToLatestMessage();
    });
    return;
    
  }

  protected formatMessageTime(createdAt: string): string {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(createdAt));
  }

  private scrollToLatestMessage(): void {
    setTimeout(() => {
      const historyElement = this.messageHistory?.nativeElement;

      if (historyElement) {
        historyElement.scrollTop = historyElement.scrollHeight;
      }
    });
  }
}
