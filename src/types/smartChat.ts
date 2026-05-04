/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: trip_gen_mobile/mobile/src/types/smartChat.ts
 * Run `npm run sync:types` to refresh. CI fails on drift (`--check`).
 */

/**
 * Types for the Smart Chat "second brain" feature.
 */

export type SmartChatMessageType =
  | 'text'
  | 'action_request'
  | 'action_executed'
  | 'navigation'
  | 'tool_status'
  | 'interactive_question'
  // PR-3 clarification types. `interactive_question` remains for one release
  // so transcripts recorded with the legacy server are still renderable.
  | 'single_select_question'
  | 'multi_select_question'
  | 'confirm_question';

export interface ActionRequest {
  actionId: string;
  actionType: string;
  params: Record<string, any>;
  description: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'executed' | 'failed';
  result?: Record<string, any>;
}

export interface NavigationCommand {
  screen: string;
  params?: Record<string, any>;
  navigationId?: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface InteractiveQuestion {
  questionId: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  allowCustom: boolean;
  status: 'pending' | 'answered' | 'skipped';
  selectedAnswer?: string;
}

export interface SingleSelectQuestion {
  questionId: string;
  prompt: string;
  options: QuestionOption[];
  allowFreeText: boolean;
  status: 'pending' | 'answered' | 'skipped';
  selectedId?: string;
  selectedFreeText?: string;
}

export interface MultiSelectQuestion {
  questionId: string;
  prompt: string;
  options: QuestionOption[];
  min: number;
  max: number | null;
  allowFreeText: boolean;
  status: 'pending' | 'answered' | 'skipped';
  selectedIds?: string[];
  selectedFreeText?: string;
}

export interface ConfirmQuestion {
  questionId: string;
  prompt: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive: boolean;
  context?: Record<string, any>;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface SmartChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  messageType: SmartChatMessageType;
  /** Present when messageType === 'action_request' */
  actionRequest?: ActionRequest;
  /** Present when messageType === 'navigation' */
  navigation?: NavigationCommand;
  /** Tool name (for tool_status messages) */
  toolName?: string;
  /** Present when messageType === 'interactive_question' (legacy, one-release alias) */
  interactiveQuestion?: InteractiveQuestion;
  /** Present when messageType === 'single_select_question' */
  singleSelectQuestion?: SingleSelectQuestion;
  /** Present when messageType === 'multi_select_question' */
  multiSelectQuestion?: MultiSelectQuestion;
  /** Present when messageType === 'confirm_question' */
  confirmQuestion?: ConfirmQuestion;
  /** Server-assigned id for dedupe/idempotency */
  eventId?: string;
  /** Stream id for correlation */
  streamId?: string;
  /** Sequence number in a stream */
  seq?: number;
}

/** SSE event types from /api/smart-chat */
export type SmartChatSSEType =
  | 'chat_token'
  | 'tool_call'
  | 'tool_result'
  | 'action_request'
  | 'action_executed'
  | 'generation_progress'
  | 'navigation'
  | 'interactive_question'
  // PR-3
  | 'single_select_question'
  | 'multi_select_question'
  | 'confirm_question'
  | 'done'
  | 'error';

export interface SmartChatSSEEvent {
  type: SmartChatSSEType;
  stream_id?: string;
  seq?: number;
  event_id?: string;
  trace_id?: string;
  content?: string;
  tool?: string;
  call_id?: string;
  status?: string;
  // action_request fields
  action_id?: string;
  action_type?: string;
  params?: Record<string, any>;
  description?: string;
  // action_executed fields
  success?: boolean;
  message?: string;
  search_id?: string;
  error?: string;
  // generation_progress fields
  step?: string;
  // navigation fields
  navigation_id?: string;
  screen?: string;
  // interactive_question fields (legacy)
  question_id?: string;
  question?: string;
  options?: Array<{ id: string; label: string; description?: string; icon?: string }>;
  allow_custom?: boolean;
  // PR-3 multi-select fields
  min?: number;
  max?: number | null;
  allow_free_text?: boolean;
  // PR-3 confirm fields
  prompt?: string;
  confirm_label?: string;
  cancel_label?: string;
  destructive?: boolean;
  context?: Record<string, any>;
}
