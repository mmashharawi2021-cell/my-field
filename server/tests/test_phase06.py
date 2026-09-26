import uuid

from app.schemas.feature import FeatureCreate


def test_feature_create_accepts_client_uuid_for_idempotent_sync():
    feature_id = uuid.uuid4()
    payload = FeatureCreate.model_validate({
        'id': str(feature_id),
        'geometry': {'type': 'Point', 'coordinates': [34.46, 31.51]},
        'properties': {'offline': True},
    })
    assert payload.id == feature_id


def test_feature_create_rejects_invalid_client_uuid():
    try:
        FeatureCreate.model_validate({'id': 'not-a-uuid', 'geometry': {'type': 'Point', 'coordinates': [34, 31]}})
    except ValueError:
        return
    raise AssertionError('invalid UUID accepted')

