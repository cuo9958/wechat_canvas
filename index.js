//引擎，基础类，文字、图片对象
import { splitStringByte } from "./util";

const sdk_v = wx.getSystemInfoSync().SDKVersion;

const Utils = {
    _has2d: null,
    has2D() {
        if (Utils._has2d !== null) return Utils._has2d;
        const sdk_list = sdk_v.split(".");
        if (sdk_list[0] * 1 < 2) return (Utils._has2d = false);
        if (sdk_list[0] * 1 > 2) return (Utils._has2d = true);
        if (sdk_list[1] * 1 < 7) return (Utils._has2d = false);
        if (sdk_list[2] * 1 > 0) return (Utils._has2d = true);
        return (Utils._has2d = false);
    },
    wx_downloadFile: async (img, isHttps = true) => {
        let res = await new Promise((resolve) => {
            wx.downloadFile({
                url: img,
                success(res) {
                    resolve(res.tempFilePath);
                },
                fail(e) {
                    console.log("wx_downloadFile---->", e);
                },
            });
        });
        return res;
    },
    _px: 0,
    getPx() {
        if (Utils._px) return Utils._px;
        const data = wx.getSystemInfoSync();
        Utils._px = data.windowWidth / 750;
        return Utils._px;
    },
    _pr: 0,
    getPR() {
        if (Utils._pr) return Utils._pr;
        const data = wx.getSystemInfoSync();
        Utils._pr = data.pixelRatio;
        return Utils._pr;
    },
};
class EngineBase {
    constructor(canvas, ctx, width, height) {
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext("2d");
        }

        this.canvas = canvas;
        this.ctx = ctx;
        this.list = [];
        this.width = width;
        this.height = height;
    }
    add(dom) {
        dom.root = this.ctx;
        this.list.push(dom);
        dom.preUpdate();
    }
    remove(dom) {
        this.list = this.list.filter((item) => item.id != dom.id);
    }
    async update(len, list) {
        if (len >= list.length) return;
        const child = list[len];
        try {
            await child.update(this.ctx, this.canvas);
            if (child.child.length > 0) {
                await this.update(0, child.child);
            }
        } catch (error) {
            console.log(error);
        }
        await this.update(len + 1, list);
    }
}
class Engine2D extends EngineBase {
    constructor(canvas, width, height) {
        super(canvas, null, width, height);
    }
    async start() {
        await this.update(0, this.list);
    }
}
//基础类
class DisObject {
    constructor(type) {
        this.parent = null;
        this.child = [];
        this.type = type;
        this.id = Math.round(Math.random() * 10000);
    }
    update(ctx) {
        console.log("默认更新", ctx);
    }
    add(node) {
        node.parent = this;
        node.root = this.root;
        node.resize();
        this.child.push(node);
    }
    remove(dom) {
        this.child = this.child.filter((item) => item.id != dom.id);
    }
    //加入层级之后
    preUpdate() {}
    /**
     * 设置单个值或者多个值
     * @param {*} key key值或者对象
     * @param {*} val 值
     */
    setData(key, val) {
        if (typeof key === "string") {
            this.data[key] = val;
        } else {
            for (const item in key) {
                this.data[item] = key[item];
            }
        }
    }
    resize() {
        this.data.x = this.parent.data.x + this.data.x;
        this.data.y = this.parent.data.y + this.data.y;
        this.data.rotate = this.parent.data.rotate + this.data.rotate;
        this.data.scalex = this.parent.data.scalex * this.data.scalex;
        this.data.scaley = this.parent.data.scaley * this.data.scaley;
    }
}

//盒子
class Box2D extends DisObject {
    constructor(x, y, w, h) {
        super("box");
        this.data = {
            x,
            y,
            w,
            h,
            image: "",
            backgroundColor: "",
            sx: 0,
            sy: 0,
            sw: 0,
            sh: 0,
            rotate: 0,
            scalex: 1,
            scaley: 1,
        };
    }
    /**
     * 加载图片
     * @param {*} src src
     * @param {*} canvas canvas
     */
    getImageResource(src, canvas) {
        return new Promise((resolve, reject) => {
            const img = canvas.createImage();
            const timer = setTimeout(() => {
                reject("");
            }, 5000);
            img.onload = function () {
                clearTimeout(timer);
                resolve(img);
            };
            img.src = src;
        });
    }

