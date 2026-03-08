

## Problem Analysis

The message flow logic in both the internal preview (`useChatLogic.ts`) and external widget (`envialead-widget/index.ts`) uses a fragile approach: it separates questions from bot_messages into two arrays, then tries to cross-reference them by `order` values to find bot_messages between questions. This breaks with certain combinations (e.g., bot_message at the start, multiple bot_messages in a row, bot_message after the last question).

### Root Cause

The current approach maintains two separate tracking systems:
- `allItems` (everything sorted by order)
- `allQuestions` (only non-bot_message items)
- `currentQuestionIndex` indexes into `allQuestions`
- Bot messages are found by filtering `allItems` by order ranges between questions

This cross-referencing logic fails when:
1. A bot_message comes before the first question
2. Multiple bot_messages are consecutive
3. A bot_message comes after the last question
4. Order values have gaps or overlap

### Solution: Sequential Processing

Replace the dual-array approach with a single sequential flow through `allItems`:
- Track `currentItemIndex` into the unified `allItems` array
- If current item is `bot_message` → show it with typing indicator, auto-advance to next item
- If current item is a question → show it, wait for user input, then advance
- When all items are processed → show completion

### Files to Change

**1. `src/hooks/useChatLogic.ts`** — Refactor to use sequential `currentItemIndex`:
- Remove separate `questions`/`botMessages` arrays and `currentQuestionIndex`
- Add `currentItemIndex` state
- New `processNextItem()` function that handles both types sequentially
- `handleSendAnswer` advances `currentItemIndex` and calls `processNextItem`
- Keep `allQuestions` only for `replaceVariables` (variable mapping needs question-only list)
- Export `currentQuestion` as the current item if it's a question type

**2. `supabase/functions/envialead-widget/index.ts`** — Same refactor for the widget JS:
- Replace `currentQuestionIndex` with `currentItemIndex`
- Simplify `processNextItem()` to iterate `allItems` sequentially
- Remove `showBotMessagesSequence` (no longer needed)
- When item is `bot_message`: show typing → show message → auto-call `processNextItem` for next item
- When item is question: show typing → show question → create input → wait
- When done: show completion

**3. Deploy edge function** after changes.

### Key Logic (both files)

```text
processNextItem():
  if currentItemIndex >= allItems.length → showCompletion
  item = allItems[currentItemIndex]
  if item.type === 'bot_message':
    showTyping → addBotMessage(item.title) → currentItemIndex++ → processNextItem()
  else:
    showTyping → addBotMessage(item.title) → waitForInput → createInput(item)

handleAnswer(id, answer):
  save response → addUserMessage → currentItemIndex++ → processNextItem()
```

This eliminates all order-range filtering and ensures every item is processed in sequence regardless of type combinations.

