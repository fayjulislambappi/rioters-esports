"use client";

import PlayerForm from "@/components/admin/PlayerForm";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditPlayerPage() {
    const params = useParams();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetch(`/api/admin/players/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) setPlayer(data);
                })
                .finally(() => setLoading(false));
        }
    }, [params.id]);

    if (loading) return <div className="text-white p-8">Loading player data...</div>;
    if (!player) return <div className="text-red-500 p-8">Player not found</div>;

    return <PlayerForm initialData={player} isEdit={true} />;
}
