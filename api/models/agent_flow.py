import json

from sqlalchemy.dialects.postgresql import UUID

from extensions.ext_database import db


class AgentFlow(db.Model):
    __tablename__ = 'agent_flow'
    __table_args__ = (
        db.PrimaryKeyConstraint('id', name='agent_flow_pkey'),
    )

    id = db.Column(UUID, server_default=db.text('uuid_generate_v4()'))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False,
                           server_default=db.text('CURRENT_TIMESTAMP(0)'))
    updated_by = db.Column(db.String(255), nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False,
                           server_default=db.text('CURRENT_TIMESTAMP(0)'))


class AgentFlowVersion(db.Model):
    __tablename__ = 'agent_flow_version'
    __table_args__ = (
        db.PrimaryKeyConstraint('id', name='agent_flow_version_pkey'),
        db.Index('agent_flow_data_id_idx', 'agent_flow_id', 'version'),
    )

    id = db.Column(UUID, server_default=db.text('uuid_generate_v4()'))
    agent_flow_id = db.Column(UUID, nullable=False)
    version = db.Column(db.String(255), nullable=False)
    flow_content = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False,
                           server_default=db.text('CURRENT_TIMESTAMP(0)'))
    updated_by = db.Column(db.String(255), nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False,
                           server_default=db.text('CURRENT_TIMESTAMP(0)'))

    @property
    def flow_content_dict(self):
        return json.loads(self.flow_content) if self.flow_content else None


class AgentFlowThirdPartyAPIConfig(db.Model):
    __tablename__ = 'agent_flow_third_party_api_config'
    __table_args__ = (
        db.PrimaryKeyConstraint('id', name='agent_flow_api_config_pkey'),
        db.UniqueConstraint('sign', name='agent_flow_api_config_sign_key'),  # 添加唯一约束
    )

    id = db.Column(UUID, server_default=db.text('uuid_generate_v4()'))
    sign = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    url = db.Column(db.Text, nullable=False)
    method = db.Column(db.String(255), nullable=False)
    headers = db.Column(db.Text, nullable=False)
    param_data = db.Column(db.Text, nullable=False)

    @property
    def headers_dict(self):
        return json.loads(self.headers) if self.headers else None

    @property
    def param_data_dict(self):
        return json.loads(self.param_data) if self.param_data else None


class AgentRegister(db.Model):
    __tablename__ = 'agent_register'
    __table_args__ = (
        db.PrimaryKeyConstraint('id', name='agent_register_pkey'),
        db.UniqueConstraint('class_name', 'agent_name', 'agent_type', 'version', name='unique_agent_register_idx')
    )

    id = db.Column(UUID, server_default=db.text('uuid_generate_v4()'))
    class_name = db.Column(db.String(255), nullable=False)
    agent_name = db.Column(db.String(255), nullable=False)
    agent_chinese_name = db.Column(db.String(255), nullable=False)
    desc = db.Column(db.Text, nullable=True)
    version = db.Column(db.String(255), nullable=False)
    agent_type = db.Column(db.String(255), nullable=False)
    condition_mapping = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False,
                           server_default=db.text('CURRENT_TIMESTAMP(0)'))
    updated_by = db.Column(db.String(255), nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False,
                           server_default=db.text('CURRENT_TIMESTAMP(0)'))
