var mysql = require('mysql');
//填写数据库连接信息，可查询数据库详情页
var username = 'root';
var password = '';
var db_host = '127.0.0.1';
var db_port = 3306;
var db_name = 'libsystem';

var option = {
	host: db_host,
	port: db_port,
	user: username,
	password: password,
	database: db_name
};

var DB={};

module.exports = DB;

DB.exec=function(sqls, values, after) {
	var connection = mysql.createConnection(option);
	connection.connect(function(err) {
		if (err) {
			console.error('error connecting: ' + err.stack);
			return;
		}
		console.log('connected as id ' + connection.threadId);

		connection.query(sqls || '', values || [], function(err, rows) {
			after(err, rows);
		});
		//关闭数据库连接
		connection.end();
	});
	connection.on('error', function(err) {
		if (err.errno != 'ECONNRESET') {
			after("err01", false);
			throw err;
		} else {
			after("err02", false);
		}
	});
};

//事务连接
DB.getConnection=function(callback){
	var connection=mysql.createConnection(option);
	connection.connect(function(err){
		if(err){
			console.error('error connecting: ' + err.stack);
			// callback(err);
		}
		callback(err,connection);
	});
}