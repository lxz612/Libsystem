var fs=require('fs');
var querystring=require('querystring');
var db=require('./dbhelper');

function User(){
	this.username;
	this.password;
}

module.exports=User;

//根据证件号查找用户
User.findUserByNumber=function(number, callback){
	var sql="select*from reader where number='"+number+"';";
	db.exec(sql,'',function(err,rows){
		//rows是一个对象数组
		callback(err,rows[0]);
	});
};


