"use client";

import { useState, useEffect } from "react";
import { Player, Lineup, LineupPlayerSlot } from "../lib/types";
import api from "../lib/api";
import { Save, UserPlus, Sparkles, Check, Info, Loader2, AlertCircle } from "lucide-react";

interface LineupBuilderProps {
  players: Player[];
}

interface PositionCoords {
  x: number; // percentage from left
  y: number; // percentage from bottom
  label: string;
}

// Coordinate definitions for positions in different formations
// Coordinate system: X: 0-100 (left to right), Y: 0-100 (bottom to top, GK is low, ST is high)
const FORMATION_COORDS: Record<string, PositionCoords[]> = {
  "4-4-2": [
    { x: 50, y: 8, label: "GK" }, // GK (pos_0)
    { x: 15, y: 26, label: "LB" }, // LB (pos_1)
    { x: 38, y: 26, label: "LCB" }, // LCB (pos_2)
    { x: 62, y: 26, label: "RCB" }, // RCB (pos_3)
    { x: 85, y: 26, label: "RB" }, // RB (pos_4)
    { x: 15, y: 55, label: "LM" }, // LM (pos_5)
    { x: 38, y: 55, label: "LCM" }, // LCM (pos_6)
    { x: 62, y: 55, label: "RCM" }, // RCM (pos_7)
    { x: 85, y: 55, label: "RM" }, // RM (pos_8)
    { x: 32, y: 82, label: "LS" }, // LS (pos_9)
    { x: 68, y: 82, label: "RS" }, // RS (pos_10)
  ],
  "4-3-3": [
    { x: 50, y: 8, label: "GK" }, // GK (pos_0)
    { x: 15, y: 26, label: "LB" }, // LB (pos_1)
    { x: 38, y: 26, label: "LCB" }, // LCB (pos_2)
    { x: 62, y: 26, label: "RCB" }, // RCB (pos_3)
    { x: 85, y: 26, label: "RB" }, // RB (pos_4)
    { x: 23, y: 52, label: "LCM" }, // LCM (pos_5)
    { x: 50, y: 46, label: "DM" }, // CM/DM (pos_6)
    { x: 77, y: 52, label: "RCM" }, // RCM (pos_7)
    { x: 18, y: 78, label: "LW" }, // LW (pos_8)
    { x: 50, y: 84, label: "ST" }, // ST (pos_9)
    { x: 82, y: 78, label: "RW" }, // RW (pos_10)
  ],
  "3-5-2": [
    { x: 50, y: 8, label: "GK" }, // GK (pos_0)
    { x: 23, y: 26, label: "LCB" }, // LCB (pos_1)
    { x: 50, y: 24, label: "CB" }, // CB (pos_2)
    { x: 77, y: 26, label: "RCB" }, // RCB (pos_3)
    { x: 12, y: 50, label: "LWB" }, // LWB (pos_4)
    { x: 34, y: 54, label: "LCM" }, // LCM (pos_5)
    { x: 50, y: 45, label: "DM" }, // CM/DM (pos_6)
    { x: 66, y: 54, label: "RCM" }, // RCM (pos_7)
    { x: 88, y: 50, label: "RWB" }, // RWB (pos_8)
    { x: 32, y: 80, label: "LS" }, // LS (pos_9)
    { x: 68, y: 80, label: "RS" }, // RS (pos_10)
  ],
  "4-2-3-1": [
    { x: 50, y: 8, label: "GK" }, // GK (pos_0)
    { x: 15, y: 26, label: "LB" }, // LB (pos_1)
    { x: 38, y: 26, label: "LCB" }, // LCB (pos_2)
    { x: 62, y: 26, label: "RCB" }, // RCB (pos_3)
    { x: 85, y: 26, label: "RB" }, // RB (pos_4)
    { x: 34, y: 46, label: "LDM" }, // LDM (pos_5)
    { x: 66, y: 46, label: "RDM" }, // RDM (pos_6)
    { x: 18, y: 68, label: "LAM" }, // LAM/LW (pos_7)
    { x: 50, y: 68, label: "CAM" }, // CAM (pos_8)
    { x: 82, y: 68, label: "RAM" }, // RAM/RW (pos_9)
    { x: 50, y: 84, label: "ST" }, // ST (pos_10)
  ],
  "5-3-2": [
    { x: 50, y: 8, label: "GK" }, // GK (pos_0)
    { x: 12, y: 32, label: "LWB" }, // LWB (pos_1)
    { x: 31, y: 25, label: "LCB" }, // LCB (pos_2)
    { x: 50, y: 24, label: "CB" }, // CB (pos_3)
    { x: 69, y: 25, label: "RCB" }, // RCB (pos_4)
    { x: 88, y: 32, label: "RWB" }, // RWB (pos_5)
    { x: 23, y: 55, label: "LCM" }, // LCM (pos_6)
    { x: 50, y: 52, label: "CM" }, // CM (pos_7)
    { x: 77, y: 55, label: "RCM" }, // RCM (pos_8)
    { x: 32, y: 80, label: "LS" }, // LS (pos_9)
    { x: 68, y: 80, label: "RS" }, // RS (pos_10)
  ],
};

