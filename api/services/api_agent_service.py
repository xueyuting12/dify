from flask_sqlalchemy.pagination import Pagination

from extensions.ext_database import db
from models.model import ApiAgentApp, ApiAgentRegister


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
        api_agent.suggested_questions = args.get('suggested_questions')
        db.session.commit()

        return api_agent
