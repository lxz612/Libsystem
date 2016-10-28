var db=require('./dbhelper');

//预约操作
var Order={};

module.exports=Order;

//预约 
//首先检查权限 --是不是自己已借阅
Order.save=function(number,marc_no,callback){
	var date = new Date().Format("yyyy-MM-dd hh:mm:ss");
	var state='0';//0-未到 1-预约到书 2-已取书 3-预约取消
	var sql="insert into yuyue (number,marc_no,orderd,state) values ('"+number+"','"+marc_no+"','"+date+"','"+state+"');";
	db.exec(sql,'',function(err,rows){
		callback(err);
	});
}

//根据证件号查找预约信息
Order.findOrderByreaderId=function(number,callback){
	var sql="select distinct bk.callnumber,bk.title,bk.author,bk.address,yu.marc_no,yu.orderd,yu.ind,yu.state from yuyue yu,book bk where yu.number='"+number+"' and yu.marc_no=bk.marc_no;";
	db.exec(sql,'',function(err,rows){
		callback(err,rows);
	});
};

//取消预约
Order.cancal=function(number,marc_no,callback){
	var sql="update yuyue set state='2' where number='"+number+"' and marc_no='"+marc_no+"';";
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