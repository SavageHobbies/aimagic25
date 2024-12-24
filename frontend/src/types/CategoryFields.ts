export interface BaseProduct {
    title: string;
    description: string;
    price: number;
    condition: string;
    brand?: string;
    upc?: string;
    category: string;
}

export interface ClothingProduct extends BaseProduct {
    size?: string;
    color?: string;
    material?: string;
    style?: string;
    gender?: 'Men' | 'Women' | 'Unisex';
    department?: string;
    type?: string;
}

export interface ElectronicsProduct extends BaseProduct {
    model?: string;
    features?: string[];
    connectivity?: string[];
    powerSource?: string;
    warranty?: string;
    compatibility?: string[];
}

export interface CollectiblesProduct extends BaseProduct {
    era?: string;
    authenticity?: string;
    certification?: string;
    grading?: string;
    serialNumber?: string;
}

export interface HomeAndGardenProduct extends BaseProduct {
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: 'in' | 'cm';
    };
    weight?: {
        value: number;
        unit: 'lbs' | 'kg';
    };
    material?: string;
    color?: string;
    pattern?: string;
    roomType?: string;
}

export interface SportsProduct extends BaseProduct {
    sport?: string;
    team?: string;
    player?: string;
    league?: string;
    season?: string;
    autographed?: boolean;
    memorabiliaType?: string;
}

export interface ToysProduct extends BaseProduct {
    ageRange?: string;
    character?: string;
    theme?: string;
    educational?: boolean;
    material?: string;
    batteryRequired?: boolean;
}

export interface BookProduct extends BaseProduct {
    author?: string;
    format?: 'Hardcover' | 'Paperback' | 'Digital';
    isbn?: string;
    publisher?: string;
    publicationYear?: number;
    language?: string;
    genre?: string;
}

export type CategorySpecificProduct = 
    | ClothingProduct 
    | ElectronicsProduct 
    | CollectiblesProduct 
    | HomeAndGardenProduct 
    | SportsProduct 
    | ToysProduct 
    | BookProduct;
