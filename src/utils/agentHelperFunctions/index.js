const Retell = require("retell-sdk");
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
// async function getAgentCallSummary(agentId, planMinutes, startMs, endMs,callType) {
//   // const callRequest = { agent_id: agentId };
// const callRequest = {
//   filter_criteria: {
//     agent_id: [agentId]
//   }
// };

//   const calls = await client.call.list(callRequest);

// const { totalSeconds, totalCost, totalCalls } = calls.reduce(
//   (acc, call) => {
//     acc.totalSeconds += call.call_cost?.total_duration_seconds ?? 0;
//     acc.totalCost    += call.call_cost?.total_duration_unit_price ?? 0;
//     acc.totalCalls   += 1;
//     return acc;
//   },
//   { totalSeconds: 0, totalCost: 0, totalCalls: 0 }
// );

//   const usedMinutes  = Math.floor(totalSeconds / 60);
//   const usedSeconds  = totalSeconds % 60;

//   const planSeconds  = planMinutes ;
//   // const remainingSec = Math.max(planSeconds - totalSeconds, 0);
//   const remainingMin = Math.floor(planSeconds / 60);
//   const remainingRem = planSeconds % 60;

//   return {
//     // calls,
//     totalCalls,
//     totalSeconds,
//     totalCost,
//     used: { minutes: usedMinutes, seconds: usedSeconds },
//     remaining: { minutes: remainingMin, seconds: remainingRem },
//   };
// }


async function getAgentCallSummary(agentId, planMinutes,totalCalls, startMs, endMs,callType) {
  // const callRequest = { agent_id: agentId };
// const callRequest = {
//   filter_criteria: {
//     agent_id: [agentId]
//   }
// };

//   const calls = await client.call.list(callRequest);

// const { totalSeconds, totalCost, totalCalls } = calls.reduce(
//   (acc, call) => {
//     acc.totalSeconds += call.call_cost?.total_duration_seconds ?? 0;
//     acc.totalCost    += call.call_cost?.total_duration_unit_price ?? 0;
//     acc.totalCalls   += 1;
//     return acc;
//   },
//   { totalSeconds: 0, totalCost: 0, totalCalls: 0 }
// );

  // const usedMinutes  = Math.floor(totalSeconds / 60);
  // const usedSeconds  = totalSeconds % 60;

  const planSeconds  = planMinutes ;
  // const remainingSec = Math.max(planSeconds - totalSeconds, 0);
  const remainingMin = Math.floor(planSeconds / 60);
  const remainingRem = planSeconds % 60;

  return {
    // calls,
    totalCalls,
    // totalSeconds,
    // totalCost,
    // used: { minutes: usedMinutes, seconds: usedSeconds },
    remaining: { minutes: remainingMin, seconds: remainingRem },
  };
}

async function getAgentCallSummary2(agentId, planMinutes, totalCalls,startMs, endMs,callType) {
  const startOfDay = (input) => {
  const d = input instanceof Date ? input : new Date(input);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
  // const callRequest = { agent_id: agentId };
const callRequest = {
  filter_criteria: {
    agent_id: [agentId]
  }
};
  const calls = await client.call.list(callRequest);


  const { totalSeconds, totalCost, totalCall } = calls.reduce(
    (acc, call) => {
      acc.totalSeconds += call.call_cost?.total_duration_seconds ?? 0;
      acc.totalCost    += call.call_cost?.total_duration_unit_price ?? 0;
      acc.totalCalls   += 1;
      return acc;
    },
    { totalSeconds: 0, totalCost: 0, totalCalls: 0 }
  );

  // ---------- 2.  build 30-day histogram ----------
  const now          = Date.now();                 // current moment (ms)
  const oneDayMs     = 24 * 60 * 60 * 1000;        // ms in a day
  const todayMidnight= startOfDay(new Date(now));  // today 00:00
  const past30Start  = todayMidnight - 29 * oneDayMs;

  // pre-fill an array of length 30 with zero counts
  const dailyCounts = Array.from({ length: 30 }, (_, i) => ({
    ts:  past30Start + i * oneDayMs,               // midnight ts for the day
    val: 0,
  }));

  // count calls that start (or end) within each day bucket
  for (const call of calls) {
    const ts = call.start_timestamp ?? call.end_timestamp; // fall back if needed
    if (ts >= past30Start && ts < todayMidnight + oneDayMs) {
      const index = Math.floor((ts - past30Start) / oneDayMs);
      dailyCounts[index].val += 1;
    }
  }

  // map to the UI-friendly shape you asked for
  const data = dailyCounts.map(({ ts, val }) => {
    const dayName = new Date(ts).toLocaleDateString("en-US", {day: "numeric", }); // Mon, Tue, …
    return { name: dayName, calls: val };
  });

  // ---------- 3.  derive usage info ----------
  const usedMinutes  = Math.floor(totalSeconds / 60);
  const usedSeconds  = totalSeconds % 60;

  const planSeconds  = planMinutes ;
  const remainingSec = Math.max(planSeconds - totalSeconds, 0);
  const remainingMin = Math.floor(remainingSec / 60);
  const remainingRem = remainingSec % 60;

  // ---------- 4.  final payload ----------
  return {
    totalCalls,
    totalSeconds,
    totalCost,
    used:       { minutes: usedMinutes, seconds: usedSeconds },
    remaining:  { minutes: remainingMin, seconds: remainingRem },
    data,               // ← 30-day call counts (oldest → newest)
  };
}
module.exports = { getAgentCallSummary,getAgentCallSummary2 };
