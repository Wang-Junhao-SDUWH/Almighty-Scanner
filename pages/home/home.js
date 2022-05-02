// pages/home/home.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    usr_imgs:["img/filmtocat.png","img/yogitocat.png","img/hula_loop_octodex.gif","img/mona-the-rivetertocat.png","img/Fintechtocat.png","img/welcometocat.png",
  "img/daftpunktocat-thomas.gif","img/kimonotocat.png","img/spidertocat.png","img/stormtroopocat.png","img/homercat.png","img/minion.png","img/herme-t-crabb.png","img/megacat.jpg","img/baracktocat.jpg","img/xtocat.jpg","img/okal-eltocat.jpg","img/holycrap.jpg",
"img/ironcat.jpg","img/benevocats.png"],
    usr_img:"img/filmtocat.png",
    img_box_width:660,
    img_box_height:500,
    img_width:500,
    img_height:500,
    img_fetched:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var random = Math.floor(Math.random() * 19 );
    var welcome_img = this.data.usr_imgs[random];
    this.setData({  
      usr_img:welcome_img  
  })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },
  size_adaption:function(e){
    var width=e.detail.width;  //获取图片真实宽度  
    var height=e.detail.height;  
    var ratio=height/width;   //图片的真实高宽比例  
    var box_ratio = this.data.img_box_height/this.data.img_box_width;
    if(ratio > box_ratio){
      var viewHeight=this.data.img_box_height,   
          viewWidth=viewHeight/ratio;   
    }else{
      var viewWidth=this.data.img_box_width,   
          viewHeight=viewWidth*ratio; 
    }
    this.setData({  
        img_width:viewWidth,  
        img_height:viewHeight  
    })
  },
  fetch_pic:function(){
    var that = this
    wx.showActionSheet({
      itemList: ['拍照','从相册选择'],
      success(res) {
        console.log(res.tapIndex)
        if(res.tapIndex==0){ 
          wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['camera'],
            success: (res)=> {
              that.setData({
                usr_img:res.tempFilePaths[0],
                img_fetched:true
              })//res.tempFilePaths[0] 是图片
             },
          })
        } else if(res.tapIndex==1){
          wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album'],
            success: (res)=> {
              that.setData({
                //tempFilePaths要加个[0]，不然保存下来的就是个列表
                usr_img:res.tempFilePaths[0],
                img_fetched:true
              })
              // var img_path = that.data.usr_img[0]
              // console.log('img Path',img_path)
              // var img_type = img_path.substring(img_path.length-4,img_path.length)
              // console.log('./temp/'+'temp'+img_type)
            },
          })
        }
      }
    })
    },
  clean_pic:function(){
    var that = this
    wx.showLoading({
      title: '正在扫描...',
    })
    wx.getImageInfo({
      src: that.data.usr_img,
      success:(imgInfo)=>{
        var imgPath = imgInfo.path;
        var img_type_and_some_name = imgPath.substr(imgPath.length-9,imgPath.length)
        wx.getFileSystemManager().readFile({
          filePath: imgPath, 
          success: (res) => { 
            var that = this
            wx.uploadFile({
              filePath: imgPath,
              name: 'file',
              url: 'http://47.119.130.74/PowerfulScanner',
              formData:{
                'holycrap': 'upload_img'
              },
              success: function(res){
                wx.showToast({
                  title: '扫描完成',
                  duration:1000
                })
                wx.hideLoading({
                  complete: (res) => {},
                })
                const fileManager = wx.getFileSystemManager()
                fileManager.writeFile({
                  filePath:wx.env.USER_DATA_PATH + '/res_'+img_type_and_some_name,
                  data:res.data,
                  encoding:'base64',
                  success:(res)=>{
                    that.setData({
                      usr_img:wx.env.USER_DATA_PATH + '/res_'+img_type_and_some_name
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  },
  // 获取保存图片的权限
  save_pic_auth: function(e) {
    let _this = this
    wx.showActionSheet({
        itemList: ['保存到相册'],
        success(res) {
            let url = e.currentTarget.dataset.url;
            wx.getSetting({
                success: (res) => {
                    if (!res.authSetting['scope.writePhotosAlbum']) {
                        wx.authorize({
                            scope: 'scope.writePhotosAlbum',
                            success: () => {
                                // 同意授权
                                _this.save_pic(url);
                            },
                            fail: (res) => {
                                console.log(res);
                                wx.showModal({
                                    title: '保存失败',
                                    content: '请开启访问手机相册权限',
                                    success(res) {
                                        wx.openSetting()
                                    }
                                })
                            }
                        })
                    } else {
                        // 已经授权了
                        _this.save_pic(url);
                    }
                },
                fail: (res) => {
                    console.log(res);
                }
            })   
        },
        fail(res) {
            console.log(res.errMsg)
        }
    })
  },
  // 保存图片
  save_pic:function(url){
    wx.getImageInfo({
      src: url,
      success: (res) => {
          let path = res.path;
          wx.saveImageToPhotosAlbum({
              filePath: path,
              success: (res) => {
                  console.log(res);
                  wx.showToast({
                      title: '保存成功',
                  })
              },
              fail: (res) => {
                  console.log(res);
              }
          })
      },
      fail: (res) => {
          console.log(res);
      }
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})