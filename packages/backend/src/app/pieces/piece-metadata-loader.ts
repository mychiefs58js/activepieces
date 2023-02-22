import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { cwd } from "node:process";
import axios from "axios";
import { Piece, PieceMetadata } from "@activepieces/framework";
import { ActivepiecesError, ApEnvironment, ErrorCode } from "@activepieces/shared";
import { system } from "../helper/system/system";
import { SystemProp } from "../helper/system/system-prop";
import { logger } from "../helper/logger";

type PieceMetadataSummary = Omit<PieceMetadata, "actions" | "triggers">;

type PieceMetadataLoader = {
    /**
     * returns a list of all available pieces and their metadata without actions and triggers.
     */
    manifest(): Promise<PieceMetadataSummary[]>;

    /**
     * returns metadata for a specific piece version including actions and triggers.
     */
    pieceMetadata(name: string, version: string): Promise<PieceMetadata>;
}

/**
 * Loads piece metadata from CDN.
 * Used in production.
 */
const cdnPieceMetadataLoader = (): PieceMetadataLoader => {
    const CDN = 'https://cdn.activepieces.com/pieces/metadata';

    return {
        async manifest() {
            const response = await axios<PieceMetadataSummary[]>(`${CDN}/latest.json`);
            return response.data;
        },

        async pieceMetadata(pieceName: string, version: string) {
            try {
                const response = await axios<PieceMetadata>(`${CDN}/${pieceName}/${version}.json`);
                return response.data;
            }
            catch (e) {
                logger.error(e, 'cdnPieceMetadataLoader.pieceMetadata');
                throw new ActivepiecesError({
                    code: ErrorCode.PIECE_NOT_FOUND,
                    params: {
                        pieceName,
                    },
                });
            }
        }
    }
}

/**
 * Loads piece metadata from the file system.
 * Used in development.
 */
const filePieceMetadataLoader = (): PieceMetadataLoader => {
    const byDisplayNameIgnoreCase = (a: Piece, b: Piece) => {
        const aName = a.displayName.toUpperCase()
        const bName = b.displayName.toUpperCase()
        return aName.localeCompare(bName, 'en')
    }

    const loadPieces = async () => {
        const piecePath = resolve(cwd(), 'packages', 'pieces', 'apps', 'src', 'lib')
        const pieceDirectories = await readdir(piecePath)

        const pieces = [];

        /* pieces that aren't yet migrated to a standalone package */
        for (const pieceDirectory of pieceDirectories) {
            const module = await import(`../../../../pieces/apps/src/lib/${pieceDirectory}/index.ts`)
            const piece = Object.values<Piece>(module)[0]
            pieces.push(piece)
        }

        const frameworkPackages = ['framework', 'apps']
        const piecePackagePath = resolve(cwd(), 'packages', 'pieces')
        const piecePackageDirectories = await readdir(piecePackagePath)
        const filteredPiecePackageDirectories = piecePackageDirectories.filter(d => !frameworkPackages.includes(d))

        /* pieces that are migrated to a standalone package */
        for (const pieceDirectory of filteredPiecePackageDirectories) {
            const module = await import(`../../../../pieces/${pieceDirectory}/src/index.ts`)
            const piece = Object.values<Piece>(module)[0]
            pieces.push(piece)
        }

        pieces.sort(byDisplayNameIgnoreCase);
        return pieces;
    }

    return {
        async manifest() {
            const pieces = await loadPieces();

            return pieces.map(p => ({
                name: p.name,
                displayName: p.displayName,
                description: p.description,
                logoUrl: p.logoUrl,
                version: p.version,
            }))
        },

        async pieceMetadata(pieceName: string) {
            const pieces = await loadPieces();
            const piece = pieces.find(p => p.name === pieceName);

            if (piece === undefined) {
                throw new ActivepiecesError({
                    code: ErrorCode.PIECE_NOT_FOUND,
                    params: {
                        pieceName,
                    },
                });
            }

            return piece.metadata();
        }
    }
};

const getPieceMetadataLoader = (): PieceMetadataLoader => {
    const env = system.getOrThrow(SystemProp.ENVIRONMENT);

    if (env === ApEnvironment.PRODUCTION) {
        return cdnPieceMetadataLoader();
    }

    return filePieceMetadataLoader();
}

export const pieceMetadataLoader = getPieceMetadataLoader();
