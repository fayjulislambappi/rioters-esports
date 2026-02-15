"use client";

import { motion } from "framer-motion";
import React from "react";
import PlayerCard from "./PlayerCard";

interface EpicRosterProps {
    teamMembers: any[];
    teamInfo: any;
}

export default function EpicRoster({ teamMembers: initialMembers, teamInfo }: EpicRosterProps) {
    const [isMobile, setIsMobile] = React.useState(false);

    // Reorder members to put captain in the center
    const teamMembers = React.useMemo(() => {
        const captId = teamInfo.captainId?._id || teamInfo.captainId; // Handle both object and string
        const members = [...initialMembers];

        const captainIndex = members.findIndex(m => {
            const mId = m._id?.toString();
            const mUserId = (m.userId || m.registeredUserId || m.playerId?._id || m.playerId)?.toString();
            const targetId = captId?.toString();
            return (mId && mId === targetId) || (mUserId && mUserId === targetId);
        });

        if (captainIndex > -1) {
            const [captain] = members.splice(captainIndex, 1);
            const centerPos = Math.floor(members.length / 2);
            members.splice(centerPos, 0, captain);
        }
        return members;
    }, [initialMembers, teamInfo.captainId]);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="w-full h-full flex justify-center items-center py-4 px-4 relative md:min-h-[500px] min-h-[400px]">
            {/* Background Aesthetic elements */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Fanned Cards Container */}
            <div className="relative flex items-center justify-center w-full max-w-7xl mx-auto h-full">
                {teamMembers.map((member, index) => {
                    const captId = teamInfo.captainId?._id || teamInfo.captainId;
                    const mId = member._id?.toString();
                    const mUserId = (member.userId || member.registeredUserId || member.playerId?._id || member.playerId)?.toString();
                    const targetId = captId?.toString();
                    const isCaptain = (mId && mId === targetId) || (mUserId && mUserId === targetId);

                    // Find team-specific role
                    const teamRoleEntry = member.teams?.find((t: any) =>
                        t.teamId?.toString() === teamInfo._id?.toString() ||
                        t.teamId?._id?.toString() === teamInfo._id?.toString()
                    );
                    const teamRole = teamRoleEntry?.role || member.role || "Player";

                    // Find game-specific stats and OVR
                    const normalize = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
                    const target = normalize(teamInfo.gameFocus);

                    // Check both playerId and playerData for games
                    const gamesArray = member.playerId?.games || member.playerData?.games;
                    const gameProfile = gamesArray?.find((g: any) => {
                        const current = normalize(g.game);
                        return current === target || current.includes(target) || target.includes(current);
                    }) || gamesArray?.find((g: any) => g.game === "Counter-Strike 2" || g.game === "Valorant") || gamesArray?.[0];

                    const overall = gameProfile?.overall || 60;
                    const stats = gameProfile?.stats || {};

                    // Display role
                    let displayRole = "PLAYER";
                    if (isCaptain) {
                        displayRole = "CAPTAIN";
                    } else if (member.isSubstitute || member.role === "SUBSTITUTE") {
                        displayRole = "SUBSTITUTE";
                    } else if (teamRole && teamRole !== "MEMBER" && teamRole !== "USER") {
                        displayRole = teamRole.toUpperCase();
                    }

                    // Calculate fan positioning
                    const centerIndex = (teamMembers.length - 1) / 2;
                    const distanceFromCenter = index - centerIndex;
                    const absDistance = Math.abs(distanceFromCenter);

                    // Responsive Multipliers
                    const spacingMult = isMobile ? 55 : 115;
                    const arcMult = isMobile ? 12 : 25;
                    const baseScale = isMobile ? 0.7 : 1;

                    // Arc: edges lower than center
                    const y = absDistance * arcMult;

                    // Fan spacing: cards overlap (tighter for smaller cards)
                    const x = distanceFromCenter * spacingMult;

                    // Tilt: edges tilt outwards
                    const rotate = distanceFromCenter * 6;

                    // Depth: cards further from center are "behind"
                    const zIndex = 50 - Math.floor(absDistance * 10);

                    // Standard uniform scale for all cards
                    const scale = baseScale;

                    return (
                        <motion.div
                            key={member._id || index}
                            initial={{ opacity: 0, y: 150, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                x,
                                y,
                                rotate,
                                scale,
                                zIndex
                            }}
                            transition={{
                                duration: 0.8,
                                delay: index * 0.1,
                                ease: [0.23, 1, 0.32, 1]
                            }}
                            whileHover={{
                                scale: 1.05,
                                zIndex: 100,
                                y: y - 20,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                            className="absolute flex-shrink-0 w-[220px] h-[390px]"
                            style={{
                                transformOrigin: "bottom center"
                            }}
                        >
                            <PlayerCard
                                ign={member.ign || member.name}
                                name={member.name}
                                role={displayRole}
                                rank={
                                    isCaptain ? "Captain" :
                                        overall >= 95 ? "Legend" :
                                            overall >= 90 ? "Glitched" :
                                                overall >= 85 ? "Demon" :
                                                    overall >= 80 ? "Sweaty" :
                                                        overall >= 75 ? "Hardstuck" :
                                                            overall >= 70 ? "Carried" :
                                                                overall >= 65 ? "Washed" :
                                                                    overall >= 60 ? "Bot" :
                                                                        "Pigeon"
                                }
                                image={member.image}
                                game={gameProfile?.game || teamInfo.gameFocus || "General"}
                                overall={overall}
                                stats={stats}
                                teamLogo={teamInfo.logo || "/logo.png"}
                                teamName={teamInfo.name}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
