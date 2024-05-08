import json

from flask import request
from flask_login import current_user
from flask_restful import Resource, marshal, reqparse
from werkzeug.exceptions import NotFound, PreconditionFailed, Conflict

import services
from controllers.console import api
from controllers.console.datasets.error import AgentFlowNameDuplicateError
from controllers.console.setup import setup_required
from controllers.console.wraps import account_initialization_required

from fields.agent_flow_fields import agent_flow_fields, agent_flow_version_fields, agent_flow_version_list_fields
from libs.login import login_required
from services.agent_flow_service import AgentFlowService, AgentFlowVersionService, FlowDataChange


def _validate_name(name):
    if not name or len(name) < 1 or len(name) > 100:
        raise ValueError('Name must be between 1 to 100 characters.')
    return name


def _validate_description_length(description):
    if len(description) > 400:
        raise ValueError('Description cannot exceed 400 characters.')
    return description


class AgentFlowListApi(Resource):

    @setup_required
    @login_required
    @account_initialization_required
    def get(self):
        page = request.args.get('page', default=1, type=int)
        limit = request.args.get('limit', default=20, type=int)
        datasets, total = AgentFlowService.get_agent_flow_list(page, limit)

        data = marshal(datasets, agent_flow_fields)

        response = {
            'data': data,
            'has_more': len(datasets) == limit,
            'limit': limit,
            'total': total,
            'page': page
        }
        return response, 200

    @setup_required
    @login_required
    @account_initialization_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', nullable=False, required=True,
                            help='type is required. Name must be between 1 to 100 characters.',
                            type=_validate_name)
        parser.add_argument('description', type=str, required=False, nullable=False, location='json')
        args = parser.parse_args()

        try:
            agent_flow = AgentFlowService.create_agent_flow(
                name=args['name'],
                description=args['description'],
                account=current_user
            )
        except services.errors.agent_flow.AgentFlowNameDuplicateError:
            raise AgentFlowNameDuplicateError()

        return marshal(agent_flow, agent_flow_fields), 201

    @setup_required
    @login_required
    @account_initialization_required
    def patch(self, agent_flow_id):
        agent_flow_id_str = str(agent_flow_id)
        agent_flow = AgentFlowService.get_agent_flow(agent_flow_id_str)
        if agent_flow is None:
            raise NotFound("agent flow not found.")

        parser = reqparse.RequestParser()
        parser.add_argument('name', nullable=False,
                            help='type is required. Name must be between 1 to 40 characters.',
                            type=_validate_name)
        parser.add_argument('description',
                            location='json', store_missing=False,
                            type=_validate_description_length)
        args = parser.parse_args()

        agent_flow = AgentFlowService.update_agent_flow(agent_flow_id_str, args, current_user)

        if agent_flow is None:
            raise NotFound("agent flow not found.")

        return marshal(agent_flow, agent_flow_fields), 200

    @setup_required
    @login_required
    @account_initialization_required
    def delete(self, agent_flow_id):
        agent_flow_id_str = str(agent_flow_id)
        # Check if there is a predefined agent flow in place. If so, deletion should not be allowed
        flow_content = AgentFlowVersionService.get_agent_flow_version_list(agent_flow_id_str)
        if flow_content:
            raise Conflict("存在agent flow 不允许删除")
        if AgentFlowService.delete_agent_flow(agent_flow_id_str):
            return {'result': 'success'}, 204
        else:
            raise NotFound("Agent flow 找不到.")


class AgentFlowApi(Resource):

    @setup_required
    @login_required
    @account_initialization_required
    def patch(self, agent_flow_id):
        agent_flow_id_str = str(agent_flow_id)
        agent_flow = AgentFlowService.get_agent_flow(agent_flow_id_str)
        if agent_flow is None:
            raise NotFound("agent flow not found.")

        parser = reqparse.RequestParser()
        parser.add_argument('name', nullable=False,
                            help='type is required. Name must be between 1 to 40 characters.',
                            type=_validate_name)
        parser.add_argument('description',
                            location='json', store_missing=False,
                            type=_validate_description_length)
        args = parser.parse_args()

        agent_flow = AgentFlowService.update_agent_flow(agent_flow_id_str, args, current_user)

        if agent_flow is None:
            raise NotFound("agent flow not found.")

        return marshal(agent_flow, agent_flow_fields), 200

    @setup_required
    @login_required
    @account_initialization_required
    def delete(self, agent_flow_id):
        agent_flow_id_str = str(agent_flow_id)
        # Check if there is a predefined agent flow in place. If so, deletion should not be allowed
        flow_content = AgentFlowVersionService.get_agent_flow_version_list(agent_flow_id_str)
        if flow_content:
            raise Conflict("存在agent flow 不允许删除.")
        if AgentFlowService.delete_agent_flow(agent_flow_id_str):
            return {'result': 'success'}, 204
        else:
            raise NotFound("Agent flow not found.")


