import requests
from flask import request
from flask_login import current_user
from flask_restful import Resource, marshal, reqparse

from config import get_env
from controllers.console import api
from controllers.console.explore.wraps import InstalledAppResource
from controllers.console.setup import setup_required
from controllers.console.wraps import account_initialization_required
import json

from controllers.web.error import NotChatAppError
from fields.agent_flow_fields import agent_register_fields
from libs import helper
from libs.helper import uuid_value
from libs.login import login_required
from models.model import AppMode
from services.agent_flow_service import AgentRegisterService


class AgentListApi(Resource):

    @setup_required
    @login_required
    @account_initialization_required
    def get(self):
        page = request.args.get('page', default=1, type=int)
        limit = request.args.get('limit', default=100, type=int)
        datasets, total = AgentRegisterService.get_agent_register_list(page, limit)
        results = marshal(datasets, agent_register_fields)
        data_dict = {}
        for row in results:
            print(row)
            _key = row["class_name"] + '_' + row["agent_name"] + '_' + row["agent_type"]
            if _key in data_dict:
                condition_mapping = json.loads(row["condition_mapping"]) if row["condition_mapping"] else []
                multi_version = {
                    "id": row["id"],
                    "version": row["version"],
                    "condition_mapping": condition_mapping,
                    "desc": row["desc"],
                    "agent_chinese_name": row["agent_chinese_name"]
                }
                data_dict[_key]["multi_version"].append(multi_version)
            else:
                condition_mapping = json.loads(row["condition_mapping"]) if row["condition_mapping"] else []
                data_dict[_key] = {
                    "agent_name": row["agent_name"],
                    "agent_type": row["agent_type"],
                    "class_name": row["class_name"],
                    "multi_version": [
                        {
                            "id": row["id"],
                            "version": row["version"],
                            "condition_mapping": condition_mapping,
                            "desc": row["desc"],
                            "agent_chinese_name": row["agent_chinese_name"]
                        }
                    ]
                }
        data = [value for _, value in data_dict.items()]
        response = {
            'data': data,
        }
        return response, 200


class AgentExecApi(InstalledAppResource):

    @setup_required
    @login_required
    @account_initialization_required
    def post(self, installed_app):
        app_model = installed_app.app
        app_mode = AppMode.value_of(app_model.mode)
        parser = reqparse.RequestParser()
        parser.add_argument('conversation_id', nullable=False, required=True, type=uuid_value)
        parser.add_argument('inputs', type=dict, required=False, location='json')
        parser.add_argument('query', type=str, required=True, location='json')
        parser.add_argument('files', type=list, required=False, location='json')
        parser.add_argument('retriever_from', type=str, required=False, default='explore_app', location='json')
        args = parser.parse_args()
        args['auto_generate_name'] = False
        response = self.generate(app_model.id, args)
        return helper.compact_generate_response(response)

    def generate(self, installed_app_id, args):
        url = get_env('AGENT_SERVICE') + "/api/v1/chat"
        headers = {
            'Content-Type': "application/json",
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
        data_body = {
            "appId": installed_app_id,
            "conversationId": args["conversation_id"],
            "collection": "shelby",
            "stream": True,
            "messages": [
                {
                    "messageId": "f2DXiArt893IRyvAPhB1lQ2J",
                    "role": "user",
                    "content": args["query"],
                    "userId": current_user.id
                }
            ]
        }
        res = requests.post(url, data=json.dumps(data_body), headers=headers, stream=True)
        for line in res.iter_lines():
            _mesage_info = {"event": "message", "id": "6bcc4d68-2f1f-4c79-b31e-b298590804a8",
                            "task_id": "94e397e8-ce95-4870-81c4-f45c724ef795",
                            "message_id": "6bcc4d68-2f1f-4c79-b31e-b298590804a8",
                            "answer": "", "created_at": 1715759893,
                            "conversation_id": "093cd682-5463-4b92-bfc0-61f32c100318"}
            if line:
                line = line.decode('utf-8')
                if "data: " in line:
                    line_obj = json.loads(line.replace("data: ", ""))
                    if isinstance(line_obj, dict) and line_obj.get("status", "") == "start" and "event_ch" in line_obj:
                        _mesage_info["event"] = "process"
                        _mesage_info["answer"] = line_obj.get("event_ch", "")
                        yield f"data: {_mesage_info}"
                    if isinstance(line_obj, dict) and line_obj.get("status", "") == "running" and "content" in line_obj:
                        _mesage_info["answer"] = line_obj.get("content", "")
                        yield f"data: {_mesage_info}"
                    if isinstance(line_obj, list):
                        for item in line_obj:
                            if isinstance(item, dict) and "documentList" in item:
                                _mesage_info["event"] = "quote"
                                _mesage_info["documentList"] = item.get("documentList", "")
                                yield f"data: {_mesage_info}"


api.add_resource(AgentListApi, '/agent')
api.add_resource(AgentExecApi, '/installed-apps/<uuid:installed_app_id>/agent-messages')
