var db=require('./dbhelper');

//book类
function Book(){
	this.barcode;
	this.title;
	this.author;
	this.type;
	this.press;
	this.isbn;
	this.price;
	this.content;
	this.catalog;
	this.callnumber;
	this.address;
	this.state;
}

module.exports=Book;

//保存书籍信息--后台使用的方法
Book.prototype.save = function() {
	var sql="select*from book where title LIKE '%"+title+"%';";
};

//根据书名查找书
Book.findBookByTitle=function(title,callback){
	var sql="select distinct title,callnumber,author,type,press,marc_no from book where title LIKE '%"+title+"%';";
	db.exec(sql,'',function(err,rows){
		//rows是一个对象数组
		for(var i=0;i<rows.length;i++){
			console.log(rows[i].title);
		}
		callback(err,rows);
	});
};

//根据macrno查找书籍
Book.findBookByMarcno=function(Marcno,callback){
	//frequency--续借次数
	// var sql="select bk.*,bw.outdate,bw.frequency,bw.state from book bk,borrow bw where bk.marc_no='"+Marcno+"' and bw.state=bk.state;";
	var sql="select*from book where marc_no='"+Marcno+"';";
	db.exec(sql,'',function(err,rows){
		//rows是一个对象数组
		for(var i=0;i<rows.length;i++){
			console.log(rows[i].title);
		}
		callback(err,rows);
	});
};

//根据barcode查找书籍
Book.findBookBybarcode=function(barcode,callback){
	var sql="select title,barcode,author,press from book where barcode='"+barcode+"';";
	db.exec(sql,'',function(err,rows){
		callback(err,rows);
	});
};