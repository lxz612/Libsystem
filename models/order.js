var db=require('./dbhelper');

//预约操作
var Order={};

module.exports=Order;

//预约 
//首先检查 --是不是自己已借阅
Order.save=function(readerId,isbn,callback){
	db.getConnection(function(err,connection){
		if(err){
			return callback(err);
		}
    var sql;
		connection.beginTransaction(function(err){
			if(err){
				return callback(err);
			}

			sql="SELECT isbn FROM borrow WHERE readerId='"+readerId+"' AND isbn='"+isbn+"';";
			connection.query(sql,[],function(err,rows){
				if(err){
					return connection.rollback(function(){
						callback(err);
					});
				}
				//如果查询不为空，证明自己已借阅此书，就不能预约
				console.log('length',rows.length);
				if(rows.length>0){
					return callback('你已借阅此书！！！');
				}
				var date = new Date().Format("yyyy-MM-dd hh:mm:ss");
				var state=0;//0-未到 1-预约到书 2-已取书 3-预约取消
				sql="INSERT INTO `order`(readerId,isbn,orderDate,state) VALUES ('"+readerId+"','"+isbn+"','"+date+"','"+state+"');";
				connection.query(sql,[],function(err,rows){
					if(err){
						return connection.rollback(function(err){
							callback(err);
						});
					}

					connection.commit(function(err){
						if(err){
							return connection.rollback(function(){
								callback(err);
							});
						}
						connection.end();
						callback();
					});
				});
			});
		});
	});
};

//根据证件号查找预约信息
Order.findOrderByreaderId=function(readerId,callback){
	var sql="SELECT bk.callNumber,bk.title,bk.author,bk.address,ord.isbn,ord.orderDate,ord.inDate,ord.state FROM `order` ord,book bk WHERE ord.readerId='"+readerId+"' AND ord.isbn=bk.isbn";
	db.exec(sql,'',function(err,rows){
		callback(err,rows);
	});
};

//取消预约
Order.cancal=function(readerId,isbn,callback){
	var sql="DELETE FROM `order` WHERE readerId='"+readerId+"' and isbn='"+isbn+"';";
	db.exec(sql,'',function(err,rows){
		callback(err);
	});
};

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