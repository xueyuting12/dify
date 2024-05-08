from flask_restful import fields

from libs.helper import TimestampField

agent_flow_fields = {
    'id': fields.String,
    'name': fields.String,
    'description': fields.String,
    'created_by': fields.String,
    'created_at': TimestampField,
    'updated_by': fields.String,
    'updated_at': TimestampField
}

agent_flow_version_fields = {
    'id': fields.String,
    'agent_flow_id': fields.String,
    'version': fields.String,
    'flow_content': fields.String,
    'created_by': fields.String,
    'created_at': TimestampField,
    'updated_by': fields.String,
    'updated_at': TimestampField
}

agent_flow_version_list_fields = {
    'id': fields.String,
    'agent_flow_id': fields.String,
    'version': fields.String,
    'created_by': fields.String,
    'created_at': TimestampField,
    'updated_by': fields.String,
    'updated_at': TimestampField
}

agent_register_fields = {
    'id': fields.String,
    'class_name': fields.String,
    'agent_name': fields.String,
    'agent_chinese_name': fields.String,
    'desc': fields.String,
    'version': fields.String,
    'agent_type': fields.String,
    'condition_mapping': fields.String,
}