    async update(ctx, canvas) {
        const data = this.data;
        ctx.save();
        if (data.rotate) {
            ctx.rotate((data.rotate * Math.PI) / 180);
        }
        if (data.scalex !== 1 || data.scaley !== 1) {
            ctx.scale(data.scalex, data.scaley);
        }
        if (data.backgroundColor) {
            ctx.fillStyle = data.backgroundColor;
            ctx.fillRect(data.x, data.y, data.w, data.h);
        }
        if (data.image) {
            const img = await this.getImageResource(data.image, canvas);
            if (img) {
                if (data.sw && data.sh) {
                    ctx.drawImage(img, data.sx, data.sy, data.sw, data.sh, data.x, data.y, data.w, data.h);
                } else {
                    ctx.drawImage(img, data.x, data.y, data.w, data.h);
                }
            }
        }
        ctx.restore();
    }
}
class Text2D extends DisObject {
    constructor(str, x, y) {
        super("text");
        this.data = {
            str,
            x,
            y,
            w: 0,
            font: "",
            rotate: 0,
            scalex: 1,
            scaley: 1,
            color: "",
            align: "",
        };
    }
    getWidth() {
        if (!this.root) return 0;
        const data = this.data;
        const ctx = this.root;
        ctx.save();
        if (data.color) {
            ctx.fillStyle = data.color;
        }
        if (data.font) {
            ctx.font = data.font;
        }
        const metrics = ctx.measureText(data.str);
        ctx.restore();
        return metrics.width;
    }
    setFontSize() {}
    async update(ctx) {
        const data = this.data;
        ctx.save();
        if (data.rotate) {
            ctx.rotate((data.rotate * Math.PI) / 180);
        }
        if (data.scalex !== 1 || data.scaley !== 1) {
            ctx.scale(data.scalex, data.scaley);
        }
        if (data.color) {
            ctx.fillStyle = data.color;
        }
        if (data.font) {
            ctx.font = data.font;
        }
        let tx = data.x;
        if (data.align) {
            ctx.textAlign = "center";
            if (data.align === "center") {
                tx = data.x + data.w / 2;
            }
        }
        if (data.w) {
            ctx.fillText(data.str, tx, data.y, data.w);
        } else {
            ctx.fillText(data.str, tx, data.y);
        }
        ctx.restore();
    }
}
class Cir2D extends DisObject {
    constructor(x, y, r) {
        super("cir");
        this.data = {
            rx: x + r,
            ry: y + r,
            x,
            y,
            r,
            w: r * 2,
            h: r * 2,
            image: "",
            backgroundColor: "",
            sx: 0,
            sy: 0,
            sw: 0,
            sh: 0,
            rotate: 0,
            scalex: 1,
            scaley: 1,
            borderColor: "#333",
            borderWidth: 3,
        };
    }
    /**
     * 加载图片
     * @param {*} src src
     * @param {*} canvas canvas
     */
    getImageResource(src, canvas) {
        return new Promise((resolve, reject) => {
            const img = canvas.createImage();
            const timer = setTimeout(() => {
                reject("");
            }, 5000);
            img.onload = function () {
                clearTimeout(timer);
                resolve(img);
            };
            img.src = src;
        });
    }
    async update(ctx, canvas) {
        const data = this.data;
        ctx.save();
        if (data.rotate) {
            ctx.rotate((data.rotate * Math.PI) / 180);
        }
        if (data.scalex !== 1 || data.scaley !== 1) {
            ctx.scale(data.scalex, data.scaley);
        }

        ctx.lineWidth = data.borderWidth;
        ctx.beginPath();
        ctx.arc(data.rx, data.ry, data.r, 0, Math.PI * 2, true);
        ctx.clip();
        if (data.backgroundColor) {
            ctx.fillStyle = data.backgroundColor;
            ctx.fillRect(data.x, data.y, data.w, data.h);
        }
        if (data.image) {
            const img = await this.getImageResource(data.image, canvas);
            if (img) {
                if (data.sw && data.sh) {
                    ctx.drawImage(img, data.sx, data.sy, data.sw, data.sh, data.x, data.y, data.w, data.h);
                } else {
                    ctx.drawImage(img, data.x, data.y, data.w, data.h);
                }
            }
        }
        ctx.strokeStyle = data.borderColor;
        ctx.stroke();
        ctx.restore();
    }
}
class Engine1d extends EngineBase {
    constructor(ctx, width, height) {
        super(null, ctx, width, height);
        this.ctx.px = Utils.getPx();
    }
    async start() {
        await this.update(0, this.list);
    }
}
class Box1D extends DisObject {
    constructor(x, y, w, h) {
        super("box");
        this.data = {
            x,
            y,
            w,
            h,
            image: "",
            backgroundColor: "",
            sx: 0,
            sy: 0,
            sw: 0,
            sh: 0,
            rotate: 0,
            scalex: 1,
            scaley: 1,
        };
    }

