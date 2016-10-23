var express = require('express');
var router = express.Router();
var Borrow=require('../models/borrow');


router.get('/myborrow',ensureAuthenticated,function(req,res){
	var number=res.locals.user.number;
	Borrow.findNowBorrow(number,function(err,rows){
		if(err){
			return next(err);
		}
		rows.forEach(function(row){
			row.indate=row.outdate.getFullYear()+'-'+(row.outdate.getMonth()+2)+'-'+row.outdate.getDate();
			row.outdate=row.outdate.toLocaleDateString();//格式化时间
		});
		res.render('myborrow',{title:'当前借阅-我的图书馆',
			arr:[{sch:'',lib:'active',abt:'',log:''}],borrows:rows});
	});
});

router.get('/order',ensureAuthenticated,function(req,res){
	res.render('order',{title:'我的预约-我的图书馆',
		arr:[{sch:'',lib:'active',abt:'',log:''}]});
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
