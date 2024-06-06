import sys

import pymysql


class MysqlObj():

    def __init__(self, host, port, user, passwd, db):
        try:
            self.mysql_client = pymysql.Connect(
                host=host,
                port=port,
                user=user,
                passwd=passwd,
                db=db, charset='utf8',
                cursorclass=pymysql.cursors.DictCursor,
                connect_timeout=3)
        except Exception as e:
            print("[数据库连接失败]:" + str(e))
            print(host, port, user, passwd, db)
            sys.exit(1)

    def __del__(self):
        if self.mysql_client:
            self.mysql_client.close()

    def get_mysql_data(self, sql):

        with self.mysql_client.cursor() as cursor:
            cursor.execute(sql)
            data_info_list = cursor.fetchall()
        return data_info_list

    def get_mysql_data_column(self, sql):
        with self.mysql_client.cursor() as cursor:
            cursor.execute(sql)
            data_info_list = cursor.fetchall()
            # 获取列名
            column_names = [desc[0] for desc in cursor.description]
        return data_info_list, column_names
