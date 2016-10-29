var db = require('./dbhelper');

function Borrow(readerId, barcode) {
	this.readerId = readerId;
	this.barcode = barcode;
}

module.exports = Borrow;

//保存借书记录
Borrow.save = function(readerId, barcode, callback) {
	db.getConnection(function(err,connection){
		if(err){
			throw err;
		}
		var sql;
		connection.beginTransaction(function(err){
			if(err){
				callback(err);
			}
			sql="SELECT isbn FROM isbn_barcode WHERE barcode='"+barcode+"';";
			connection.query(sql,[],function(err,rows){
				if(err){
					return connection.rollback(function(){
						callback(err);
					});
				}
				var isbn=rows[0].isbn;

				sql = "UPDATE isbn_barcode SET state=1 WHERE barcode='" + barcode + "';";
				connection.query(sql,[],function(err,rows){
					if(err){
						return connection.rollback(function(){
							callback(err);
						});
					}

					var date = new Date().Format("yyyy-MM-dd hh:mm:ss");//借书日期
					sql = "INSERT INTO borrow (readerId,isbn,barcode,outdate) VALUES ('" + readerId + "','" + isbn + "','" + barcode + "','"+date+"');";
					connection.query(sql,[],function(err,rows) {
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
							connection.end();
							callback();
						});
					});
				});
			});
		});
	});
};

//当前借阅
Borrow.findNowBorrow=function(readerId,callback){
	var sql="select bw.barcode,bk.title,bk.author,bw.outdate,bw.frequency,bk.address from borrow bw,book bk where bw.isbn=bk.isbn AND readerId='"+readerId+"' ORDER BY bw.outDate DESC;"
	db.exec(sql,'',function(err,rows){
		callback(err,rows);
	});
}

//还书
Borrow.returnBook=function(readerId,barcode,callback){
	db.getConnection(function(err,connection){
		if(err){
			callback(err);
		}
		var sql;
		connection.beginTransaction(function(err){
			if(err){
				return callback(err);
			}

			//更改isbn_barcode中state状态为'可借'
			sql="UPDATE isbn_barcode SET state=0 WHERE barcode='"+barcode+"';";
			connection.query(sql,[],function(err){
				if(err){
					return connection.rollback(function(){
						callback(err);
					});
				}

				sql="SELECT outDate FROM borrow WHERE readerId='"+readerId+"' AND barcode='"+barcode+"';";
				connection.query(sql,[],function(err,rows){
					if(err){
						return connection.rollback(function(){
							callback(err);
						});
					}

					var outDate=(rows[0].outDate).Format("yyyy-MM-dd hh:mm:ss");//借阅日期
					console.log('outDate',outDate);
					var inDate = new Date().Format("yyyy-MM-dd hh:mm:ss");//还书日期
					sql="INSERT INTO history VALUES('"+readerId+"','"+barcode+"','"+outDate+"','"+inDate+"')";
					connection.query(sql,[],function(err){
						if(err){
							return connection.rollback(function(){
								callback(err);
							});
						}

						//删除借阅表中的记录
						sql="DELETE FROM borrow WHERE readerId='"+readerId+"' AND barcode='"+barcode+"';";
						connection.query(sql,[],function(err,rows){
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
								connection.end();
								callback();
							});
						});
					});
				});
			});
		});
	});
};

//续借
Borrow.renew=function(readerId,barcode,callback){
	db.getConnection(function(err,connection){
		if(err){
			throw err;
		}
		var sql;
		connection.beginTransaction(function(err){
			if(err){
				return callback(err);
			}
			sql="SELECT frequency FROM borrow where readerId='"+readerId+"' and barcode='"+barcode+"';";
			connection.query(sql,[],function(err,rows){
				if(err){
					return connection.rollback(function(){
						callback(err);
					});
				}

				var frequency=rows[0].frequency;

				if(frequency==0){
					frequency=1;
				}else if(frequency==1){
					frequency=2;
				}else{
					return callback('no pass 2')
				}
				var sql="UPDATE borrow SET frequency="+frequency+" WHERE readerId='"+readerId+"' and barcode='"+barcode+"'";
				connection.query(sql,[],function(err,rows){
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
						callback();
					});	
				});
			});
		});
	});
};

//历史借阅
Borrow.findHistory=function(readerId,callback){
	var sql="SELECT ib.barcode,bk.title,bk.author,his.outDate,his.inDate,bk.address FROM history his,book bk,isbn_barcode ib WHERE his.barcode=ib.barcode AND ib.isbn=bk.isbn AND readerId='"+readerId+"' ORDER BY his.inDate DESC;"
	db.exec(sql,'',function(err,rows){
		callback(err,rows);
	});
};

//格式化日期时间
Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, 
		"d+": this.getDate(), 
		"h+": this.getHours(), 
		"m+": this.getMinutes(), 
		"s+": this.getSeconds(), 
		"q+": Math.floor((this.getMonth() + 3) / 3), 
		"S": this.getMilliseconds() 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}