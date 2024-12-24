import axios from 'axios';

interface AspectConstraint {
    aspectRequired: boolean;
    aspectUsage: string;
    expectedRequiredByDate?: string;
}

interface AspectValue {
    value: string;
    constraints?: {
        itemToAspectCardinality: string;
        aspectValueUsage: string;
    };
}

export interface ItemAspect {
    localizedAspectName: string;
    aspectConstraint: AspectConstraint;
    aspectValues?: AspectValue[];
    aspectMode: 'FREE_TEXT' | 'SELECTION_ONLY';
}

interface ItemAspectsResponse {
    aspects: ItemAspect[];
    categoryId: string;
    categoryName: string;
}

export async function getItemAspectsForCategory(categoryId: string): Promise<ItemAspectsResponse> {
    try {
        const response = await axios.get(
            `http://localhost:8000/api/ebay/category/${categoryId}/aspects`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching item aspects:', error);
        throw error;
    }
}

export function organizeAspects(aspects: ItemAspect[]) {
    return {
        required: aspects.filter(aspect => aspect.aspectConstraint.aspectRequired),
        recommended: aspects.filter(
            aspect => !aspect.aspectConstraint.aspectRequired && 
                     aspect.aspectConstraint.aspectUsage === 'RECOMMENDED'
        ),
        optional: aspects.filter(
            aspect => !aspect.aspectConstraint.aspectRequired && 
                     aspect.aspectConstraint.aspectUsage === 'OPTIONAL'
        )
    };
}

export interface ItemSpecific {
    name: string;
    value: string;
}

export function formatItemSpecifics(specifics: Record<string, string>): ItemSpecific[] {
    return Object.entries(specifics).map(([name, value]) => ({
        name,
        value
    }));
}
