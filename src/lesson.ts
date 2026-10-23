import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 23,
  title: "Multi-agent Orchestration and Delegation",
  description: "Some tasks benefit from focused specialists: one agent coordinates the work, while another handles a bounded review or analysis. The attached lesson teaches a host-managed pattern in which a custom tool asks your application to run a separate worker session.",
  concepts: ["Bounded delegation", "Separate-session context is explicit", "Worker completion needs evidence"],
  scope: "Executes a local worker-admission and result collector. It does not launch native multiagent threads or external workers. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Accept a bounded worker result", "input": {"subtask": "Summarize the reviewed interface", "eventBudget": 20, "stopReason": "end_turn", "workerText": "The interface has one evidence panel."}, "expected": "passed", "checks": {"accepted": true}}, {"id": "1", "label": "Keep a paused worker incomplete", "input": {"subtask": "Inspect the module", "eventBudget": 20, "stopReason": "requires_action", "workerText": "Partial answer"}, "expected": "paused", "checks": {"accepted": false}}],
  async run(input) {

const prompt=text(input,"subtask").trim(), budget=number(input,"eventBudget");
if(!prompt||prompt.length>8000||!Number.isInteger(budget)||budget<1||budget>500)return report("rejected","Subtask or event budget is invalid",{},["Bound delegated work before admission"]);
const ended=text(input,"stopReason")==="end_turn", answer=text(input,"workerText").trim();
return report(ended&&answer?"passed":ended?"incomplete":"paused","A worker report is accepted only after an ordinary completed turn",{accepted:!!(ended&&answer),workerContext:{subtask:prompt,inheritedFilesystem:false,inheritedHistory:false},answer},["Admit a bounded specialist task","Provide explicit context","Observe worker lifecycle","Do not duplicate an uncertain worker"]);

  }
};