    async update(ctx, canvas) {
        const data = this.data;
        const px = this.root.px;
        ctx.save();
        if (data.rotate) {
            ctx.rotate((data.rotate * Math.PI) / 180);
        }
        if (data.scalex !== 1 || data.scaley !== 1) {
            ctx.scale(data.scalex, data.scaley);
        }
        if (data.backgroundColor) {
            ctx.setFillStyle(data.backgroundColor);
            ctx.rect(data.x * px, data.y * px, data.w * px, data.h * px);
            ctx.fill();
        }
        if (data.image) {
            const img = await Utils.wx_downloadFile(data.image, canvas);
            if (img) {
                if (data.sw && data.sh) {
                    ctx.drawImage(img, data.sx * px, data.sy * px, data.sw * px, data.sh * px, data.x * px, data.y * px, data.w * px, data.h * px);
                } else {
                    ctx.drawImage(img, data.x * px, data.y * px, data.w * px, data.h * px);
                }
            }
        }
        ctx.restore();
        ctx.draw(true);
    }
}
class Text1D extends DisObject {
    constructor(str, x, y) {
        super("text");
        this.data = {
            str,
            x,
            y,
            w: 0,
            font: "",
            rotate: 0,
            scalex: 1,
            scaley: 1,
            color: "#333",
            align: "",
            fontSize: 0,
            valign: "",
        };
    }
    getWidth() {
        if (!this.root) return 0;
        const data = this.data;
        const ctx = this.root;
        const px = this.root.px;
        ctx.save();
        if (data.font) {
            ctx.font = data.font;
        }
        if (data.fontSize) {
            ctx.setFontSize(data.fontSize * px);
        }
        if (data.color) {
            ctx.setFillStyle(data.color);
        }
        const metrics = ctx.measureText(data.str);
        ctx.restore();
        return metrics.width;
    }
    setFontSize(size) {
        this.data.fontSize = size;
    }
    async update(ctx) {
        const data = this.data;
        const px = this.root.px;
        ctx.save();
        if (data.rotate) {
            ctx.rotate((data.rotate * Math.PI) / 180);
        }
        if (data.scalex !== 1 || data.scaley !== 1) {
            ctx.scale(data.scalex, data.scaley);
        }
        if (data.font) {
            ctx.font = data.font;
        }
        if (data.fontSize) {
            ctx.setFontSize(data.fontSize * px);
        }
        if (data.color) {
            ctx.setFillStyle(data.color);
        }
        let tx = data.x;
        if (data.align) {
            ctx.setTextAlign(data.align);
            if (data.align === "center") {
                tx = data.x + data.w / 2;
            }
        }
        if (data.valign) {
            ctx.setTextBaseline(data.valign);
        }
        if (data.w) {
            ctx.fillText(data.str, tx * px, data.y * px, data.w * px);
        } else {
            ctx.fillText(data.str, tx * px, data.y * px);
        }
        ctx.restore();
        ctx.draw(true);
    }
}
class Cir1D extends DisObject {
    constructor(x, y, r) {
        super("cir");
        this.data = {
            rx: x + r,
            ry: y + r,
            x,
            y,
            r,
            w: r * 2,
            h: r * 2,
            image: "",
            sx: 0,
            sy: 0,
            sw: 0,
            sh: 0,
            rotate: 0,
            scalex: 1,
            scaley: 1,
            borderColor: "#333",
            borderWidth: 3,
        };
    }

