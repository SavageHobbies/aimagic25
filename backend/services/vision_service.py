from google.cloud import vision
import io
import os
from typing import List, Dict, Any
import json

class VisionService:
    def __init__(self):
        self.client = vision.ImageAnnotatorClient()

    async def analyze_image(self, image_content: bytes) -> Dict[str, Any]:
        """
        Analyze an image using Google Cloud Vision API
        Returns detailed information about the product in the image
        """
        try:
            image = vision.Image(content=image_content)
            
            # Perform multiple types of detection
            response = self.client.annotate_image({
                'image': image,
                'features': [
                    {'type_': vision.Feature.Type.OBJECT_LOCALIZATION},
                    {'type_': vision.Feature.Type.LABEL_DETECTION},
                    {'type_': vision.Feature.Type.TEXT_DETECTION},
                    {'type_': vision.Feature.Type.IMAGE_PROPERTIES},
                ]
            })

            # Extract relevant information
            result = {
                'objects': [
                    {
                        'name': obj.name,
                        'confidence': obj.score,
                        'vertices': [[vertex.x, vertex.y] for vertex in obj.bounding_poly.normalized_vertices]
                    }
                    for obj in response.localized_object_annotations
                ],
                'labels': [
                    {
                        'description': label.description,
                        'confidence': label.score,
                    }
                    for label in response.label_annotations
                ],
                'text': [
                    text.description
                    for text in response.text_annotations
                ],
                'colors': [
                    {
                        'color': {
                            'red': color.color.red,
                            'green': color.color.green,
                            'blue': color.color.blue
                        },
                        'score': color.score,
                        'pixel_fraction': color.pixel_fraction
                    }
                    for color in response.image_properties_annotation.dominant_colors.colors
                ]
            }

            return result

        except Exception as e:
            raise Exception(f"Error analyzing image: {str(e)}")

    def extract_product_details(self, vision_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract relevant product details from Vision API results
        """
        # Get the most confident object detection
        main_object = (
            vision_result['objects'][0]['name']
            if vision_result['objects']
            else vision_result['labels'][0]['description']
            if vision_result['labels']
            else None
        )

        # Get relevant labels (excluding generic ones)
        relevant_labels = [
            label['description']
            for label in vision_result['labels']
            if label['confidence'] > 0.7
        ]

        # Extract any visible text (could be brand names, model numbers, etc.)
        text_content = vision_result['text'][1:] if len(vision_result['text']) > 1 else []

        # Get dominant colors
        colors = [
            f"{color['color']['red']}, {color['color']['green']}, {color['color']['blue']}"
            for color in vision_result['colors'][:3]
        ]

        return {
            'main_object': main_object,
            'attributes': relevant_labels,
            'detected_text': text_content,
            'dominant_colors': colors
        }
