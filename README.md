# C23 · Multi-agent Orchestration and Delegation

Executes a local worker-admission and result collector. It does not launch native multiagent threads or external workers. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Bounded delegation
- Separate-session context is explicit
- Worker completion needs evidence

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3023`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3023
```

## How the app was build

### 1. Bound a delegated request

The subtask must contain text within the size cap, and the event budget must be an integer from 1 to 500. Admission is checked before accepting a worker report.

Source: [src/lesson.ts](src/lesson.ts#L13) · selected statements

```typescript
const prompt = text(input, "subtask").trim(),
  budget = number(input, "eventBudget");

if (
  !prompt ||
  prompt.length > 8000 ||
  !Number.isInteger(budget) ||
  budget < 1 ||
  budget > 500
)
  return report("rejected", "Subtask or event budget is invalid", {}, [
    "Bound delegated work before admission",
  ]);
```

### 2. Require both ordinary completion and an answer

Only end_turn with nonempty worker text is accepted. The evidence explicitly marks filesystem and history inheritance false; this sample evaluates a supplied report rather than launching a worker.

Source: [src/lesson.ts](src/lesson.ts#L15) · selected statements

```typescript
const ended = text(input, "stopReason") === "end_turn",
  answer = text(input, "workerText").trim();

return report(
  ended && answer ? "passed" : ended ? "incomplete" : "paused",
  "A worker report is accepted only after an ordinary completed turn",
  {
    accepted: !!(ended && answer),
    workerContext: {
      subtask: prompt,
      inheritedFilesystem: false,
      inheritedHistory: false,
    },
    answer,
  },
  [
    "Admit a bounded specialist task",
    "Provide explicit context",
    "Observe worker lifecycle",
    "Do not duplicate an uncertain worker",
  ],
);
```

### Check your understanding

Run **Accept a bounded worker result** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "subtask": "Summarize the reviewed interface",
    "eventBudget": 20,
    "stopReason": "end_turn",
    "workerText": "The interface has one evidence panel."
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "accepted": true
  }
}
```

Then try **Keep a paused worker incomplete**. Its expected outcome is `paused`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
