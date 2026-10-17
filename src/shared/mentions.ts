// Where an ingredient is mentioned in a step. A mention is a whole word (or words): "maïs" does not count inside
// "maïssoep", "ui" not inside "kruiden". Shared by the annotation check (worker) and the step display (app).
const isLetter = (ch: string | undefined): boolean => !!ch && /[\p{L}\p{N}]/u.test(ch);

/** Index of the first whole-word occurrence of `mention` in `text` at or after `from`, or -1. */
export function findMention(text: string, mention: string, from = 0): number {
  if (!mention) return -1;
  let start = text.indexOf(mention, from);
  while (start !== -1) {
    const end = start + mention.length;
    if (!isLetter(text[start - 1]) && !isLetter(text[end])) return start;
    start = text.indexOf(mention, start + 1);
  }
  return -1;
}
