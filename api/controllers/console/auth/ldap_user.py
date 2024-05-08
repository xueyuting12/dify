#!/usr/bin/env python
# -*- coding:utf-8 -*-
# @Time： 2020/8/31 19:33 
# @Author： shizhengju
import ldap


class LDAPBackend:
    AUTH_LDAP_SERVER_URI = "ldap://10.65.80.197:389"
    AUTH_LDAP_BIND_DN = 'uid=ldapuser,cn=users,cn=accounts,dc=o,dc=casstime,dc=com'
    AUTH_LDAP_BIND_PASSWORD = 'Comon@12#$'
    AUTH_LDAP_BASE_DN = 'cn=accounts,dc=o,dc=casstime,dc=com'

    def authenticate(self, username=None, password=None, **kwargs):
        if username and password:
            # 初始化ldap连接
            ldap_conn = ldap.initialize(self.AUTH_LDAP_SERVER_URI)
            # 设置连接协议为version3
            ldap_conn.protocol_version = ldap.VERSION3
            # 使用管理员账号，密码登陆ldap
            ldap_conn.simple_bind_s(self.AUTH_LDAP_BIND_DN, self.AUTH_LDAP_BIND_PASSWORD)
            # 根据我们需要的字段(此处的字段是值ldap查询到的数据的字段)搜索到指定的账户，uid是我用的，不同公司的可能不一样，需要根据自己的实际情况确定
            ldap_result_id = ldap_conn.search(self.AUTH_LDAP_BASE_DN, ldap.SCOPE_SUBTREE, "(uid={})".format(username),
                                              None)
            # 获取到查询的结果数据
            result_type, result_data = ldap_conn.result(ldap_result_id, 1)
            # 如果查询到了用户就继续验证
            if len(result_data):
                try:
                    mail = result_data[0][-1]["mail"][0].decode('utf-8')
                    name = result_data[0][-1]["cn"][0].decode('utf-8')
                    data = {"mail": mail, "name": name}
                    # 初始化ldap连接
                    ldap_conn = ldap.initialize(self.AUTH_LDAP_SERVER_URI)
                    # 使用刚刚查到的登陆用的DN信息和密码再次登陆一下ldap
                    # 1、如果登陆成功会返回一个类似于右边的一个元祖数据(97, [], 1, [])
                    # 2、如果登陆失败就会抛出一个ldap.INVALID_CREDENTIALS的异常
                    ldap_conn.simple_bind_s(result_data[0][0], password)
                    return data
                except ldap.INVALID_CREDENTIALS:
                    return False
            return False
        else:
            return False


# print(LDAPBackend().authenticate("a02389", "Root@123"))
