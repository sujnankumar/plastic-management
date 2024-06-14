"""empty message

Revision ID: 12f5ff773c92
Revises: a9828a837b14
Create Date: 2024-06-12 21:37:41.892766

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '12f5ff773c92'
down_revision = 'a9828a837b14'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_role_request', schema=None) as batch_op:
        batch_op.add_column(sa.Column('business_contact', sa.String(length=15), nullable=False))
        batch_op.drop_column('business_phno')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_role_request', schema=None) as batch_op:
        batch_op.add_column(sa.Column('business_phno', sa.VARCHAR(length=15), nullable=False))
        batch_op.drop_column('business_contact')

    # ### end Alembic commands ###