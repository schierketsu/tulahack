import React, { useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { askSocialAssistant, SocialChatMessage } from "../../utils/aiSocialAssistant";
import { SocialObject } from "../../types";

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRegion?: string;
  relatedObjects?: SocialObject[];
  childAge?: string;
  pregnancyWeek?: string;
  familyStatus?: string;
  familyIncome?: string;
}

export function ChatAssistant({
  isOpen,
  onClose,
  defaultRegion = "Тульская область",
  relatedObjects = [],
  childAge = "",
  pregnancyWeek = "",
  familyStatus = "",
  familyIncome = "",
}: ChatAssistantProps) {
  const region = defaultRegion;
  const [messages, setMessages] = useState<SocialChatMessage[]>([
    {
      role: "assistant",
      content:
        "Привет! Я помогу по мерам поддержки, социальным вопросам и подбору подходящих социальных объектов. Укажите регион, возраст ребёнка и срок беременности (если актуально), либо задайте вопрос по социальной теме или объектам — подскажу, что доступно и как действовать. Если нужно, уточню детали.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isReadyToSend = draft.trim().length > 0 && !isSending;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", onEsc);
    }
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;

    const userMessage: SocialChatMessage = {
      role: "user",
      content: text,
    };

    setDraft("");
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    const reply = await askSocialAssistant([...messages, userMessage], {
      region,
      childAge,
      pregnancyWeek,
      relatedObjects,
      familyStatus,
      familyIncome,
    });

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setIsSending(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && isReadyToSend) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="chat-overlay" role="dialog" aria-modal="true">
      <div className="chat-panel">
        <div className="chat-header">
          <div className="chat-header-left">
            <img src="/gigachat.svg" alt="GigaChat" className="chat-header-icon" />
            <div>
              <div className="chat-header-title">Гигачат</div>
              <div className="chat-header-subtitle">Ваш социальный помощник</div>
            </div>
          </div>
          <button type="button" className="chat-close" onClick={onClose} aria-label="Закрыть чат">
            ✕
          </button>
        </div>

        <div className="chat-body" ref={scrollRef}>
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`chat-message ${message.role === "user" ? "user" : "assistant"}`}
            >
              {message.content}
            </div>
          ))}
          {isSending && <div className="chat-typing">Гигачат думает…</div>}
        </div>

        <div className="chat-input-area">
          <div className="chat-hint">
            Пример: Кто может получить выплату 1 млн ₽ при рождении ребёнка до 25 лет в Тульской области?
          </div>
          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Сформулируйте вопрос — укажите какая у вас ситуация."
              rows={3}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!isReadyToSend}
              className="chat-send-inside"
              aria-label="Спросить Гигачат"
            >
              <SendIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


