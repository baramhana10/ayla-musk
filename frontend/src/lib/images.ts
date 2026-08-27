/**
 * Curated, verified, brand-safe editorial photography (Unsplash).
 * Every id below was checked for a 200 response and manually reviewed
 * to exclude visible third-party logos/wordmarks.
 */
const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=80`;

export const editorial = {
  makeupFlatlayTan: u("1596462502278-27bfdc403348"),
  lipsCloseup: u("1487412947147-5cebf100ffc2"),
  blondePortrait: u("1621784563330-caee0b138a00"),
  nailPolishHands: u("1522337660859-02fbefca4702"),
  redManicure: u("1519014816548-bf5fe059798b"),
  pinkHairPortrait: u("1470259078422-826894b933aa"),
  amberDropperBottle: u("1608571423902-eed4a5ad8108"),
  spaDiffuser: u("1620733723572-11c53f73a416"),
  dropperEucalyptus: u("1617897903246-719242758050"),
  brushesInCup: u("1526045478516-99145907023c"),
  handEyeshadow: u("1596704017254-9b121068fb31"),
  skincarePeach: u("1601049676869-702ea24cfd58"),
} as const;

export type EditorialImageKey = keyof typeof editorial;
