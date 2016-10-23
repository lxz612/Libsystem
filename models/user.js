var fs=require('fs');
var querystring=require('querystring');
var db=require('./dbhelper');

function User(){
	this.username;
	this.password;
}

module.exports=User;

User.findUserByUsername=function(username, callback){
	var sql="select*from reader where number='"+username+"';";
	db.exec(sql,'',function(err,rows){
		//rows是一个对象数组
		callback(err,rows[0]);
	});
};


