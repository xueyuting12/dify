import flask_login
from flask import current_app, request
from flask_restful import Resource, reqparse

import services
from config import get_env
from controllers.console import api
from controllers.console.auth.ldap_user import LDAPBackend
from controllers.console.init_validate import get_init_validate_status
from controllers.console.setup import setup_required, get_setup_status, setup
from core.model_runtime.errors.validate import CredentialsValidateFailedError
from libs.helper import email
from libs.password import valid_password
from services.account_service import AccountService, TenantService, RegisterService, WechatServiceAPI
from services.model_provider_service import ModelProviderService
from libs.passport import PassportService
from datetime import datetime, timedelta, timezone
# class LoginApi(Resource):
#     """Resource for user login."""
#
#     @setup_required
#     def post(self):
#         """Authenticate user and login."""
#         parser = reqparse.RequestParser()
#         parser.add_argument('email', type=email, required=True, location='json')
#         parser.add_argument('password', type=valid_password, required=True, location='json')
#         parser.add_argument('remember_me', type=bool, required=False, default=False, location='json')
#         args = parser.parse_args()
#
#         # todo: Verify the recaptcha
#
#         try:
#             account = AccountService.authenticate(args['email'], args['password'])
#         except services.errors.account.AccountLoginError:
#             return {'code': 'unauthorized', 'message': 'Invalid email or password'}, 401
#
#         TenantService.create_owner_tenant_if_not_exist(account)
#
#         AccountService.update_last_login(account, request)
#
#         # todo: return the user info
#         token = AccountService.get_account_jwt_token(account)
#
#         return {'result': 'success', 'data': token}


# 工号登录
class LoginUsername(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('code', type=str, required=True, location='json')
        args = parser.parse_args()
        wechatobj = WechatServiceAPI()
        access_token = wechatobj.get_access_token()
        if not access_token:
            return {"error": "access_token is missing"}, 401
        print('参数',args['code'])
        try:
            user_id = wechatobj.get_user_id(access_token, args['code'])
            print('user_id', user_id)
            print("user_id['userid']", user_id['userid'])
        except Exception as e:
            # 捕获其他可能的异常
            print(f"发生未预料到的错误：{e}")
            raise e
        account = AccountService.get_order(user_id['userid'])
        print('account', account)
        #
        if account:
            payload = {
                "user_id": account['id'],
                "exp": datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=30),
                "iss": current_app.config['EDITION'],
                "sub": 'Console API Passport',
            }
            token = PassportService().issue(payload)
            return {'token': token, 'user_id': user_id}
        else:
            return {'code': 'unauthorized'}, 401


class LoginApi(Resource):
    """Resource for user login."""

    def post(self):
        """Authenticate user and login."""
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, required=True, location='json')
        parser.add_argument('password', type=valid_password, required=True, location='json')
        parser.add_argument('remember_me', type=bool, required=False, default=False, location='json')
        args = parser.parse_args()

        # todo: Verify the recaptcha

        try:
            ldap_auth = LDAPBackend()
            data = ldap_auth.authenticate(username=args['username'], password=args['password'])
            # data = {"mail": f"{args['username']}@email.com"}
            if not data:
                return {'code': 'unauthorized', 'message': 'Invalid username or password'}, 401
        except services.errors.account.AccountLoginError:
            return {'code': 'unauthorized', 'message': 'Invalid email or password'}, 401
        account = AccountService.authenticate(data['mail'], args['password'])
        print(account)
        is_create_model = False
        if not account:
            account = RegisterService.register(
                email=data['mail'],
                name=args['username'],
                password=args['password']
            )
            if not get_init_validate_status() or not get_setup_status():
                setup()
                AccountService.update_last_login(account, request)

            is_create_model = True

        tenant = TenantService.create_owner_tenant_if_not_exist(account)

        AccountService.update_last_login(account, request)

        if is_create_model:
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

        # todo: return the user info
        token = AccountService.get_account_jwt_token(account)

        return {'result': 'success', 'data': token}


class LogoutApi(Resource):

    @setup_required
    def get(self):
        flask_login.logout_user()
        return {'result': 'success'}


class ResetPasswordApi(Resource):
    @setup_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email', type=email, required=True, location='json')
        args = parser.parse_args()

        # import mailchimp_transactional as MailchimpTransactional
        # from mailchimp_transactional.api_client import ApiClientError

        account = {'email': args['email']}
        # account = AccountService.get_by_email(args['email'])
        # if account is None:
        #     raise ValueError('Email not found')
        # new_password = AccountService.generate_password()
        # AccountService.update_password(account, new_password)

        # todo: Send email
        MAILCHIMP_API_KEY = current_app.config['MAILCHIMP_TRANSACTIONAL_API_KEY']
        # mailchimp = MailchimpTransactional(MAILCHIMP_API_KEY)

        message = {
            'from_email': 'noreply@example.com',
            'to': [{'email': account.email}],
            'subject': 'Reset your Dify password',
            'html': """
                <p>Dear User,</p>
                <p>The Dify team has generated a new password for you, details as follows:</p> 
                <p><strong>{new_password}</strong></p>
                <p>Please change your password to log in as soon as possible.</p>
                <p>Regards,</p>
                <p>The Dify Team</p> 
            """
        }

        # response = mailchimp.messages.send({
        #     'message': message,
        #     # required for transactional email
        #     ' settings': {
        #         'sandbox_mode': current_app.config['MAILCHIMP_SANDBOX_MODE'],
        #     },
        # })

        # Check if MSG was sent
        # if response.status_code != 200:
        #     # handle error
        #     pass

        return {'result': 'success'}


api.add_resource(LoginApi, '/login')
api.add_resource(LogoutApi, '/logout')
api.add_resource(LoginUsername, '/login_username')
