from rest_framework.renderers import JSONRenderer

class StandardEnvelopeRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        request = renderer_context.get('request') if renderer_context else None
        
        # Exclude OpenAPI schema and Swagger visualizer endpoints
        path = request.path if request else ''
        if '/api/schema' in path:
            return super().render(data, accepted_media_type, renderer_context)
            
        status_code = response.status_code if response else 200
        success = 200 <= status_code < 300
        
        # If the response is already enveloped (e.g. custom error structure)
        if isinstance(data, dict) and ('success' in data or 'errors' in data):
            return super().render(data, accepted_media_type, renderer_context)
            
        if success:
            envelope = {
                'success': True,
                'data': data
            }
        else:
            envelope = {
                'success': False,
                'errors': data
            }
            # Provide a top-level message if detail exists
            if isinstance(data, dict):
                if 'detail' in data:
                    envelope['message'] = str(data['detail'])
                elif 'message' in data:
                    envelope['message'] = str(data['message'])
                elif 'error' in data:
                    envelope['message'] = str(data['error'])
                else:
                    keys = list(data.keys())
                    if keys:
                        first_key = keys[0]
                        first_val = data[first_key]
                        if isinstance(first_val, list) and len(first_val) > 0:
                            first_val = first_val[0]
                        envelope['message'] = f"{first_key}: {first_val}"
                    else:
                        envelope['message'] = "Validation failed."
            else:
                envelope['message'] = str(data)
                
        return super().render(envelope, accepted_media_type, renderer_context)