export default function LineupBuilder({ players }: LineupBuilderProps) {
  const [formation, setFormation] = useState("4-4-2");
  const [lineupPlayers, setLineupPlayers] = useState<LineupPlayerSlot[]>([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Initialize and load squad lineup
  const loadLineup = async () => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const res = await api.get("/lineup");
      if (res.data) {
        setFormation(res.data.formation);
        
        // Parse active assignments
        const apiPlayers: LineupPlayerSlot[] = res.data.players.map((slot: any) => ({
          positionKey: slot.positionKey,
          playerId: slot.playerId ? (slot.playerId as Player) : null,
        }));
        
        // Ensure 11 slots are fully mapped
        const verifiedSlots = Array.from({ length: 11 }, (_, i) => {
          const key = `pos_${i}`;
          const match = apiPlayers.find((s) => s.positionKey === key);
          return match ? match : { positionKey: key, playerId: null };
        });

        setLineupPlayers(verifiedSlots);
      }
    } catch (err) {
      console.error(err);
      setAlertMsg({ type: "error", text: "Failed to connect to database. Setup offline lineup mockup." });
      
      // Default offline grid
      setLineupPlayers(
        Array.from({ length: 11 }, (_, i) => ({
          positionKey: `pos_${i}`,
          playerId: null,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLineup();
  }, []);

  const saveLineup = async () => {
    setSaving(true);
    setAlertMsg(null);
    try {
      // Map lineup state for backend payload
      const payloadPlayers = lineupPlayers.map((p) => ({
        positionKey: p.positionKey,
        playerId: p.playerId ? p.playerId._id : null,
      }));

      await api.post("/lineup", {
        formation,
        players: payloadPlayers,
      });

      setAlertMsg({ type: "success", text: "Squad lineup saved and updated successfully!" });
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setAlertMsg({ type: "error", text: "Failed to save lineup details to server." });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    if (activeSlotIndex === null) return;

    // Check if player is already assigned somewhere else in the pitch
    const existingIndex = lineupPlayers.findIndex(
      (s) => s.playerId && s.playerId._id === player._id
    );

    const updated = [...lineupPlayers];

    if (existingIndex !== -1) {
      // SWAP logic: If they are already on field, swap them or clear their old spot
      const currentAssignedToActiveSlot = updated[activeSlotIndex].playerId;
      
      updated[existingIndex] = {
        ...updated[existingIndex],
        playerId: currentAssignedToActiveSlot, // Move the current slot's player to their old spot
      };
      
      setAlertMsg({ 
        type: "info", 
        text: `Swapped ${player.name} with ${currentAssignedToActiveSlot ? currentAssignedToActiveSlot.name : "empty spot"}.` 
      });
      setTimeout(() => setAlertMsg(null), 3000);
    }

    // Assign player to active slot
    updated[activeSlotIndex] = {
      ...updated[activeSlotIndex],
      playerId: player,
    };

    setLineupPlayers(updated);
    setActiveSlotIndex(null);
  };

  const handleClearSlot = (index: number) => {
    const updated = [...lineupPlayers];
    updated[index] = {
      ...updated[index],
      playerId: null,
    };
    setLineupPlayers(updated);
  };

  const getPositionCoordinates = (index: number): PositionCoords => {
    const currentCoords = FORMATION_COORDS[formation] || FORMATION_COORDS["4-4-2"];
    return currentCoords[index] || { x: 50, y: 50, label: "POS" };
  };

  const isAssigned = (playerId: string) => {
    return lineupPlayers.some((s) => s.playerId && s.playerId._id === playerId);
  };

  const countAssigned = lineupPlayers.filter((s) => s.playerId).length;

  return (
    <div className="space-y-6">
      {/* Formation picker & Save buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-zinc-900/60 border border-zinc-800 backdrop-blur-md p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Formation:
          </label>
          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500 font-bold"
          >
            <option value="4-4-2">4-4-2 (Classic Wide)</option>
            <option value="4-3-3">4-3-3 (Attacking)</option>
            <option value="3-5-2">3-5-2 (Midfield Heavy)</option>
            <option value="4-2-3-1">4-2-3-1 (Modern Standard)</option>
            <option value="5-3-2">5-3-2 (Defensive Counter)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="text-xs text-zinc-400 font-medium">
            Active: <span className="text-emerald-400 font-bold">{countAssigned}</span> / 11
          </div>
          
          <button
            onClick={saveLineup}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] disabled:opacity-50 text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Lineup
              </>
            )}
          </button>
        </div>
      </div>

      {alertMsg && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2.5 border animate-fade-in ${
          alertMsg.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : alertMsg.type === "error"
            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
        }`}>
          {alertMsg.type === "success" && <Sparkles className="h-4 w-4 shrink-0" />}
          {alertMsg.type === "info" && <Info className="h-4 w-4 shrink-0" />}
          {alertMsg.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
          {alertMsg.text}
        </div>
      )}

      {/* Main Pitch and Selection Panel Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Visual Football Pitch Container */}
        <div className="xl:col-span-2 flex justify-center bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-inner shadow-black">
          {/* Soccer field grass stripes background */}
          <div className="absolute inset-0 opacity-10 flex flex-col pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 w-full ${i % 2 === 0 ? "bg-emerald-800" : "bg-emerald-900"}`}
              />
            ))}
          </div>

          {/* Grid lines layout */}
          <div className="w-full max-w-[500px] aspect-[4/5] bg-gradient-to-b from-emerald-950/40 via-emerald-900/10 to-emerald-950/40 border-[3px] border-emerald-500/20 rounded-2xl relative p-4">
            
            {/* Center Circle & Center Line */}
            <div className="absolute inset-x-0 top-1/2 h-[3px] bg-emerald-500/10 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-28 h-28 border-[3px] border-emerald-500/15 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Top Penalty Box (Away Box) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] border-b-[3px] border-x-[3px] border-emerald-500/20 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[6%] border-b-[3px] border-x-[3px] border-emerald-500/20 pointer-events-none" />

            {/* Bottom Penalty Box (Home Box) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] border-t-[3px] border-x-[3px] border-emerald-500/20 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[6%] border-t-[3px] border-x-[3px] border-emerald-500/20 pointer-events-none" />

            {/* Goal Posts */}
            <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[16%] h-[8px] bg-emerald-500/40 rounded-t border-t-2 border-emerald-400 pointer-events-none" />
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[16%] h-[8px] bg-emerald-500/40 rounded-b border-b-2 border-emerald-400 pointer-events-none" />

            {/* Render 11 Player Spots */}
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-xl z-20">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
              </div>
            ) : (
              lineupPlayers.map((slot, index) => {
                const pos = getPositionCoordinates(index);
                const isSelected = activeSlotIndex === index;
                const player = slot.playerId;

                return (
                  <div
                    key={slot.positionKey}
                    style={{
                      left: `${pos.x}%`,
                      bottom: `${pos.y}%`,
                      transform: "translate(-50%, 50%)", // Centered on dot coordinates
                    }}
                    className="absolute z-10 flex flex-col items-center select-none"
                  >
                    {/* Circle Spot */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveSlotIndex(isSelected ? null : index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveSlotIndex(isSelected ? null : index);
                        }
                      }}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full font-bold text-[10px] border shadow-lg transition-all cursor-pointer ${
                        player
                          ? "bg-gradient-to-b from-zinc-800 to-zinc-900 border-emerald-500 text-emerald-400 scale-100 hover:scale-105 hover:border-emerald-400"
                          : "bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-500/30 text-emerald-500/60 border-dashed scale-95 hover:scale-100"
                      } ${isSelected ? "ring-2 ring-emerald-400 border-emerald-400 scale-105" : ""}`}
                    >
                      {player ? (
                        <span>{pos.label}</span>
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}

                      {/* Small remove pill */}
                      {player && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearSlot(index);
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[9px] border border-zinc-900 font-black shadow"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Label below Circle */}
                    <div className="mt-1 text-center w-28 pointer-events-none">
                      <div className="text-[10px] font-bold text-zinc-100 truncate drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        {player ? player.name.split(" ").slice(-1)[0] : "Assign Player"}
                      </div>
                      <div className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
                        {pos.label}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Player Roster Selection sidebar */}
        <div className="bg-zinc-900/60 border border-zinc-800 backdrop-blur-md rounded-3xl p-6 flex flex-col h-[500px] xl:h-auto">
          <div className="pb-4 border-b border-zinc-800/80">
            <h3 className="text-base font-bold text-zinc-200">
              {activeSlotIndex !== null
                ? `Assign: ${getPositionCoordinates(activeSlotIndex).label} Position`
                : "Squad Selector"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {activeSlotIndex !== null
                ? "Select a player from the roster to place them in this position."
                : "Click on any position circle on the pitch to assign or replace a player."}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 custom-scrollbar">
            {activeSlotIndex === null ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Info className="h-8 w-8 text-zinc-700 mb-3 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Pitch Node Unselected
                </span>
                <p className="text-[11px] text-zinc-650 mt-1 max-w-xs">
                  Click on an empty position or player on the pitch to change assignments.
                </p>
              </div>
            ) : players.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-xs font-medium text-zinc-400">No players registered</span>
              </div>
            ) : (
              players.map((p) => {
                const assigned = isAssigned(p._id);
                return (
                  <button
                    key={p._id}
                    onClick={() => handleSelectPlayer(p)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-850 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950 transition-all text-left group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                        {p.name}
                      </h4>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">
                          {p.position}
                        </span>
                        <span className="text-[9px] text-zinc-600">•</span>
                        <span className="text-[9px] font-bold text-amber-500">
                          Rating: {p.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {assigned ? (
                        <span className="text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" />
                          Fielded
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded-lg opacity-60 group-hover:opacity-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          Select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
