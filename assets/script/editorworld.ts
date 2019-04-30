import { Bezier } from "./math/bezier";
import { Global } from "./global";
import { define } from "./math/define";
const { ccclass, property } = cc._decorator;

@ccclass
export default class EditorWorld extends cc.Component {
    // 显示点预制体
    @property(cc.Prefab)
    pointPrefab: cc.Prefab = null;

    // 控制点预制体
    @property(cc.Prefab)
    controlPointPrefab: cc.Prefab = null;

    // 滚动视图
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    // 滚动视图内容
    @property(cc.Node)
    scrollViewContent: cc.Node = null;

    // 滚动视图内容单元预制体
    @property(cc.Prefab)
    scrollViewCellPrefab: cc.Prefab = null;

    bezier: any; // bezier对象
    pointPool: any[] = []; // 对象池
    controlPointList: any[] = []; // 控制点数组
    linePointList: any[] = []; // 曲线点
    bezierConfig: any; // bezier配置
    currentBezierId: string; // 当前曲线ID

    // 生命周期函数, 加载资源和数据
    onLoad() {
        let touchPoint = undefined;
        // 监听'开始点击'事件
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Touch) => {
            for (const key in this.controlPointList) {
                let point = this.controlPointList[key];
                let dis = point.position.sub(this.node.parent.convertTouchToNodeSpace(event)).mag();
                if (dis < 10) {
                    touchPoint = point;
                }
            }
        });

        // 监听'点击移动'事件
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Touch) => {
            if (touchPoint) {
                touchPoint.position = this.node.parent.convertTouchToNodeSpace(event);
            }
        });

        // 监听'结束点击'事件
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Touch) => {
            if (touchPoint === undefined) {
                let touchPos = this.node.parent.convertTouchToNodeSpace(event);
                this.addPoint(touchPos);
            } else {
                touchPoint = undefined;
            }
        });

        cc.loader.loadRes(define.configMap.bezierConfig, (err, result) => {
            if (err) {
                console.log("load bezier config err = " + err);
                return;
            }
            this.bezierConfig = result.json;
            this.initScrollView(result.json);
            let id = Object.keys(result.json)[0];
            this.showBezier(id);
        });

        Global.eventListener.on("CHOOSE_BEZIER", (id: string) => {
            this.showBezier(id);
        });

    }

    initScrollView(result: any) {
        for (const i in result) {
            this.addScrollViewCell(i);
        }
    }

    addScrollViewCell(i: string) {
        let node = cc.instantiate(this.scrollViewCellPrefab);
        this.scrollViewContent.addChild(node);
        node.position = cc.v2(0, -this.scrollViewContent.children.length * 40);
        node.getComponent('scrollviewcell').init({ bezierId: i });
    }

    showBezier(id: string) {
        console.log('show bezier id = ' + id);
        let bezierId = id;
        this.currentBezierId = bezierId;
        let posList = this.bezierConfig[bezierId];
        console.log('pos list = ' + posList.length);
        this.removeControllerPoint();
        for (let i = 0; i < posList.length; i++) {
            this.addPoint(posList[i]);
        }
    }

    removeControllerPoint() {
        for (let i = 0; i < this.controlPointList.length; i++) {
            this.controlPointList[i].destroy();
        }
        for (let i = 0; i < this.linePointList.length; i++) {
            this.node.removeChild(this.linePointList[i]);
        }
        this.controlPointList = [];
    }

    addPoint(touchPos: cc.Vec2) {
        console.log("pos =" + JSON.stringify(touchPos));
        let point = cc.instantiate(this.controlPointPrefab);
        point.parent = this.node.parent;
        point.position = touchPos;
        this.controlPointList.push(point);
    }

    saveBezier() {
        if (this.currentBezierId === undefined) {
            return;
        }
        let config = [];
        for (let i = 0; i < this.controlPointList.length; i++) {
            config.push({
                x: this.controlPointList[i].position.x,
                y: this.controlPointList[i].position.y,
            });
        }
        this.bezierConfig[this.currentBezierId] = config;
    }

    update(dt: any) {
        if (this.controlPointList === undefined) {
            this.controlPointList = [];
        }
        if (this.controlPointList.length !== 0) {
            let bezier = new Bezier(this.controlPointList, 4000, 10);
            let pointList = bezier.getPoints();

            for (let i in this.linePointList) {
                this.node.removeChild(this.linePointList[i]);
            }
            this.linePointList = [];
            for (let i = 0; i < pointList.length; i++) {
                let point: cc.Node;
                if (i < this.pointPool.length) {
                    point = this.pointPool[i];
                } else {
                    point = cc.instantiate(this.pointPrefab);
                    this.pointPool.push(point);
                }
                point.parent = this.node;
                point.position = pointList[i];
                this.linePointList.push(point);
            }
        }
    }

    buttonClick(event: any, coustomData: any) {
        switch (coustomData) {
            case "BUILD":
                if (cc.sys.isBrowser) {
                    this.saveBezier();
                    let textToWrite = JSON.stringify(this.bezierConfig);
                    let textFileAsBlob = new Blob([textToWrite], {type: "application/json"});
                    let fileNameToSaveAs = "bezierconfig.json";
                    let downloadLink = document.createElement("a");
                    downloadLink.download = fileNameToSaveAs;
                    downloadLink.innerHTML = "Download File";
                    if (window.URL != null) {
                        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    } else {
                        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                        // downloadLink.onclick = destroyClickedElement;
                        downloadLink.style.display = "none";
                        document.body.appendChild(downloadLink);
                    }

                    downloadLink.click();
                }
                break;
            case "SAVE":
                this.saveBezier();
                break;
            case "NEW":
                this.newBezier();
                break;
            case "DELETE":
                this.removeControllerPoint();
                this.removeScrollViewCell(this.currentBezierId);
                let config = {};
                for (let i in this.bezierConfig) {
                    if (i !== this.currentBezierId) {
                        config[i] = this.bezierConfig[i];
                    }
                }
                this.bezierConfig = config;
                this.currentBezierId = undefined;
                console.log('bezier config = ' + JSON.stringify(this.bezierConfig));
                break;
            default:
                break;
        }
    }
    removeScrollViewCell(id: string) {
        for (let i = 0; i < this.scrollViewContent.children.length; i++) {
            let cell  = this.scrollViewContent.children[i];
            if (cell.getComponent("scrollviewcell").getCellId() === id) {
                this.scrollViewContent.removeChild(cell);
            }
        }

        for (let i = 0; i < this.scrollViewContent.children.length; i++) {
            let cell = this.scrollViewContent.children[i];
            cell.position = cc.v2(0, -(i + 1) * 40);
        }
    }
    newBezier() {
        let str = 'bezier_id_1';
        let num = this.getDeletion(this.bezierConfig);
        let newBezierId = str.substring(0, 10) + num;
        this.bezierConfig[newBezierId] = [];
        this.addScrollViewCell(newBezierId);
        this.showBezier(newBezierId);
    }
    getDeletion(bezierConfig: any) {
        let keys = Object.keys(bezierConfig);
        keys.sort((a: string, b: string) => {
            let n1 = parseInt(a.substring(10, a.length));
            let n2 = parseInt(b.substring(10, b.length));
            if (n1 > n2) {
                return 1;
            }
            return 0;
        });

        for (let i = 0; i < keys.length; i++) {
            let value = parseInt(keys[i].substring(10, keys[i].length));
            if (i !== value) {
                return i;
            }
        }
        return keys.length;
    }
}
