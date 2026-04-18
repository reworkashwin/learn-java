const d = require("../transcripts/all-transcripts.json");
const all = Object.values(d.lectures).sort((a, b) => {
  if (a.sectionIndex !== b.sectionIndex) return a.sectionIndex - b.sectionIndex;
  return a.index - b.index;
});
const missing = all.filter(l => !l.transcript);
console.log(`Missing transcripts (${missing.length}):`);
missing.forEach(l => {
  console.log(`  S${l.sectionIndex}.${l.index}: ${l.title} (ID: ${l.id})`);
});

// Export for use by retry script
module.exports = missing;
