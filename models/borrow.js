var db = require('./dbhelper');

function Borrow(number, barcode) {
	this.number = number;
	this.barcode = barcode;
}

module.exports = Borrow;

//保存借书记录
Borrow.save = function(number, barcode, callback) {
	db.getConnection(function(err,connection){
		if(err){
			throw err;
		}
		connection.beginTransaction(function(err){
			if(err){
				callback(err);
			}

			//更改book数据中书籍状态 0--可借 1--借出 2--遗失
			var updatesql = "update book SET state='1' WHERE barcode='" + barcode + "';";
			connection.query(updatesql,[],function(err,rows,fields){
				if(err){
					return connection.rollback(function(){
						callback(err);
					});
				}

				var date = new Date().Format("yyyy-MM-dd hh:mm:ss");
				var state = 1; // 0--已还 1--未还 2--遗失
				//写入借阅数据库中
				var sql = "insert into borrow (number,barcode,outdate,state) values ('" + number + "','" + barcode + "','" + date + "','" + state + "');";
				connection.query(sql,[],function(err,rows,fields) {
					if(err){
						return connection.rollback(function(){
							callback(err);
						});
					}

					connection.commit(function(err){
						if(err){
							return connection.rollback(function(){
								callback(err);
							});
						}
						console.log('success!');
						connection.end();
						callback(err);
					});
				});
			});
		});
	});
};

Borrow.findoutdate=function(barcode,callback){
	var sql="select outdate from borrow where barcode='"+barcode+"';";
	db.exec(sql,'',function(err,rows){
		callback(err,rows);
	});
}

//查找当前借阅的信息
Borrow.findNowBorrow=function(number,callback){
	var sql="select bk.barcode,bk.title,bk.author,bw.outdate,bk.address from borrow bw,book bk where bw.barcode=bk.barcode AND bw.state='1';"
	db.exec(sql,'',function(err,rows){
		callback(err,rows);
	}); 
}

//历史借阅
Borrow.findHistory=function(number,callback){
	var sql="select bk.barcode,bk.title,bk.author,bw.outdate,bw.indate,bk.address from borrow bw,book bk where bw.barcode=bk.barcode AND bw.state='0';"
	db.exec(sql,'',function(err,rows){
		callback(err,rows);
	});
}

//日期格式化函数
Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}