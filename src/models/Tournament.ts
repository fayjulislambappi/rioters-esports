import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITournament extends Document {
    title: string;
    gameId: mongoose.Types.ObjectId;
    description: string;
    rules: string;
    prizePool: string;
    entryFee: string;
    startDate: Date;
    endDate: Date;
    registrationDeadline: Date;
    maxTeams: number;
    registeredTeams: mongoose.Types.ObjectId[];
    status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
    image?: string;
}

const TournamentSchema = new Schema<ITournament>(
    {
        title: { type: String, required: true },
        gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
        description: { type: String, required: true },
        rules: { type: String, required: true },
        prizePool: { type: String, required: true }, // e.g., "$10,000" or "1000 Gems"
        entryFee: { type: String, default: "Free" },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        registrationDeadline: { type: Date, required: true },
        maxTeams: { type: Number, required: true },
        registeredTeams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
        status: {
            type: String,
            enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
            default: "UPCOMING",
        },
        image: { type: String },
    },
    { timestamps: true },
);

const Tournament: Model<ITournament> =
    mongoose.models.Tournament ||
    mongoose.model<ITournament>("Tournament", TournamentSchema);

export default Tournament;
