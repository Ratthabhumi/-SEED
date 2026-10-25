import type {POIType} from "./poi";
export type ClaimReason = "CLAIMABLE" | "NOT_DISCOVERED" | "TOO_FAR" | "HOSTILES_NEARBY" | "ALREADY_CLAIMED" | "INACTIVE_RUN" | "UNKNOWN_SITE";
export interface ClaimStatus {
 reason: ClaimReason; poiId: string; poiType?: POIType;
 x?: number; y?: number; distance?: number; remainingDistance?: number;
}
