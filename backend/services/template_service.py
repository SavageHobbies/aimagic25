import os
from typing import Dict, List, Optional
import httpx
from bs4 import BeautifulSoup

class TemplateService:
    def __init__(self):
        self.template_base_url = "ebay.by1.net/templates/"
        self.templates = {
            'art': 'art-ebay-template.html',
            'auto': 'auto-ebay-template.html',
            'clothing': 'clothing-ebay-template.html',
            'collectibles': 'collectibles-ebay-template.html',
            'digital': 'digital-ebay-template.html',
            'electronics': 'electronics-ebay-template.html',
            'funko': 'funko-ebay-template.html',
            'funko-return': 'funko-return-ebay-template.html',
            'health-beauty': 'health-beauty-ebay-template.html',
            'home-goods': 'home-goods-ebay-template.html',
            'jewelry': 'jewelry-ebay-template.html',
            'lawn': 'lawn-ebay-template.html',
            'pets': 'pets-ebay-template.html',
            'stamps-coins': 'stamps-coins-ebay-template.html',
            'supplements': 'supliments-ebay-template.html',
            'toys': 'toys-ebay-template.html',
            'vintage': 'vintage-ebay-template.html'
        }

    async def get_template(self, category: str) -> Optional[str]:
        """
        Fetch the HTML template for a given category
        """
        if category not in self.templates:
            return None

        template_url = f"{self.template_base_url}/{self.templates[category]}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(template_url)
                response.raise_for_status()
                return response.text
        except Exception as e:
            print(f"Error fetching template: {str(e)}")
            return None

    def fill_template(self, template: str, data: Dict) -> str:
        """
        Fill the template with product data
        """
        soup = BeautifulSoup(template, 'html.parser')

        # Replace common placeholders
        replacements = {
            '{{title}}': data.get('title', ''),
            '{{condition}}': data.get('condition', ''),
            '{{description}}': data.get('description', ''),
            '{{brand}}': data.get('brand', ''),
            '{{model}}': data.get('model', ''),
            '{{features}}': data.get('features', []),
            '{{shipping}}': data.get('shipping', {}),
            '{{returns}}': data.get('returns', {}),
            '{{payment}}': data.get('payment', {}),
        }

        # Special handling for Funko Pop templates
        if 'funko' in template.lower():
            funko_replacements = {
                '{{pop_number}}': data.get('popNumber', ''),
                '{{series}}': data.get('series', ''),
                '{{character}}': data.get('character', ''),
                '{{exclusive}}': data.get('exclusiveRelease', ''),
                '{{box_condition}}': data.get('boxCondition', ''),
                '{{box_damage}}': ', '.join(data.get('boxDamage', [])) if data.get('boxDamage') else 'None',
                '{{features}}': ', '.join(data.get('features', [])),
                '{{year_released}}': data.get('yearReleased', ''),
                '{{vaulted}}': 'Yes' if data.get('vaulted') else 'No'
            }
            replacements.update(funko_replacements)

        # Replace all placeholders in the template
        html = template
        for key, value in replacements.items():
            html = html.replace(key, str(value))

        # Handle image gallery
        if data.get('images'):
            gallery_div = soup.find('div', {'class': 'gallery'})
            if gallery_div:
                gallery_div.clear()
                for img_url in data['images']:
                    img_tag = soup.new_tag('img', src=img_url)
                    gallery_div.append(img_tag)

        return str(soup)

    def get_available_templates(self) -> List[str]:
        """
        Get list of all available template categories
        """
        return list(self.templates.keys())
