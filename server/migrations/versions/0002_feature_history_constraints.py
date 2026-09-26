"""Feature history integrity.

Revision ID: 0002_feature_history_constraints
Revises: 0001_initial
"""

from typing import Sequence
from alembic import op
import sqlalchemy as sa

revision: str = '0002_feature_history_constraints'
down_revision: str | Sequence[str] | None = '0001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_unique_constraint('uq_feature_versions_feature_version', 'feature_versions', ['feature_id', 'version'])
    op.create_check_constraint('ck_features_version_positive', 'features', 'version > 0')


def downgrade() -> None:
    op.drop_constraint('ck_features_version_positive', 'features', type_='check')
    op.drop_constraint('uq_feature_versions_feature_version', 'feature_versions', type_='unique')
