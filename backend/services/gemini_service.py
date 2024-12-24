import os
import google.generativeai as genai
from typing import Dict, List, Optional, Tuple
import json
from difflib import SequenceMatcher
import re

class GeminiService:
    def __init__(self):
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        self.model = genai.GenerativeModel('gemini-pro')
        
    async def get_item_specific_value(self, aspect_name: str, context: Dict) -> Tuple[str, float]:
        """Get a specific item aspect value using Gemini with confidence score"""
        try:
            # Build context-aware prompt
            prompt = self._build_aspect_prompt(aspect_name, context)
            
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,  # Lower temperature for more focused responses
                    candidate_count=1,
                    stop_sequences=["\n"]  # Stop at newline to get just the value
                )
            )
            
            value = response.text.strip()
            confidence = self._calculate_confidence(value, aspect_name, context)
            
            return value, confidence
            
        except Exception as e:
            print(f"Error getting item specific value: {str(e)}")
            return "", 0.0
            
    async def get_multiple_item_specifics(self, aspects: List[Dict], context: Dict) -> Dict[str, Dict]:
        """Get multiple item specific values with confidence scores"""
        try:
            # Build a comprehensive prompt for all aspects
            prompt = self._build_multiple_aspects_prompt(aspects, context)
            
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    candidate_count=1
                )
            )
            
            try:
                # Parse the response as JSON with confidence scores
                suggestions = json.loads(response.text)
                
                # Calculate confidence scores for each suggestion
                results = {}
                for aspect in aspects:
                    name = aspect["name"]
                    if name in suggestions:
                        value = suggestions[name]
                        confidence = self._calculate_confidence(value, name, context)
                        results[name] = {
                            "value": value,
                            "confidence": confidence,
                            "source": self._determine_value_source(value, context)
                        }
                
                return results
                
            except json.JSONDecodeError:
                # Fallback: try to parse line by line
                results = {}
                lines = response.text.split('\n')
                for line in lines:
                    if ':' in line:
                        name, value = line.split(':', 1)
                        name = name.strip()
                        value = value.strip()
                        confidence = self._calculate_confidence(value, name, context)
                        results[name] = {
                            "value": value,
                            "confidence": confidence,
                            "source": self._determine_value_source(value, context)
                        }
                return results
                
        except Exception as e:
            print(f"Error getting multiple item specifics: {str(e)}")
            return {}
            
    def _build_aspect_prompt(self, aspect_name: str, context: Dict) -> str:
        """Build an enhanced prompt for a single aspect"""
        # Extract all available context
        title = context.get('title', '')
        description = context.get('description', '')
        upc = context.get('upc', '')
        quantity = context.get('quantity', '')
        brand = context.get('brand', '')
        model = context.get('model', '')
        color = context.get('color', '')
        size = context.get('size', '')
        dimension = context.get('dimensions', '')
        weight = context.get('weight', '')
        images = context.get('images', [])
        category = context.get('category', '')
        previous_values = context.get('previous_values', {})
        
        # Extract keywords and additional attributes
        keywords = self._extract_keywords(context)
        additional_attrs = self._format_additional_attributes(context)
        
        prompt = f"""Create an optimized product listing value for the following aspect: {aspect_name}

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
Image URLs: {', '.join(images) if images else ''}
Tag Keywords: {', '.join(keywords)}
Category: {category}
Additional Attributes:
{additional_attrs}

Previous Successful Values:
{self._format_previous_values(previous_values)}

Required Output:
Provide ONLY the value for {aspect_name}. Do not include any explanations or additional text.
If you cannot determine a confident value, respond with an empty string.

Important Guidelines:
1. Be specific and accurate
2. Use standard industry terminology
3. Follow eBay's format requirements
4. Consider category-specific conventions
5. Ensure the value is appropriate for {aspect_name}

Value:"""

        return prompt
        
    def _build_multiple_aspects_prompt(self, aspects: List[Dict], context: Dict) -> str:
        """Build an enhanced prompt for multiple aspects"""
        # Extract all available context
        title = context.get('title', '')
        description = context.get('description', '')
        upc = context.get('upc', '')
        quantity = context.get('quantity', '')
        brand = context.get('brand', '')
        model = context.get('model', '')
        color = context.get('color', '')
        size = context.get('size', '')
        dimension = context.get('dimensions', '')
        weight = context.get('weight', '')
        images = context.get('images', [])
        category = context.get('category', '')
        previous_values = context.get('previous_values', {})
        
        # Extract keywords and additional attributes
        keywords = self._extract_keywords(context)
        additional_attrs = self._format_additional_attributes(context)
        
        # Format aspects with their constraints
        aspects_info = []
        for aspect in aspects:
            constraints = []
            if aspect.get('data_type'):
                constraints.append(f"Type: {aspect['data_type']}")
            if aspect.get('format'):
                constraints.append(f"Format: {aspect['format']}")
            if aspect.get('max_length'):
                constraints.append(f"Max Length: {aspect['max_length']}")
            if aspect.get('required'):
                constraints.append("Required: Yes")
            
            aspects_info.append(f"- {aspect['name']}" + (f" ({', '.join(constraints)})" if constraints else ""))

        prompt = f"""Create optimized product listing values for multiple aspects.

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
Image URLs: {', '.join(images) if images else ''}
Tag Keywords: {', '.join(keywords)}
Category: {category}
Additional Attributes:
{additional_attrs}

Previous Successful Values:
{self._format_previous_values(previous_values)}

Required Aspects:
{chr(10).join(aspects_info)}

Required Output Format:
Respond with a JSON object where:
- Keys are the aspect names
- Values are the suggested values
- Use empty string if uncertain about any value

Example format:
{{
    "Color": "Metallic Blue",
    "Size": "Large",
    "Material": ""
}}

Important Guidelines:
1. Be specific and accurate for each aspect
2. Use standard industry terminology
3. Follow the format requirements for each aspect
4. Consider category-specific conventions
5. Ensure values are appropriate for their aspects
6. If uncertain about any value, use an empty string

Response:"""

        return prompt

    def _format_additional_attributes(self, context: Dict) -> str:
        """Format additional attributes from context"""
        additional = context.get('additional_attributes', {})
        if not additional:
            return "None"
            
        return "\n".join([f"- {key}: {value}" for key, value in additional.items()])

    def _calculate_confidence(self, value: str, aspect_name: str, context: Dict) -> float:
        """Calculate confidence score for a suggested value"""
        if not value:
            return 0.0
            
        confidence = 0.0
        value_lower = value.lower()
        
        # Check title match (30%)
        title = context.get('title', '').lower()
        if value_lower in title:
            confidence += 0.3
            
        # Check description match (20%)
        description = context.get('description', '').lower()
        if value_lower in description:
            confidence += 0.2
            
        # Check previous values (20%)
        previous_values = context.get('previous_values', {})
        if aspect_name in previous_values:
            similarity = SequenceMatcher(None, value_lower, previous_values[aspect_name].lower()).ratio()
            confidence += similarity * 0.2
            
        # Check category relevance (15%)
        category = context.get('category', '').lower()
        if value_lower in category:
            confidence += 0.15
            
        # Check format and length (15%)
        if self._is_well_formatted(value):
            confidence += 0.15
            
        return min(confidence, 1.0)

    def _determine_value_source(self, value: str, context: Dict) -> str:
        """Determine where the value came from"""
        if not value:
            return "none"
            
        value_lower = value.lower()
        
        if value_lower in context.get('title', '').lower():
            return "title"
        elif value_lower in context.get('description', '').lower():
            return "description"
        elif value_lower in str(context.get('previous_values', {})).lower():
            return "previous_values"
        else:
            return "ai_generated"

    def _extract_keywords(self, context: Dict) -> List[str]:
        """Extract relevant keywords from context"""
        text = f"{context.get('title', '')} {context.get('description', '')}"
        
        # Remove common words and punctuation
        text = re.sub(r'[^\w\s]', ' ', text)
        words = text.lower().split()
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with'}
        keywords = [word for word in words if word not in stop_words]
        
        return list(set(keywords))  # Remove duplicates

    def _format_previous_values(self, values: Dict) -> str:
        """Format previous successful values"""
        if not values:
            return "No previous values available"
            
        return "\n".join([f"- {name}: {value}" for name, value in values.items()])

    def _is_well_formatted(self, value: str) -> bool:
        """Check if value follows common formatting patterns"""
        # Check if it's a proper sentence case or title case
        if value[0].isupper() and any(c.islower() for c in value[1:]):
            return True
            
        # Check if it's a number with common units
        if re.match(r'^\d+(\.\d+)?\s*(cm|mm|in|kg|g|oz|lb|ml|L)?$', value):
            return True
            
        # Check if it's a date in common formats
        if re.match(r'^\d{4}(-\d{2}){0,2}$', value):
            return True
            
        return False

    def validate_aspect_value(self, value: str, aspect: Dict) -> bool:
        """Validate an aspect value against its constraints"""
        if not value:
            return True  # Empty values are considered valid (but may fail required check later)
            
        # Check max length
        if aspect.get('max_length') and len(value) > aspect['max_length']:
            return False
            
        # Check data type
        data_type = aspect.get('data_type', 'STRING')
        if data_type == 'NUMBER':
            try:
                float(value)
            except ValueError:
                return False
        elif data_type == 'DATE':
            # Basic date format validation
            format_length = {
                'YYYY': 4,
                'YYYYMM': 6,
                'YYYYMMDD': 8
            }.get(aspect.get('format'))
            
            if format_length and len(value) != format_length:
                return False
                
            try:
                int(value)
            except ValueError:
                return False
                
        return True