    async update(ctx, canvas) {
        const data = this.data;
        const px = this.root.px;
        ctx.save();
        if (data.rotate) {
            ctx.rotate((data.rotate * Math.PI) / 180);
        }
        if (data.scalex !== 1 || data.scaley !== 1) {
            ctx.scale(data.scalex, data.scaley);
        }

        ctx.setLineWidth(data.borderWidth * px);
        ctx.beginPath();
        ctx.arc(data.rx * px, data.ry * px, data.r * px, 0, Math.PI * 2, true);
        ctx.clip();
        if (data.image) {
            const img = await Utils.wx_downloadFile(data.image, canvas);
            if (img) {
                if (data.sw && data.sh) {
                    ctx.drawImage(img, data.sx * px, data.sy * px, data.sw * px, data.sh * px, data.x * px, data.y * px, data.w * px, data.h * px);
                } else {
                    ctx.drawImage(img, data.x * px, data.y * px, data.w * px, data.h * px);
                }
            }
        }
        ctx.setStrokeStyle(data.borderColor);
        ctx.stroke();
        ctx.restore();
        ctx.draw(true);
    }
}
/**
 * 创建一个引擎基层
 * @param {*} id id
 * @param {*} w 宽
 * @param {*} h 高
 */
async function Engine(id, w, h) {
    if (Utils.has2D()) {
        return new Promise((resolve) => {
            const query = wx.createSelectorQuery();
            query
                .select("#" + id)
                .node()
                .exec((res) => {
                    const canvas = res[0].node;
                    let eg = new Engine2D(canvas, w, h);
                    resolve(eg);
                });
        });
    }
    let ctx = wx.createCanvasContext("test_canvas", this);
    return new Engine1d(ctx, w, h);
}
function CreateBox(x, y, w, h) {
    if (Utils.has2D()) {
        return new Box2D(x, y, w, h);
    }
    return new Box1D(x, y, w, h);
}
function CreateText(str, x, y) {
    if (Utils.has2D()) {
        return new Text2D(str, x, y);
    }
    return new Text1D(str, x, y);
}
//圆形
function CreateCir(rx, ry, r) {
    if (Utils.has2D()) {
        return new Cir2D(rx, ry, r);
    }
    return new Cir1D(rx, ry, r);
}

class Texts extends DisObject {
    constructor(str, x, y, mw) {
        super("texts");
        this.data = {
            str,
            x,
            y,
            w: 0,
            font: "",
            rotate: 0,
            scalex: 1,
            scaley: 1,
            color: "",
            align: "",
            fontSize: 0,
            lineHeight: 40,
            mw: mw,
        };
        this.list = [];
    }
    setFontSize(size) {
        this.data.fontSize = size;
    }
    preUpdate() {
        const test_title = CreateText();
        test_title.setData(this.data);
        test_title.setData({
            str: "a",
        });
        test_title.setFontSize(28);
        test_title.root = this.root;
        this.child.push(test_title);
        const width = test_title.getWidth();
        let count_len = this.data.mw / width;
        if (!Utils.has2D()) {
            count_len = count_len * Utils.getPx();
        }
        const max_title = Math.floor(count_len);
        const title_list = splitStringByte(this.data.str, max_title);
        const title1 = title_list.shift();
        test_title.setData("str", title1);
        if (title_list.length === 0) return;
        title_list.forEach((item, index) => {
            const temp = CreateText();
            temp.setData(this.data);
            temp.setData({
                str: item,
                y: this.data.y + this.data.lineHeight * (index + 1),
            });
            temp.root = this.root;
            this.child.push(temp);
        });
    }
}

function CreateTexts(str, x, y, mw) {
    return new Texts(str, x, y, mw);
}
export { Engine, CreateBox, CreateText, CreateCir, Utils, CreateTexts };
