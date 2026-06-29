from rest_framework import serializers


class StrictSerializer(serializers.Serializer):
    """Reject requests that include fields not declared on the serializer."""

    def to_internal_value(self, data):
        if isinstance(data, dict):
            unknown = set(data.keys()) - set(self.fields.keys())
            if unknown:
                raise serializers.ValidationError(
                    {field: ['Unexpected field.'] for field in sorted(unknown)}
                )
        return super().to_internal_value(data)


class StrictModelSerializer(StrictSerializer, serializers.ModelSerializer):
    """ModelSerializer that rejects unexpected input fields."""

    def to_internal_value(self, data):
        if isinstance(data, dict):
            writable = {
                name
                for name, field in self.fields.items()
                if not field.read_only and name in data
            }
            unknown = set(data.keys()) - writable
            if unknown:
                raise serializers.ValidationError(
                    {field: ['Unexpected field.'] for field in sorted(unknown)}
                )
        return super(serializers.ModelSerializer, self).to_internal_value(data)


def strip_string_fields(attrs: dict) -> dict:
    for key, value in attrs.items():
        if isinstance(value, str):
            attrs[key] = value.strip()
    return attrs
