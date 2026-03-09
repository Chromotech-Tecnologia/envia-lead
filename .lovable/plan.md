

## Plan: Fix Questions Being Wiped + Widget Not Showing Flow

### Root Cause Analysis

**Why questions disappear from the database:**

The `PositionSettings.tsx` component (and potentially others) uses an unsafe pattern to update state:
```js
// UNSAFE - captures stale flowData from closure
setFlowData({ ...flowData, button_position: position });
```
Instead of the safe functional updater:
```js
// SAFE - always uses latest state
setFlowData(prev => ({ ...prev, button_position: position }));
```

When `PositionSettings` updates (e.g., changing button position), it overwrites `flowData` with a stale snapshot that may not include `questions`. Then when the user saves, `saveFlowQuestions` deletes all existing questions and inserts `flowData.questions` which is now `undefined` or `[]` -- resulting in all questions being permanently deleted.

**Why the external widget doesn't show questions:**

The `envialead-widget` Edge Function queries the `questions` table for this flow and gets 0 results (confirmed by database query). This is a direct consequence of the questions being wiped. Once questions persist correctly, the widget will work.

### Fixes

#### 1. Fix stale closure in PositionSettings.tsx
Convert all 7 `setFlowData({ ...flowData, ... })` calls to use the functional updater pattern `setFlowData(prev => ({ ...prev, ... }))`.

#### 2. Fix saveFlowQuestions to preserve UUIDs
Currently the save does DELETE ALL + INSERT NEW, which:
- Loses the original UUIDs (important for lead history)
- Is destructive if state is corrupted

Change to: use UPSERT for existing questions (by UUID) and only delete questions whose IDs are no longer in the list. For new questions (created in the editor with numeric `Date.now()` IDs), insert normally and let Postgres generate UUIDs.

#### 3. Add safety check before deleting questions
In `saveFlowQuestions`, if the questions array is empty or undefined but the flow previously had questions, skip the delete to prevent accidental data loss. Only delete if the user explicitly removed all questions (which they confirmed is OK, but we should still log a warning).

#### 4. Fix FlowEditor.tsx useEffect overwrite
The `useEffect` in `FlowEditor.tsx` (line 24) calls `setFlowData(...)` every time `flow` or `isEditing` changes. If this runs AFTER the user has already modified questions in the editor, it overwrites their changes. Add a guard to only initialize once.

### Files to change

1. **`src/components/flow-editor/PositionSettings.tsx`** -- Convert all `setFlowData` calls to functional updater pattern
2. **`src/hooks/useFlowPersistence.ts`** -- Rewrite `saveFlowQuestions` to use smart upsert (preserve existing UUIDs, only delete removed questions)
3. **`src/components/FlowEditor.tsx`** -- Add guard to prevent `useEffect` from overwriting user edits
4. **`src/components/flow-editor/DesignSettings.tsx`** -- Check for same stale closure pattern (if present, fix)

### Expected outcome
- Questions persist correctly in the database across saves
- UUIDs are preserved between saves
- The external widget at teste.envialead.com.br will show the full question flow once questions are saved again
- No more accidental data loss when editing position/design settings

