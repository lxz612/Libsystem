var db=require('./dbhelper');

//book类
function Book(){
	this.isbn;
	this.barcode;
	this.title;
	this.author;
	this.type;
	this.press;
	this.price;
	this.content;
	this.catalog;
	this.callNumber;
	this.address;
	this.state;
}

module.exports=Book;

//保存书籍信息--后台使用的方法
Book.prototype.save = function() {
	var sql="select*from book where title LIKE '%"+title+"%';";
};

//根据书名查找书
Book.findBooksByTitle=function(title,callback){
	var sql="SELECT isbn,title,author,type,press,callNumber FROM book WHERE title LIKE '%"+title+"%';";
	db.exec(sql,'',function(err,rows){
		//rows是一个对象数组
		for(var i=0;i<rows.length;i++){
			console.log(rows[i].title);
		}
		callback(err,rows);
	});
};

//根据isbn查找书籍
Book.findBooksByISBN=function(isbn,callback){
	db.getConnection(function(err,connection){
		if(err){
			return callback(err);
		}
		var sql;
		connection.beginTransaction(function(err){
			if(err){
				return callback(err);
			}
			sql="SELECT isbn,title,author,press,price,content,catalog FROM book WHERE isbn='"+isbn+"';";
			connection.query(sql,[],function(err,rows){
				if(err){
					return connection.rollback(function(){
						callback(err);
					});
				}
				var bookInfo=rows[0];//图书基本信息

				sql="SELECT bk.callNumber,ib.barcode,bk.address,ib.state FROM book bk,isbn_barcode ib WHERE ib.isbn='"+isbn+"' AND bk.isbn=ib.isbn;";
				connection.query(sql,[],function(err,rows){
					if(err){
						return connection.rollback(function(){
							callback(err);
						});
					}
					var booksState=rows;//图书馆藏情况

					connection.commit(function(err){
						if(err){
							return connection.rollback(function(){
								callback(err);
							});
						}
						connection.end();
						callback(undefined,bookInfo,booksState);
					});
				});
			});
		});
	});
};


//根据barcode查找书籍
Book.findBookBybarcode=function(barcode,callback){
	var sql="select bk.title,ib.barcode,bk.author,bk.press from book bk,isbn_barcode ib where barcode='"+barcode+"' AND bk.isbn=ib.isbn;";
	db.exec(sql,'',function(err,rows){
		callback(err,rows[0]);
	});
};