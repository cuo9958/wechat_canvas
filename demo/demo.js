// page
import { Engine, CreateBox, CreateText, CreateCir, CreateTexts } from "../index";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        ctxWidth: 300,
        ctxHeight: 300,
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function () {
        const goodDetail = {
            sku: "XY3614IGXTB001",
            image: "http://img7.daling.com/data/files/zin/public/common/2020/06/24/14/32/26/525400B9EA937PT6Y000008133132.JPG",
            goodsName: "复合浆果精粹饮品(10g*20条)",
            goodsShowName: "每天打开一支美丽",
            goodsShowDesc: "[昱都/YUDU  HEALTH]复合浆果精粹饮品(10g*20条)",
            salePrice: "79.9",
            marketPrice: "266",
            benefitMoney: "7.19",
            userType: 2,
            userLevel: 1,
            levelSalePrice: "72.71",
            discount: "9.1",
            stockMsg: "4962件",
            stock: 4962,
        };
        const UserData = {
            nickName: "疯狂紫萧",
            headimgUrl: "http://img.daling.com/zin/public/weChatHeadNew/2020/06/22/18/20/12/0c5fcba801dc4f9ff39b84f095125f39.JPG",
            followerPromoCode: "1089690",
            promoCode: "1093558",
            userType: 2,
            level: 1,
        };
        let { screenWidth } = getApp().globalData.systemInfo;
        //初始化容器
        let eg = await Engine("test_canvas", 750, 1200, screenWidth / 750);
        //添加背景色
        const bg = CreateBox(0, 0, 750, 1180);
        bg.setData("backgroundColor", "#fff");
        eg.add(bg);
        //画大图
        const bigimg = CreateBox(0, 0, 750, 750);
        bigimg.setData({
            backgroundColor: "#ccc",
            image: goodDetail.image,
        });
        eg.add(bigimg);
        //画头像
        const tou = CreateCir(20, 755, 70);
        tou.setData({
            backgroundColor: "#ccc",
            image: UserData.headimgUrl,
        });
        eg.add(tou);
        //昵称
        const nickname = CreateText(UserData.nickName, 0, 180);
        nickname.setData({
            w: tou.data.w,
            color: "#333",
            align: "center",
            font: "normal normal 30px sans-serif",
        });
        nickname.setFontSize(30);
        tou.add(nickname);
        //价格
        const price1 = CreateText("￥" + goodDetail.salePrice, 20, 1020);
        price1.setData({
            color: "#333",
            font: "normal bold 50px sans-serif",
        });
        price1.setFontSize(50);
        eg.add(price1);
        //价格2
        const price2 = CreateText("￥" + goodDetail.marketPrice, 180, 0);
        price2.setData({
            valign: "bottom",
            color: "#B1AFAF",
            font: "normal normal 26px sans-serif",
        });
        price2.setFontSize(26);
        price1.add(price2);
        //文案
        const title_1 = CreateTexts(goodDetail.goodsShowDesc, 30, 1080, 510);
        title_1.setData({
            color: "#313131",
            font: "normal normal 28px sans-serif",
        });
        title_1.setFontSize(28);
        eg.add(title_1);
        eg.start();
    },
});
