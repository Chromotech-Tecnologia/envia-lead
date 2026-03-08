

## Plan: Fix Navigation + Widget Flow Issues

### Issue 1: Back buttons don't work

**Root cause**: Both the flow list and editor render at `/flows` (FlowManager uses state `isEditorOpen` to toggle views). The back buttons use `navigate('/flows')` which does nothing since we're already at `/flows`. They need to call the `onExit` callback instead.

**Fixes:**

- **FlowEditorHeader**: Add `onExit` prop, call it instead of `navigate('/flows')`
- **FlowEditorFooter**: Call the existing `onGoBack` prop instead of the local `navigate('/flows')`
- **FlowEditor**: Pass `onExit` to FlowEditorHeader

### Issue 2: Widget doesn't show questions when bot_messages with variables exist

**Root cause (multiple):**
1. `replaceVariables` in the widget creates `new RegExp(variable)` without escaping special regex characters — if a variable name or the `#` symbol is followed by special chars, it can throw and halt the entire flow chain
2. When user closes and reopens the chat, the DOM is destroyed (`chatModal = null`) but `conversationStarted` stays `true`, so the chat shows blank — no messages, no questions
3. No error handling in `processNextItem` — any error silently kills the entire flow chain

**Fixes in `supabase/functions/envialead-widget/index.ts`:**
- Add regex escaping in `replaceVariables` to prevent crashes
- Add `try/catch` around `processNextItem` to prevent silent failures
- Fix `closeChatModal` to preserve conversation state and restore messages on reopen (or reset properly)
- Add console logging for debugging flow progression

**Fixes in `src/hooks/useChatLogic.ts`:**
- Same regex escaping fix in `replaceVariables`

### Files to change
1. `src/components/flow-editor/FlowEditorHeader.tsx` — add `onExit` prop, use it
2. `src/components/flow-editor/FlowEditorFooter.tsx` — use `onGoBack` prop
3. `src/components/FlowEditor.tsx` — pass `onExit` to header
4. `supabase/functions/envialead-widget/index.ts` — fix replaceVariables, processNextItem error handling, closeChatModal state
5. `src/hooks/useChatLogic.ts` — fix replaceVariables regex escaping

