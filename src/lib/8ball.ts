export const positiveResponses = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes definitely",
  "You may rely on it",
  "As I see it, yes",
  "Most likely",
  "Outlook good",
  "Yes",
  "Signs point to yes",
];

export const ambiguousResponses = [
  "Reply hazy, try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
];

export const negativeResponses = [
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
];

export function getResponse(score: number): string {
  // score from -1 (terrible) to 1 (great)
  if (score > 0.3) {
    return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
  } else if (score < -0.3) {
    return negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
  } else {
    return ambiguousResponses[Math.floor(Math.random() * ambiguousResponses.length)];
  }
}
