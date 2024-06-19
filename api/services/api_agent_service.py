from flask_sqlalchemy.pagination import Pagination
from extensions.ext_database import db
from models.model import App, AppModelConfig, ApiAgentApp, ApiAgentRegister
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import update
import json


class ApiAgentAppService:

    @staticmethod
    def get_api_agent_app(app_id: str):
        capi_agent_app = db.session.query(ApiAgentApp).filter(
            ApiAgentApp.app_id == app_id,
        ).first()

        return capi_agent_app


class ApiAgentRegisterService:

    @staticmethod
    def get_api_agent(api_agent_id: str):
        api_agent = db.session.query(ApiAgentRegister).filter(
            ApiAgentRegister.id == api_agent_id,
        ).first()

        return api_agent

    @staticmethod
    def get_paginate_api_agent(args: dict) -> Pagination | None:
        """

        """
        filters = []
        app_models = db.paginate(
            db.select(ApiAgentRegister).where(*filters),
            page=args['page'],
            per_page=args['limit'],
            error_out=False
        )

        return app_models

    @staticmethod
    def create_app(args: dict):
        """
        Create

        """
        app = ApiAgentRegister(**args)
        db.session.add(app)
        db.session.commit()
        return app

    @staticmethod
    def update_app(args: dict):
        """
        Update api_agent
        """

        api_agent = ApiAgentRegisterService.get_api_agent(args["ai_agent_id"])
        api_agent.ai_agent_name = args.get('ai_agent_name')
        api_agent.desc = args.get('desc', '')
        api_agent.host = args.get('host')
        api_agent.url = args.get('url')
        api_agent.collection = args.get('collection')
        api_agent.suggested_questions = args.get('suggested_questions')
        db.session.commit()

        return api_agent

    @staticmethod
    def change_agent_suggested_questions(args: dict):
        # 编辑opening_statement  suggested_questions字段改为最新的
        if args['suggested_questions']:
            suggested_questions_value = json.loads(args['suggested_questions'])
            api_agent_apps = ApiAgentApp.query.filter_by(api_agent_id=args['ai_agent_id']).all()
            # 提取所有 api_agent_apps 的 app_id 列表
            app_ids = [app.app_id for app in api_agent_apps]
            # 使用提取的 app_id 列表在 App 表中查找匹配的记录
            apps = App.query.filter(App.id.in_(app_ids)).all()
            try:
                for app in apps:
                    suggested_questions_dict = suggested_questions_value
                    for key, value in suggested_questions_dict.items():
                        sql = (update(AppModelConfig).where(AppModelConfig.id == app.app_model_config_id)
                               .values(opening_statement=key, suggested_questions=json.dumps(value)))
                        db.session.execute(sql)
                db.session.commit()
            except SQLAlchemyError as e:
                print(f"修改失败: {e}")
                db.session.rollback()
