var express = require('express');
var router = express.Router();
var Borrow=require('../models/borrow');
var Order=require('../models/order');

router.get('/myborrow',ensureAuthenticated,function(req,res){
	var number=res.locals.user.number;
	Borrow.findNowBorrow(number,function(err,rows){
		if(err){
			return next(err);
		}
		rows.forEach(function(row){
			//应还日期
			if(row.frequency){
				row.indate=row.outdate.getFullYear()+'-'+(row.outdate.getMonth()+2)+'-'+(row.outdate.getDate()+row.frequency*10);
			}else{
				row.indate=row.outdate.getFullYear()+'-'+(row.outdate.getMonth()+2)+'-'+row.outdate.getDate();
			}
			//借阅日期
			row.outdate=row.outdate.toLocaleDateString();//格式化时间
		});
		res.render('myborrow',{title:'当前借阅-我的图书馆',
			arr:[{sch:'',lib:'active',abt:'',log:''}],borrows:rows});
	});
});

router.get('/renew',ensureAuthenticated,function(req,res,next){
	var barcode=req.query.barcode;
	var number=res.locals.user.number;
	Borrow.renew(number,barcode,function(err){
		if(err){
			return next(err);
		}
		// res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
		res.end('success');
	});
});

router.get('/myorder',ensureAuthenticated,function(req,res){
	var number=res.locals.user.number;
	Order.findOrderByNumber(number,function(err,books){
		books.forEach(function(book){
			//预约失效日期
			// book.orderd=book.orderd.getFullYear()+'-'+(book.orderd.getMonth()+2)+'-'+book.orderd.getDate();
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

router.get('/cancal',ensureAuthenticated,function(req,res){
	var number=res.locals.user.number;
	var marc_no=req.query['marc_no'];
	Order.cancal(number,marc_no,function(err){
		if(err){
			return next(err);
		}
		res.end('success');
	});
});

router.get('/history',ensureAuthenticated,function(req,res){
	var number=res.locals.user.number;
	Borrow.findHistory(number,function(err,rows){
		if(err){
			return next(err);
		}
		rows.forEach(function(row){
			row.indate=row.indate.toLocaleDateString();
			row.outdate=row.outdate.toLocaleDateString();//格式化时间
		});
		res.render('history',{title:'借阅历史-我的图书馆',
			arr:[{sch:'',lib:'active',abt:'',log:''}],books:rows});
	});
});

router.get('/lost',ensureAuthenticated,function(req,res){
	res.render('lost',{title:'书刊遗失-我的图书馆',
		arr:[{sch:'',lib:'active',abt:'',log:''}]});
});

router.get('/info',ensureAuthenticated,function(req,res){
	var info=res.locals.user;
	res.render('info',{title:'读者信息-我的图书馆',
		arr:[{sch:'',lib:'active',abt:'',log:''}],info});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/login');
	}
}

module.exports = router;