class AgentFlowVersionListApi(Resource):

    @setup_required
    @login_required
    @account_initialization_required
    def get(self):
        agent_flow_id = request.args.get('agent_flow_id', default=None, type=str)
        if not agent_flow_id:
            raise PreconditionFailed('Agent_flow_id is None')
        datasets = AgentFlowVersionService.get_agent_flow_version_list(agent_flow_id)

        data = marshal(datasets, agent_flow_version_list_fields)

        response = {
            'data': data,
        }
        return response, 200

    @setup_required
    @login_required
    @account_initialization_required
    def post(self):
        # snapshoot
        parser = reqparse.RequestParser()
        parser.add_argument('version', type=str, nullable=False, required=True, location='json')
        parser.add_argument('agent_flow_id', type=str, required=True, nullable=True, location='json')
        parser.add_argument('flow_content', type=str, required=True, nullable=True, location='json')

        args = parser.parse_args()
        flow_version = AgentFlowVersionService.get_agent_flow_version(args['agent_flow_id'], args['version'])
        if flow_version:
            if "snapshoot" in args['version']:
                agent_flow_version = AgentFlowVersionService.update_agent_flow_version(
                    version=args['version'],
                    agent_flow_id=args['agent_flow_id'],
                    flow_content=args['flow_content'],
                    user=current_user
                )
            else:
                raise Conflict("已定版的流，无法修改.")

        else:
            agent_flow_version = AgentFlowVersionService.create_agent_flow_version(
                version=args['version'],
                agent_flow_id=args['agent_flow_id'],
                flow_content=args['flow_content'],
                account=current_user
            )
        return marshal(agent_flow_version, agent_flow_version_fields), 201


class AgentFlowVersionApi(Resource):

    @setup_required
    @login_required
    @account_initialization_required
    def get(self, agent_flow_id, version):
        agent_flow_id_str = str(agent_flow_id)
        version_str = str(version)
        flow_version = AgentFlowVersionService.get_agent_flow_version(agent_flow_id_str, version_str)
        if flow_version is None:
            raise NotFound("agent flow not found.")
        # flow_content = json.loads(flow_version.flow_content)

        return marshal(flow_version, agent_flow_version_fields), 200

    @setup_required
    @login_required
    @account_initialization_required
    def delete(self, agent_flow_id, version):
        agent_flow_id_str = str(agent_flow_id)
        version_str = str(version)
        # Check if there is a predefined agent flow in place. If so, deletion should not be allowed
        if "snapshoot" not in version_str:
            raise Conflict("定版的流无法修改。")
        if AgentFlowVersionService.delete_agent_flow_version(agent_flow_id_str, version_str):
            return {'result': 'success'}, 204
        else:
            raise NotFound("agen flow not found.")


class OpenAgentFlowVersionApi(Resource):

    @setup_required
    @account_initialization_required
    def get(self, agent_flow_id, version):
        agent_flow_id_str = str(agent_flow_id)
        version_str = str(version)
        flow_version = AgentFlowVersionService.get_agent_flow_version(agent_flow_id_str, version_str)
        if flow_version is None:
            raise NotFound("agent flow not found.")
        flow_content = FlowDataChange.agent_flow_change(json.loads(flow_version.flow_content))

        return flow_content, 200


api.add_resource(AgentFlowListApi, '/agent_flow')
api.add_resource(AgentFlowApi, '/agent_flow/<uuid:agent_flow_id>')
api.add_resource(AgentFlowVersionListApi, '/agent_flow_version')
api.add_resource(AgentFlowVersionApi, '/agent_flow_version/<uuid:agent_flow_id>/<version>')
api.add_resource(OpenAgentFlowVersionApi, '/open/agent_flow_version/<uuid:agent_flow_id>/<version>')
