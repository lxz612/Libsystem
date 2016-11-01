//这是搜索界面所需要的js代码

//下拉框选择
function CustomDropDown(element) {
  this.dropdown = element;
  this.placeholder = this.dropdown.find(".placeholder");
  this.options = this.dropdown.find("ul.dropdown-menu > li");
  this.val = '0';
  this.index = -1; //默认为-1;
  this.initEvents(); //初始化事件
}

//原型方法
CustomDropDown.prototype = {
  initEvents: function() {
    var obj = this;
    //这个方法可以不写，因为点击事件被Bootstrap本身就捕获了，显示下面下拉列表
    // obj.dropdown.on("click", function(event) {
    //   $(this).toggleClass("active");
    // });

    //点击下拉列表的选项
    obj.options.on("click", function() {
      var opt = $(this);
      obj.text = opt.find("a").text();
      obj.val = opt.attr("value");
      obj.index = opt.index();
      obj.placeholder.text(obj.text);
      // console.log(obj.getValue());
    });
  },
  getText: function() {
    return this.text;
  },
  getValue: function() {
    return this.val;
  },
  getIndex: function() {
    return this.index;
  }
};

//单选框选择
function RadioSelect(element) {
  this.obj = element;

  this.options = this.obj.find('input');

  this.val = 'all';
  this.initEvents();
}

RadioSelect.prototype = {
  initEvents: function() {
    var obj = this;
    obj.options.on('change', function() {
      var opt = $(this);
      obj.val = opt.attr("value");
      // console.log(obj.getValue());
    });
  },
  getValue: function() {
    return this.val;
  }
};

//搜索
$(document).ready(function() {
  var mydropdown = new CustomDropDown($("#dropdown1"));
  var myradio = new RadioSelect($("#radioselect"));

  //搜索按钮点击
  $('#submit').click(function() {
    var url = '/search/r';
    var searchType = mydropdown.getValue();
    var bookType = myradio.getValue();
    var content = $('#content').val();
    if (content == '') {
      alert('请输入搜索内容...');
    } else {
      url = url + "?sType=" + searchType + "&bType=" + bookType + "&content=" + content;
      //跳转结果页 GET
      document.location.href = url;
    }
  });
});