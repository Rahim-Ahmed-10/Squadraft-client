// ─── Core Entity Types ─────────────────────────────────────────────────────

export interface Player {
  _id: string;
  name: string;
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
  goals: number;
  rating: number;
  imageUrl?: string | null;
  nationality?: string | null;
  jerseyNumber?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: "Match" | "Training" | "General";
  createdAt: string;
}

export interface AttendanceRecord {
  playerId: string | { _id: string; name: string; position: string };
  status: "Present" | "Absent" | "Late";
}

export interface Attendance {
  _id?: string;
  date: string;
  records: AttendanceRecord[];
}

export interface LineupPlayerSlot {
  positionKey: string;
  playerId: Player | null;
}

export interface Lineup {
  _id?: string;
  formation: string;
  players: LineupPlayerSlot[];
  updatedAt?: string;
}

// ─── Auth Types ────────────────────────────────────────────────────────────

export type UserRole = "Admin" | "Player";

export interface AuthUser {
  _id: string;
  username: string;
  role: UserRole;
  playerId: Player | null;
  token: string;
}
