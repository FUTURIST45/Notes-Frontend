export type User = {
  id: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

