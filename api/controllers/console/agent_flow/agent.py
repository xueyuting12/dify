from flask import request
from flask_restful import Resource, marshal

from controllers.console import api
from controllers.console.setup import setup_required
from controllers.console.wraps import account_initialization_required
import json

from fields.agent_flow_fields import agent_register_fields
from libs.login import login_required
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


api.add_resource(AgentListApi, '/agent')
