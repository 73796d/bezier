const {ccclass, property} = cc._decorator;

@ccclass
export default class EditorUI extends cc.Component {
    public isDown_: boolean; // 菜单状态

    onLoad () {
        this.isDown_ = true;
    }

    public buttonClick(event: any, customData: any) {
        switch (customData) {
            case "UP_DOWN":
                this.upDown(event);
                break;
            default:
                break;
        }
    }

    public upDown(event: any) {
        let str = "点我隐藏菜单";
        let offsetY = 520;
        if (this.isDown_) {
            str = "点我出现菜单";
            offsetY = 520;
            this.isDown_ = false;
        } else {
            str = "点我隐藏菜单";
            offsetY = -520;
            this.isDown_ = true;
        }

        let action = cc.moveTo(0.3, this.node.position.x, this.node.position.y + offsetY);
        this.node.runAction(action);

        event.target.getChildByName("Label").getComponent(cc.Label).string = str;
    }
}
