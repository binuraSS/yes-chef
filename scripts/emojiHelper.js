export function getEmoji(text) {
  const lower = text.toLowerCase();
  if (lower.includes("bake")) return "🔥";
  if (lower.includes("mix")) return "🥣";
  if (lower.includes("chop") || lower.includes("slice")) return "🔪";
  if (lower.includes("boil")) return "🍲";
  if (lower.includes("serve")) return "🍽️";
  if (lower.includes("stir")) return "🥄";
  if (lower.includes("heat")) return "🌡️";
  if (lower.includes("grill")) return "🍖";
  if (lower.includes("wait") || lower.includes("rest")) return "⏳";
  return "👨‍🍳";
}
