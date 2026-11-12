// Short commuter safety tips shown on the Home screen (a different one each day).
export const SAFETY_TIPS = [
  'Check the registration before you board, and share it with someone you trust.',
  'Keep your phone and bag on your lap, not on the seat or floor beside you.',
  'Have your exact fare ready so you don\'t need to take out your wallet.',
  'After dark, wait where there are other commuters and good lighting.',
  'Save 10111 and a trusted contact so you can call them quickly.',
  'If the driver is speeding or on the phone, you can ask to get off at the next safe stop.',
  'Sit near the door if you can, and know where the emergency exit is.',
  'Trust your instincts: if a taxi doesn\'t feel right, wait for the next one.',
];

/** Same tip all day, a new one tomorrow. */
export function tipOfTheDay(date = new Date()) {
  const day = Math.floor(date.getTime() / 86400000);
  return SAFETY_TIPS[day % SAFETY_TIPS.length];
}
