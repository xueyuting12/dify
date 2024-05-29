import json
import logging
import time
import uuid
from typing import Any, Union

import requests
from flask_login import current_user

from config import get_env
from core.app.app_config.easy_ui_based_app.model_config.converter import ModelConfigConverter
from core.app.app_config.features.file_upload.manager import FileUploadConfigManager
from core.app.apps.custom_agent.app_config_manager import CustomAgentAppConfigManager
from core.app.apps.message_based_app_generator import MessageBasedAppGenerator
from core.app.entities.app_invoke_entities import InvokeFrom, CustomAgentAppGenerateEntity
from core.file.message_file_parser import MessageFileParser

from models.account import Account
from models.model import App, EndUser
from services.api_agent_service import ApiAgentAppService, ApiAgentRegisterService

logger = logging.getLogger(__name__)


class CustomAgentAppGenerator(MessageBasedAppGenerator):
    def generate(self, app_model: App,
                 user: Union[Account, EndUser],
                 args: Any,
                 invoke_from: InvokeFrom,
                 stream: bool = True):
        """
        Generate App response.

        :param app_model: App
        :param user: account or end user
        :param args: request args
        :param invoke_from: invoke from source
        :param stream: is stream
        """
        if not stream:
            raise ValueError('Agent Chat App does not support blocking mode')

        if not args.get('query'):
            raise ValueError('query is required')

        query = args['query']
        if not isinstance(query, str):
            raise ValueError('query must be a string')

        query = query.replace('\x00', '')
        inputs = args['inputs']

        extras = {
            "auto_generate_conversation_name": args['auto_generate_name'] if 'auto_generate_name' in args else True
        }

        # get conversation
        conversation = None
        if args.get('conversation_id'):
            conversation = self._get_conversation_by_user(app_model, args.get('conversation_id'), user)

        # get app model config
        app_model_config = self._get_app_model_config(
            app_model=app_model,
            conversation=conversation
        )

        # validate override model config
        override_model_config_dict = None
        if args.get('model_config'):
            if invoke_from != InvokeFrom.DEBUGGER:
                raise ValueError('Only in App debug mode can override model config')

            # validate config
            override_model_config_dict = CustomAgentAppConfigManager.config_validate(
                tenant_id=app_model.tenant_id,
                config=args.get('model_config')
            )

        # parse files
        files = args['files'] if 'files' in args and args['files'] else []
        message_file_parser = MessageFileParser(tenant_id=app_model.tenant_id, app_id=app_model.id)
        file_extra_config = FileUploadConfigManager.convert(override_model_config_dict or app_model_config.to_dict())
        if file_extra_config:
            file_objs = message_file_parser.validate_and_transform_files_arg(
                files,
                file_extra_config,
                user
            )
        else:
            file_objs = []

        # convert to app config
        app_config = CustomAgentAppConfigManager.get_app_config(
            app_model=app_model,
            app_model_config=app_model_config,
            conversation=conversation,
            override_config_dict=override_model_config_dict
        )

        # init application generate entity
        application_generate_entity = CustomAgentAppGenerateEntity(
            task_id=str(uuid.uuid4()),
            app_config=app_config,
            model_config=ModelConfigConverter.convert(app_config, True),
            conversation_id=conversation.id if conversation else None,
            inputs=conversation.inputs if conversation else self._get_cleaned_inputs(inputs, app_config),
            query=query,
            files=file_objs,
            user_id=user.id,
            stream=stream,
            invoke_from=invoke_from,
            extras=extras
        )

        # init generate records
        (
            conversation,
            message
        ) = self._init_generate_records(application_generate_entity, conversation)
        args["conversation_id"] = conversation.id
        response = self._generate(app_model.id, message.id, args)

        return response

    @staticmethod
    def _generate(app_id, message_id, args):
        capi_agent_app = ApiAgentAppService.get_api_agent_app(str(app_id))
        if capi_agent_app:
            api_agent = ApiAgentRegisterService.get_api_agent(capi_agent_app.api_agent_id)
            if api_agent:
                host = api_agent.host
                uri = api_agent.url
                collection = api_agent.url
                url = host + uri
                headers = {
                    'Content-Type': "application/json",
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
                data_body = {
                    "appId": app_id,
                    "conversationId": args["conversation_id"],
                    "collection": collection,
                    "stream": True,
                    "messages": [
                        {
                            "messageId": message_id,
                            "role": "user",
                            "content": args["query"],
                            "userId": current_user.id
                        }
                    ]
                }
                start_time = time.time()
                res = requests.post(url, data=json.dumps(data_body), headers=headers, stream=True)
                for line in res.iter_lines():
                    _mesage_info = {"event": "message", "id": message_id,
                                    "task_id": "",
                                    "message_id": message_id,
                                    "answer": "", "created_at": 1715759893,
                                    "conversation_id": args["conversation_id"]}
                    if line:
                        line = line.decode('utf-8')
                        if "data: " in line:
                            line_obj = json.loads(line.replace("data: ", ""))
                            if isinstance(line_obj, dict) and line_obj.get("status",
                                                                           "") == "start" and "event_ch" in line_obj:
                                _mesage_info["event"] = "process"
                                _mesage_info["answer"] = line_obj.get("event_ch", "")
                                _mesage_info["cost"] = time.time() - start_time
                                yield f"data: {json.dumps(_mesage_info)} \n\n"
                            if isinstance(line_obj, dict) and line_obj.get("status",
                                                                           "") == "running" and "content" in line_obj:
                                _mesage_info["answer"] = line_obj.get("content", "")
                                _mesage_info["cost"] = time.time() - start_time
                                yield f"data: {json.dumps(_mesage_info)} \n\n"
                            if isinstance(line_obj, list):
                                for item in line_obj:
                                    if isinstance(item, dict) and "documentList" in item:
                                        _mesage_info["event"] = "quote"
                                        _mesage_info["documentList"] = item.get("documentList", "")
                                        _mesage_info["cost"] = time.time() - start_time
                                        yield f"data: {json.dumps(_mesage_info)}\n\n"
            else:
                error_info = {"event": "message", "id": message_id,
                              "task_id": "",
                              "message_id": message_id,
                              "answer": "请联系管理员，自定义Agent未配置", "created_at": 1715759893,
                              "conversation_id": args["conversation_id"]}
                yield f"data: {error_info} \n\n"
        else:
            error_info = {"event": "message", "id": message_id,
                          "task_id": "",
                          "message_id": message_id,
                          "answer": "请联系管理员，自定义Agent未配置", "created_at": 1715759893,
                          "conversation_id": args["conversation_id"]}
            yield f"data: {error_info} \n\n"
