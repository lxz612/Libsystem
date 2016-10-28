var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User=require('../models/user');
var Book=require('../models/book');
var Borrow=require('../models/borrow');
var Order=require('../models/order');

//跳转搜索页
router.get('/',function(req,res){
	res.redirect('/search');
});

//获取书目检索页
router.get('/search',function(req,res){
	res.render('search',{title:'书目检索-图书流通管理系统',
		arr:[{sch:'active',lib:'',abt:'',log:''}]});
});

//处理书目检索请求
router.post('/search',function(req,res,next) {
	//获取post请求正文
	console.log('body',req.body);
	var searchType=req.body.searchType;//搜索类型
	var bookType=req.body.bookType;//书籍类型
	var content=req.body.content;//搜索内容
	Book.findBooksByTitle(content,function(err,books){
		if(err){
			return next(err);//使用return XXX 的写法是为了在发错误时不会出现res重复响应状况 
		}
		books.forEach(function(book){
			if(book.type==0){
				book.type='中文图书';
			}
		});
		res.render('result',{title:'搜索结果-图书流通管理系统',
			arr:[{sch:'active',lib:'',abt:'',log:''}],books:books});
	});
});

//获得书籍详情
router.get('/books',function(req,res,next){
	var isbn=req.query['isbn'];
	Book.findBooksByISBN(isbn,function(err,bookInfo,booksState){
		if(err){
			return next(err);
		}

		var isOrder=true;
		booksState.forEach(function(book){
			if(book.state==0){
				book.state='可借';
				book.isBorrow='<a href="/borrow?barcode='+book.barcode+'">借阅</a>';
				isOrder=false;
			}else if(book.state==1){
				book.state='借出';
				book.isBorrow='此书已借出';
			}else if(book.state==2){
				book.state='遗失';
				book.isBorrow='遗失';
			}
		});
		if(isOrder){
			isOrder='<a href="/order?isbn='+bookInfo.isbn+'">预约</a>';
		}else{
			isOrder='书库尚有书,不可预约';
		}
		res.render('books',{title:'书目信息-图书流通管理系统',
			arr:[{sch:'active',lib:'',abt:'',log:''}],bookInfo:bookInfo,booksState:booksState,isOrder:isOrder});
	});
});

//跳转借书界面
router.get('/borrow',ensureAuthenticated,function(req,res,next){
	var barcode=req.query['barcode'];
	Book.findBookBybarcode(barcode,function(err,book){
		if (err) {
			return next(err);
		}
		res.render('borrow',{title:'借阅-图书流通管理系统',
	 		arr:[{sch:'active',lib:'',abt:'',log:''}],book:book});
	});
});

//提交借书请求
router.post('/borrow',ensureAuthenticated,function(req,res,next){
	var barcode=req.body.barcode;//书籍条码号
	var readerId=res.locals.user.readerId;//读者证件号
	Borrow.save(readerId,barcode,function(err){
		if (err) { 
			return next(err);
		}
		res.render('result_borrow',{title:'借阅结果-图书流通管理系统',
		 		arr:[{sch:'active',lib:'',abt:'',log:''}]});
	});
});

//跳转预约界面
router.get('/order',ensureAuthenticated,function(req,res,next){
	var isbn=req.query['isbn'];
	Book.findBooksByISBN(isbn,function(err,books){
		if(err){
			return next(err);
		}
		res.render('order',{title:'预约-图书流通管理系统',
			arr:[{sch:'active',lib:'',abt:'',log:''}],book:books[0]});
	});
})

//发送预约请求
router.post('/order',ensureAuthenticated,function(req,res,next){
	var isbn=req.body['isbn'];
	var readerId=res.locals.user.readerId;
	Order.save(readerId,isbn,function(err){
		if (err) {
			return next(err);
		}
		res.render('result_order',{title:'预约结果-图书管理系统',
		arr:[{sch:'active',lib:'',abt:'',log:''}]});
	});
})

//获取登录页
router.get('/login',function(req,res){
	res.render('login',{title:'登录-图书流通管理系统',
		arr:[{sch:'',lib:'active',abt:'',log:''}]});
});

//提交登录请求
router.post('/login',function(req,res,next){
	var referer=req.body.referer;
	passport.authenticate('local',function(err, user, info){
		if(err) {
			return next(err);
		}
		if(!user){
			return res.redirect('/login');
		}
		req.logIn(user, function(err) {//这里内部会调用passport.serializeUser()
		  	if (err) { return next(err); }
		  	if(referer!='http://127.0.0.1:3000/login'){
		  		return res.redirect(referer);
		  	}
		  	return res.redirect('/mylib/myborrow');
		});
	})(req, res, next);
});

passport.use(new LocalStrategy(
	function(username,password,done){//username即数据库表中的readerId
		User.findUserByreaderId(username,function(err,user){
			if(err) {
				return done(err);
			}
			if(!user){
				return done(null,false,{message:'找不到用户名'});
			}
			if(user.password!=password){
				return done(null,false, {message: '密码匹配有误!'});
			}
			return done(null,user);
		});
	})
);

// serializeUser 在用户登录验证成功以后将会把用户的数据存储到 session 中（在这里
// 存到 session 中的是用户的 username）。在这里的 user 应为我们之前在 new
// LocalStrategy (fution() { ... }) 中传递到回调函数 done 的参数 user 对象（从数据// 库中获取到的）
passport.serializeUser(function(user,done){
	done(null,user.readerId);
});

// deserializeUser 在每次请求的时候将会根据用户名读取 从 session 中读取用户的全部数据
// 的对象，并将其封装到 req.user
passport.deserializeUser(function(username,done){
	User.findUserByreaderId(username,function(err,user){
		done(err,user);
	});
});

//退出登录
router.get('/loginOut',function(req,res){
	req.logout();
	res.redirect('/login');
});

//关于
router.get('/about',function(req,res){
	res.render('about',{title:'关于-图书流通管理系统',
		arr:[{sch:'',lib:'',abt:'active',log:''}]});
});

//登录验证
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/login');
	}
}

module.exports = router;