import datetime
from extensions.ext_database import db

from models.account import Account

from models.agent_flow import AgentFlow, AgentFlowVersion, AgentRegister


class AgentFlowService:

    @staticmethod
    def get_agent_flow_list(page, per_page):
        agent_flow = AgentFlow.query.filter() \
            .order_by(AgentFlow.created_at.desc()) \
            .paginate(
            page=page,
            per_page=per_page,
            max_per_page=100,
            error_out=False
        )
        return agent_flow.items, agent_flow.total

    @staticmethod
    def create_agent_flow(name: str,
                          description: str,
                          account: Account):
        agent_flow = AgentFlow(name=name,
                               description=description)
        agent_flow.created_by = account.name
        agent_flow.updated_by = account.name
        db.session.add(agent_flow)
        db.session.commit()
        return agent_flow

    @staticmethod
    def get_agent_flow(agent_flow_id):
        agent_flow = AgentFlow.query.filter_by(
            id=agent_flow_id
        ).first()
        if agent_flow is None:
            return None
        else:
            return agent_flow

    @staticmethod
    def update_agent_flow(agent_flow_id, data, user):
        agent_flow = AgentFlowService.get_agent_flow(agent_flow_id)
        data['updated_by'] = user.name
        data['updated_at'] = datetime.datetime.now()
        agent_flow.query.filter_by(id=agent_flow_id).update(data)
        db.session.commit()
        return agent_flow

    @staticmethod
    def delete_agent_flow(agent_flow_id):
        # todo: cannot delete dataset if it is being processed
        agent_flow = AgentFlowService.get_agent_flow(agent_flow_id)
        if agent_flow is None:
            return False
        db.session.delete(agent_flow)
        db.session.commit()
        return True


class AgentFlowVersionService:

    @staticmethod
    def get_agent_flow_version_list(agent_flow_id):
        datasets = AgentFlowVersion.query.filter(AgentFlowVersion.agent_flow_id == agent_flow_id) \
            .order_by(AgentFlowVersion.created_at.desc()) \
            .paginate(
            page=1,
            per_page=50,
            max_per_page=50,
            error_out=False
        )
        return datasets.items

    @staticmethod
    def create_agent_flow_version(agent_flow_id: str,
                                  version: str,
                                  flow_content: str,
                                  account: Account):
        agent_flow = AgentFlowVersion(version=version,
                                      agent_flow_id=agent_flow_id,
                                      flow_content=flow_content
                                      )
        agent_flow.created_by = account.name
        agent_flow.updated_by = account.name
        db.session.add(agent_flow)
        db.session.commit()
        return agent_flow

    @staticmethod
    def get_agent_flow_version(agent_flow_id, version):
        agent_flow = AgentFlowVersion.query.filter_by(
            agent_flow_id=agent_flow_id,
            version=version
        ).first()
        if agent_flow is None:
            return None
        else:
            return agent_flow

    @staticmethod
    def update_agent_flow_version(agent_flow_id, version, flow_content, user):
        agent_flow_version = AgentFlowVersionService.get_agent_flow_version(agent_flow_id, version)
        data = {"updated_by": user.name, 'updated_at': datetime.datetime.now(), "flow_content": flow_content}
        agent_flow_version.query.filter_by(id=agent_flow_id).update(data)
        db.session.commit()
        return agent_flow_version

    @staticmethod
    def delete_agent_flow_version(agent_flow_id, version):
        # todo: cannot delete dataset if it is being processed
        agent_flow = AgentFlowVersionService.get_agent_flow_version(agent_flow_id, version)
        if agent_flow is None:
            return False
        db.session.delete(agent_flow)
        db.session.commit()
        return True


class FlowDataChange:
    @staticmethod
    def agent_flow_change(flow_content):
        # 初始化结构
        result_flow_content = {
            "nodes": [],
            "entry_point": "",
            "edges": [],
            "conditional_edges": []
        }
        # 确定nodes
        header_id = ""
        conditions = {}
        output_ids = []
        for node_item in flow_content.get("nodes", []):
            if node_item["type"] == "START":
                header_id = node_item["id"]
                continue
            # 特有的CONDITION内容保存下来
            if node_item["type"] == "CONDITION":
                conditions[node_item["id"]] = node_item
                continue
            if node_item["type"] == "OUTPUT":
                output_ids.append(node_item["id"])
                continue
            result_flow_content["nodes"].append(
                {
                    "class_name": node_item.get("data", {}).get("className"),
                    "key": node_item["id"],
                    "version": node_item.get("data", {}).get("version"),
                    "action": node_item.get("data", {}).get("label")
                }
            )

        # entry_point起始点与
        for item_edges in flow_content.get("edges", []):
            source = item_edges["source"]
            target = item_edges["target"]
            # 起始点
            if header_id == source:
                result_flow_content["entry_point"] = target
            # condition类型
            elif target in conditions:
                # 判断condition类型的下一个节点是否是condition类型
                conditional_edge_mapping = {}
                for item_edge in flow_content.get("edges", []):
                    if target == item_edge["source"] and item_edge.get("sourceHandle"):
                        conditional_edge_mapping[item_edge.get("sourceHandle")] = item_edge["target"] if item_edge[
                                                                                                             "target"] not in output_ids else "__end__"
                condition = conditions[target]
                # 应该是conditional_edges
                result_flow_content["conditional_edges"].append(
                    {
                        "start_key": source,
                        "condition": condition.get("data", {}).get("label"),
                        "condition_class_name": condition.get("data", {}).get("className"),
                        "version": condition.get("data", {}).get("version"),
                        "conditional_edge_mapping": conditional_edge_mapping
                    }
                )
                continue
            elif source in conditions:
                continue
            # edges内容
            else:
                result_flow_content["edges"].append({
                    "start_key": source,
                    "end_key": target if target not in output_ids else "__end__"
                })
        return result_flow_content


class AgentRegisterService:

    @staticmethod
    def get_agent_register_list(page, per_page):
        agent_register = AgentRegister.query.filter() \
            .order_by(AgentRegister.created_at.desc()) \
            .paginate(
            page=page,
            per_page=per_page,
            max_per_page=1000,
            error_out=False
        )
        return agent_register.items, agent_register.total
