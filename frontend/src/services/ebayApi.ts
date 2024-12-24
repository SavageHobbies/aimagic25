import axios from 'axios';

const EBAY_API_URL = process.env.REACT_APP_EBAY_API_URL || 'https://api.ebay.com/ws/api.dll';

interface EbayListingData {
    Item: {
        Title: string;
        Description: string;
        PrimaryCategory: {
            CategoryID: string;
        };
        StartPrice: number | string;
        ConditionID: string;
        Country: string;
        Currency: string;
        DispatchTimeMax: number;
        ListingDuration: string;
        ListingType: string;
        PaymentMethods: string[];
        PayPalEmailAddress: string;
        PictureDetails: {
            PictureURL: string[];
        };
        PostalCode: string;
        Quantity: number;
        ReturnPolicy: {
            ReturnsAcceptedOption: string;
            RefundOption: string;
            ReturnsWithinOption: string;
            ShippingCostPaidByOption: string;
        };
        ShippingDetails: {
            ShippingServiceOptions: {
                ShippingServicePriority: number;
                ShippingService: string;
            }[];
        };
        ItemSpecifics: {
            NameValueList: {
                Name: string;
                Value: string;
            }[];
        };
    };
}

export async function createEbayListing(listingData: EbayListingData) {
    try {
        const response = await axios.post(
            EBAY_API_URL,
            {
                'AddItemRequest': {
                    '@xmlns': 'urn:ebay:apis:eBLBaseComponents',
                    'RequesterCredentials': {
                        'eBayAuthToken': process.env.REACT_APP_EBAY_AUTH_TOKEN
                    },
                    'ErrorLanguage': 'en_US',
                    'WarningLevel': 'High',
                    'Item': listingData.Item
                }
            },
            {
                headers: {
                    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                    'X-EBAY-API-CALL-NAME': 'AddItem',
                    'X-EBAY-API-SITEID': '0', // US site
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error creating eBay listing:', error);
        throw error;
    }
}

export async function getItemConditions(categoryId: string) {
    try {
        const response = await axios.post(
            EBAY_API_URL,
            {
                'GetCategoryFeaturesRequest': {
                    '@xmlns': 'urn:ebay:apis:eBLBaseComponents',
                    'RequesterCredentials': {
                        'eBayAuthToken': process.env.REACT_APP_EBAY_AUTH_TOKEN
                    },
                    'CategoryID': categoryId,
                    'DetailLevel': 'ReturnAll',
                    'ViewAllNodes': true
                }
            },
            {
                headers: {
                    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                    'X-EBAY-API-CALL-NAME': 'GetCategoryFeatures',
                    'X-EBAY-API-SITEID': '0',
                    'Content-Type': 'application/json'
                }
            }
        );

        const conditions = response.data?.Category?.ConditionValues?.Condition || [];
        return conditions.map((condition: any) => ({
            value: condition.ID,
            label: condition.DisplayName
        }));
    } catch (error) {
        console.error('Error fetching category conditions:', error);
        return [];
    }
}
