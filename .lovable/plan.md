

## Analysis: Chat Preview vs External Widget Discrepancies

After reviewing all chat implementations, I found significant differences between the in-system preview (React components) and the external widget (edge function JavaScript). Here are the key issues and the plan to fix them.

### Issues Found

**Missing data in edge function flowData:**
- `attendant_name` not passed (hardcoded as "Atendimento")
- `button_avatar_url` not passed (widget uses `avatar_url` for button instead)
- `final_message_custom` / `final_message` not passed
- `headerText` color not used in flowData

**Behavioral differences:**
- External widget has NO typing indicator before questions (shows immediately)
- External widget has NO welcome bubble on initial load
- External widget doesn't handle `bot_message` type questions (shows them as regular questions)
- External widget doesn't show `single`/`radio` type options correctly (maps to `select`)

**Visual differences:**
- Button: preview uses gradient background, widget uses solid primary color
- User messages: preview uses gradient, widget uses solid primary
- Header name hardcoded in widget instead of using configured name
- No `headerText` color applied in widget header

### Implementation Plan

**1. Update edge function `flowData` object** (in `supabase/functions/envialead-widget/index.ts`)
- Add `attendant_name`, `button_avatar_url`, `final_message_custom`, `final_message` to the flowData
- Ensure `colors.headerText` is passed through

**2. Fix the widget JS in the edge function:**

- **Button rendering**: Use `button_avatar_url` (not `avatar_url`) for the floating button, match gradient background from preview
- **Header**: Use `flowData.attendant_name` instead of hardcoded "Atendimento", apply `headerText` color
- **Typing indicator**: Add typing dots animation before each question (1500ms delay matching preview)
- **Welcome bubble**: Add welcome bubble that shows before chat is opened, matching `WelcomeBubble.tsx` behavior
- **Bot messages**: Handle `bot_message` type - show as bot message without waiting for input, then continue to next item
- **Question types**: Handle `single` type as clickable option buttons (matching preview), `radio` as radio buttons
- **User messages**: Use gradient background matching preview (`linear-gradient(45deg, primary, secondary)`)
- **Completion message**: Use `final_message_custom || final_message` instead of hardcoded text
- **WhatsApp button**: Use `replaceVariables` function for the WhatsApp message template

**3. Clean up unused widget files**
- The files `public/js/envialead-chat.js`, `envialead-widget.js`, `envialead-main.js`, `envialead-utils.js`, `envialead-api.js` appear to be legacy/duplicate implementations that are not used by the integration code. The actual widget is served by the edge function. These can be left as-is since the integration code points to the edge function.

### Technical Details

The edge function generates inline JavaScript. Changes involve:
- Lines 154-189: Add missing fields to `flowData` object
- Lines 270-350: Update button creation to use `button_avatar_url` and gradient
- Lines 395-510: Update header to use `attendant_name` and `headerText` color
- Lines 534-560: Add welcome bubble creation
- Lines 562-593: Add typing indicator before questions with 1500ms delay
- Lines 788-813: Fix user message gradient styling
- Lines 816-917: Use configured final message and fix WhatsApp template

All changes are in `supabase/functions/envialead-widget/index.ts` - a single file update that will make the external widget match the in-system preview exactly.

