from typing import Dict, List, Optional
import os
import google.generativeai as genai

class ListingOptimizer:
    def __init__(self):
        # Configure the Gemini API
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        # Use the most capable model - Gemini Pro
        self.model = genai.GenerativeModel('gemini-pro')

    def create_optimization_prompt(self, product_data: Dict, top_listing: Dict) -> str:
        # Combine product data with top performing listing data
        title = product_data.get('title', '')
        description = product_data.get('description', '')
        upc = product_data.get('upc', '')
        quantity = product_data.get('quantity', 1)
        brand = product_data.get('brand', '')
        
        # Get additional attributes from top listing
        item_specifics = top_listing.get('itemSpecifics', {})
        tag_keywords = top_listing.get('keywords', [])
        
        # Extract model, color, size, etc. from item specifics
        model = item_specifics.get('Model', '')
        color = item_specifics.get('Color', '')
        size = item_specifics.get('Size', '')
        dimension = item_specifics.get('Dimensions', '')
        weight = item_specifics.get('Weight', '')
        
        # Format item specifics for prompt
        item_specifics_str = '\n'.join([f"{k}: {v}" for k, v in item_specifics.items()])
        
        # Format additional attributes
        additional_attrs = '\n'.join([
            f"{k}: {v}" for k, v in product_data.items() 
            if k not in ['title', 'description', 'upc', 'quantity', 'brand', 'images']
        ])

        # Construct the prompt
        return f'''Create an optimized product listing for the following product, strictly adhering to the specified format:

Product Details:

Title: {title}
Short Description: {description}
Description: {description}
UPC: {upc}
Quantity: {quantity}
Brand: {brand}
Model: {model}
Color: {color}
Size: {size}
Dimensions: {dimension}
Weight: {weight}
Tag Keywords: {', '.join(tag_keywords)}
Additional Attributes:
{additional_attrs}

Listing Sections:

Title: (up to 80 characters, including spaces)
- Create an attention-grabbing, Keyword Rich, SEO-optimized title that is descriptive and persuasive.

Short Description: (up to 150 characters)
- Write a concise, compelling summary of the product.

Description: (up to 2000 characters)
- Write a detailed, informative, and persuasive product description.
- Incorporate any relevant category-specific information seamlessly into the description without explicitly labeling it as category-specific.
- Use bullet points to highlight key features and specifications.
- Organize into concise paragraphs for readability.
- Include relevant measurements (if applicable).
- Mention the item's condition (new or used).
- Incorporate a clear "Add to Cart" call to action to encourage potential buyers.

Unique Selling Points:
- List 3-5 unique selling points.

Key Features:
- List 3-5 key features of the product

Specifications:
- List 3-5 important specifications of the product

Item Specifics:
{item_specifics_str}

Tags:
- Generate a mix of 10-20 broad and specific tags, focusing on the product's key features, brand, and category.
- List each tag on a new line starting with a dash (-).
- Generate SEO keywords for the product.

Additional Attributes:
- List any additional attributes not covered in Item Specifics, one per line in the format "Attribute: Value".

Tone and Style:
- Maintain a friendly and approachable tone throughout the listing.'''

    async def optimize_listing(self, product_data: Dict, top_listing: Dict) -> Dict:
        """
        Optimize a product listing using Google's Gemini 2.0
        """
        try:
            # Create the prompt
            prompt = self.create_optimization_prompt(product_data, top_listing)
            
            # Get Gemini completion
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    candidate_count=1,
                )
            )
            
            # Parse the response
            optimized_content = response.text
            
            # Extract sections
            sections = self.parse_optimization_response(optimized_content)
            
            return {
                "success": True,
                "optimized_listing": sections
            }
            
        except Exception as e:
            print(f"Error optimizing listing: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def parse_optimization_response(self, response: str) -> Dict:
        """
        Parse the Gemini response into structured sections
        """
        sections = {}
        current_section = None
        current_content = []
        
        for line in response.split('\n'):
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue
                
            # Check if this is a section header
            if line.endswith(':'):
                # Save previous section
                if current_section:
                    sections[current_section] = '\n'.join(current_content).strip()
                
                # Start new section
                current_section = line[:-1]  # Remove the colon
                current_content = []
            else:
                # Add content to current section
                current_content.append(line)
        
        # Save the last section
        if current_section:
            sections[current_section] = '\n'.join(current_content).strip()
            
        return sections
