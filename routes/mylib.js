var express = require('express');
var router = express.Router();
var Borrow=require('../models/borrow');
var Order=require('../models/order');

//当前借阅
router.get('/myborrow',ensureAuthenticated,function(req,res,next){
	var readerId=res.locals.user.readerId;
	Borrow.findNowBorrow(readerId,function(err,borrows){
		if(err){
			return next(err);
		}
		//修正日期数据
		borrows.forEach(function(borrow){
			var outdate=borrow.outdate;
			//格式化借阅日期
			borrow.outdate=outdate.toLocaleDateString();//格式化为yy-mm-dd
			//计算应还日期
			//此处indate和数据库中的indate不是一样的，
			//这里代表应还日期，数据库中的indate是实际归还日期
			outdate.setMonth(outdate.getMonth()+1);
			if(borrow.frequency!=0){//续借次数不为0
				outdate.setDate(outdate.getDate()+10*borrow.frequency);
				borrow.indate=outdate.toLocaleDateString();
			}else{//续借次数为0
				borrow.indate=outdate.toLocaleDateString();
			}
		});
		res.render('myborrow',{title:'当前借阅-我的图书馆',
			arr:[{sch:'',lib:'active',abt:'',log:''}],borrows:borrows});
	});
});

//还书
router.get('/return',ensureAuthenticated,function(req,res,next){
	var barcode=req.query.barcode;
	var readerId=res.locals.user.readerId;
	Borrow.returnBook(readerId,barcode,function(err){
		if(err){
			return next(err);
		}
		res.render('result_return',{title:'还书结果-我的图书馆',
			arr:[{sch:'',lib:'active',abt:'',log:''}]});
	});
});

//续借
router.get('/renew',ensureAuthenticated,function(req,res,next){
	var barcode=req.query.barcode;
	var readerId=res.locals.user.readerId;
	Borrow.renew(readerId,barcode,function(err){
		if(err){
			return next(err);
		}
		res.render('result_renew',{title:'续借结果-我的图书馆',
			arr:[{sch:'',lib:'active',abt:'',log:''}]});
		});
});

//我的预约
router.get('/myorder',ensureAuthenticated,function(req,res){
	var readerId=res.locals.user.readerId;
	Order.findOrderByreaderId(readerId,function(err,books){
		books.forEach(function(book){
			//预约状态
			if(book.state==0){
				//预约截止日期
				book.deadline=book.orderd.getFullYear()+'-'+(book.orderd.getMonth()+2)+'-'+book.orderd.getDate();
				book.state="申请中";
			}else if(book.state==1){
				//预约截止日期
				book.deadline=book.ind.getFullYear()+'-'+(book.ind.getMonth()+1)+'-'+(book.ind.getDate()+5);
				book.state="已到馆,保留五日,速借";
			}else{
				//已取书或者预约取消，则不显示此条记录
				console.log('删除book');
				delete book;
			}
		});
		res.render('myorder',{title:'我的预约-我的图书馆',
		 arr:[{sch:'',lib:'active',abt:'',log:''}],books:books});
	})
});

//取消预约
router.get('/cancal',ensureAuthenticated,function(req,res){
	var readerId=res.locals.user.readerId;
	var marc_no=req.query['marc_no'];
	Order.cancal(readerId,marc_no,function(err){
		if(err){
			return next(err);
		}
		res.render('result_cancal',{title:'取消预约',
		 arr:[{sch:'',lib:'active',abt:'',log:''}]});
	});
});

//借阅历史
router.get('/history',ensureAuthenticated,function(req,res,next){
	var readerId=res.locals.user.readerId;
	Borrow.findHistory(readerId,function(err,rows){
		if(err){
			return next(err);
		}
		rows.forEach(function(row){
			row.indate=row.inDate.toLocaleDateString();
			row.outdate=row.outDate.toLocaleDateString();//格式化时间
		});
		res.render('history',{title:'借阅历史-我的图书馆',
			arr:[{sch:'',lib:'active',abt:'',log:''}],books:rows});
	});
});

//书刊遗失
router.get('/lost',ensureAuthenticated,function(req,res){
	res.render('lost',{title:'书刊遗失-我的图书馆',
		arr:[{sch:'',lib:'active',abt:'',log:''}]});
});

//证件信息
router.get('/info',ensureAuthenticated,function(req,res){
	var userInfo=res.locals.user;
	if(userInfo.sex=='m'){
		userInfo.sex='男';
	}else{
		userInfo.sex='女';
	}
	res.render('info',{title:'读者信息-我的图书馆',
		arr:[{sch:'',lib:'active',abt:'',log:''}],userInfo});
});

//登录认证
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/login');
	}
}

module.exports = router;