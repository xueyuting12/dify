from flask_restful import Resource, reqparse
from flask_login import current_user

from config import get_env
from controllers.console import api
from controllers.console.setup import setup_required
from controllers.inner_api.wraps import inner_api_only
from core.model_runtime.errors.validate import CredentialsValidateFailedError
from events.tenant_event import tenant_was_created
from libs.login import login_required
from models.account import Account
from services.account_service import TenantService
from controllers.console.wraps import account_initialization_required
from services.model_provider_service import ModelProviderService


class EnterpriseWorkspace(Resource):

    @setup_required
    # @inner_api_only
    @login_required
    @account_initialization_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, location='json')
        # parser.add_argument('owner_email', type=str, required=True, location='json')
        args = parser.parse_args()

        # account = Account.query.filter_by(email=args['owner_email']).first()
        # if account is None:
        #     return {
        #         'message': 'owner account not found.'
        #     }, 404

        tenant = TenantService.create_tenant(args['name'])
        TenantService.create_tenant_member(tenant, current_user, role='owner')
        tenant_was_created.send(tenant)
        # 给每一个空间配置默认模型
        model_provider_service = ModelProviderService()
        try:
            # 大模型
            model_provider_service.save_model_credentials(
                tenant_id=tenant.id,
                provider=get_env('PROVIDER'),
                model=get_env('LLM_MODEL'),
                model_type=get_env('LLM_MODEL_TYPE'),
                credentials={"mode": get_env('LLM_MODE'),
                             "context_size": get_env('LLM_CONTEXT_SIZE'),
                             "max_tokens_to_sample": get_env('LLM_MAX_TOKENS_TO_SAMPLE'),
                             "function_calling_type": get_env('LLM_FUNCTION_CALLING_TYPE'),
                             "stream_function_calling": get_env('LLM_STREAM_FUNCTION_CALLING'),
                             "vision_support": get_env('LLM_VISION_SUPPORT'),
                             "stream_mode_delimiter": get_env('LLM_STREAM_MODE_DELIMITER'),
                             "api_key": get_env('LLM_API_KEY'),
                             "endpoint_url": get_env('LLM_ENDPOINT_YRL')
                             }
            )
            # 只是库模型
            model_provider_service.save_model_credentials(
                tenant_id=tenant.id,
                provider=get_env('PROVIDER'),
                model=get_env('LLM_TEXT_MODEL'),
                model_type=get_env('LLM_TEXT_MODEL_TYPE'),
                credentials={"mode": get_env('LLM_MODE'),
                             "context_size": get_env('LLM_CONTEXT_SIZE'),
                             "max_tokens_to_sample": get_env('LLM_MAX_TOKENS_TO_SAMPLE'),
                             "function_calling_type": get_env('LLM_FUNCTION_CALLING_TYPE'),
                             "stream_function_calling": get_env('LLM_STREAM_FUNCTION_CALLING'),
                             "vision_support": get_env('LLM_VISION_SUPPORT'),
                             "stream_mode_delimiter": get_env('LLM_STREAM_MODE_DELIMITER'),
                             "api_key": get_env('LLM_API_KEY'),
                             "endpoint_url": get_env('LLM_ENDPOINT_YRL')
                             }
            )
        except CredentialsValidateFailedError as ex:
            raise ValueError(str(ex))

        return {
            'message': 'enterprise workspace created.'
        }


api.add_resource(EnterpriseWorkspace, '/enterprise/workspace')
