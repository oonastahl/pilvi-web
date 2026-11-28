export type SessionStatus = "waiting" | "playing" | "finished";

export type Player = {
  uid: string;
  codename: string;
  score: number;
  guess: number | null;
};

export type Product = {
  title: string;
  thumbnail: string;
  price: number;
};

export type Session = {
  id: string;
  status: SessionStatus;
  currentRound: number;
  maxRounds: number;
  players: Player[];
  guesses: Record<string, number>;
  currentProduct: Pick<Product, "title" | "thumbnail"> | null;
  correctPrice: number | null;
  roundScored: boolean;
  winnerCodename?: string;
  createdAt: unknown;
};