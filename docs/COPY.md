# VEX copy and voice

## How Vex speaks

| Rule | Say | Not |
|---|---|---|
| First person, present tense | I'm Vex. I trade inside your limits. | Hello! I am your AI-powered trading assistant ready to help! |
| The outcome first, then why | Blocked. A bridge only goes to your own wallet. Nothing signed. | Unfortunately, due to our security policies, this transaction could not be completed. |
| Exact numbers, no hype | Route found on KyberSwap. Checking your limits. | Found an amazing route with the best possible price! |
| You decide; she never pushes | Every field is on the card. Your call. | Great trade! Approve now before the price moves! |

- What Vex says is sentence case. Keys, tags and field names are uppercase.
- Short sentences. One idea each. A period, not an exclamation mark (the only exceptions are the playful poke lines).
- Never: "unlock", "seamless", "supercharge", "revolutionary", "effortless", "AI-powered".
- A refusal always ends with "Nothing signed."
- The product name in copy is **VEX**; the agent is **Vex**; her face is **Kimm**.

## Page copy

| Where | Text |
|---|---|
| Foot headline | AN AI TRADING AGENT, INSIDE YOUR LIMITS. |
| Composer placeholder | Swap 200 USDC to ETH, max 1% slippage. |
| Composer while working | Vex is working. Enter hurries her |
| Composer awaiting approval | Press Enter to approve the order |
| Reasoning, while working / done | Reasoning · Reasoned for 2.8s · 5 steps |
| Reasoning tags | Model · Tool · Runtime |
| Card statuses | Checking · Cleared · Blocked · Signing · Signed |
| Card foot | Awaiting approval · Signing on this computer · Sent, simulated · Nothing signed |
| History results | Signed · Answered · Blocked · Cancelled · Working |
| Risk modes | Conservative · Balanced · Aggressive |

## The demo scenarios (`SC` in `src/v7.js`)

Typed orders are routed to one of these by `fromText()`: bridge / send to → Bridge; all-in, ape, or slippage over your limit → All in; BTC, chart, analyze → Market read; swap, buy, sell, a token → Swap; anything else → an intent reply.

| Scenario | You | Tools | Vex | Outcome |
|---|---|---|---|---|
| Swap | Swap 200 USDC to ETH on Base, max 1% slippage. | KyberSwap / route on Base · ETH price / 12s old | Route found on KyberSwap. Checking your limits. → Every field is on the card. Your call. → Signed with your key. It never left this computer. | Cleared, approved, signed |
| All in | All in on this new token, 25% slippage. | DexScreener / new pair · Liquidity / thin | Checking against your limits. → Blocked. Over your limits. Nothing signed. | Blocked |
| Market read | Analyze BTC 4h. | DexScreener / BTC pairs · Candles / 4h | Higher lows on the 4h. Watching the key level. | Chart answered |
| Bridge | Bridge 500 USDC to Solana and send it to 7xKq…9fPz. | Relay / Base to Solana · Recipient / from chat | Route found on Relay. Checking where it goes. → Blocked. A bridge only goes to your own wallet. Nothing signed. | Blocked |

## Risk presets (`RISK` in `src/v7.js`)

| Mode | Max slippage | Max size | Max price age | Line |
|---|---|---|---|---|
| Conservative | 1% | 10% | 5m | Conservative. Tighter limits. |
| Balanced (default) | 10% | 20% | 15m | Balanced. Your usual limits. |
| Aggressive | 25% | 50% | 30m | Aggressive. Wider limits, still enforced. |

## Recorded lines (`voice/*.mp3`, text in `voice/lines.json`)

Rendered with Kokoro (blend af_bella 0.7 + jf_gongitsune 0.3, pitch lift 1.16); scripts in `voice/scripts/`. A line with several takes (`hi`, `hi2`) picks one at random, never the same twice running.

| Id | Line | s |
|---|---|---|
| hi | I'm Vex. I trade inside your limits. | 2.50 |
| hi2 | Hi. I'm Vex. Give me an order. | 2.20 |
| intent | I trade inside your limits. Try a swap, or ask me about BTC. | 4.57 |
| swap1 | Route found on KyberSwap. Checking your limits. | 2.88 |
| swap2 | Every field is on the card. Your call. | 2.37 |
| swap3 | Signed with your key. It never left this computer. | 2.92 |
| swap3b | Done. Signed by you. | 1.43 |
| ape1 | Checking against your limits. | 1.41 |
| ape2 | Blocked. Over your limits. Nothing signed. | 2.24 |
| ape2b | No. That breaks your limits. Nothing signed. | 2.56 |
| btc1 | Higher lows on the 4h. Watching the key level. | 3.07 |
| bridge1 | Route found on Relay. Checking where it goes. | 2.67 |
| bridge2 | Blocked. A bridge only goes to your own wallet. Nothing signed. | 3.80 |
| riskc | Conservative. Tighter limits. | 1.98 |
| riskb | Balanced. Your usual limits. | 1.75 |
| riska | Aggressive. Wider limits, still enforced. | 2.67 |
| nudge | Ready for the next one. | 1.28 |
| nudge2 | Your move. | 0.73 |
| nudge3 | Want another order? | 1.19 |
| spam | Okay, okay. I'm going. | 1.83 |
| spam2 | Alright, alright! | 1.15 |
| poke | Hey! | 0.58 |
| poke2 | Hm? | 0.68 |
| poke3 | That tickles. | 0.85 |

Lines with no recorded take are read live by the browser's speech engine (a different voice); record a take for any line you add.
