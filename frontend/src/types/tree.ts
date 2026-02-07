export type Gender = 'male' | 'female' | 'other';

export type RelationType =
    | 'biological_child'
    | 'adopted_child'
    | 'spouse'
    | 'ex_spouse'
    | 'partner'
    // Anime/Collection specific
    | 'rival'
    | 'mentor'
    | 'student'
    | 'ally'
    | 'enemy'
    | 'lover'
    | 'teammate'
    | 'other';

export interface Member {
    id: string;
    fullName: string;
    gender: Gender;
    birthDate?: string;
    deathDate?: string;
    isAlive: boolean;
    photoUrl?: string;
    description?: string;
    job?: string;
    alias?: string; // Conan style: "Cool Kid"
    attributes?: Record<string, any>;
    [key: string]: unknown;
}

export interface TreeEdge {
    id: string;
    source: string;
    target: string;
    type: RelationType;
}

export interface TreeData {
    members: Member[];
    relations: TreeEdge[];
}

export interface CollectionRelation {
    id: string;
    collectionId: string;
    sourceCardId: string;
    targetCardId: string;
    relationType: RelationType;
}

export interface CollectionCard {
    id: string;
    collectionId: string;
    name: string;
    characterName: string;
    photoUrl: string;
    rarity?: string;
    details?: any;
    createdAt: string;
}

export interface CollectionData {
    id: string;
    name: string;
    description?: string;
    type: string;
    cards: CollectionCard[];
    relations: CollectionRelation[];
    createdAt: string;
    updatedAt: string;
}
