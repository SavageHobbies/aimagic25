// Map common categories to eBay category IDs
export const categoryToEbayId: Record<string, string> = {
    // Funko Pop categories
    'Funko Pop': '149372',  // Funko Pop category ID
    'Action Figures': '246',  // Action Figures category
    'Collectibles': '1',  // General Collectibles
    
    // Add more mappings as needed
    'Electronics': '293',
    'Clothing': '11450',
    'Toys': '220',
    'Books': '267'
};

export function getEbayCategoryId(category: string): string {
    // First try exact match
    if (categoryToEbayId[category]) {
        return categoryToEbayId[category];
    }

    // Try case-insensitive match
    const lowerCategory = category.toLowerCase();
    const match = Object.entries(categoryToEbayId).find(
        ([key]) => key.toLowerCase() === lowerCategory
    );
    if (match) {
        return match[1];
    }

    // Try to find a partial match
    const partialMatch = Object.entries(categoryToEbayId).find(
        ([key]) => category.toLowerCase().includes(key.toLowerCase()) ||
                   key.toLowerCase().includes(category.toLowerCase())
    );
    if (partialMatch) {
        return partialMatch[1];
    }

    // Default to collectibles if no match found
    console.warn(`No category mapping found for "${category}", defaulting to Collectibles`);
    return categoryToEbayId['Collectibles'];
}
